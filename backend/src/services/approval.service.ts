import approvalRepository from '../repositories/approval.repository.js';
import transferRepository from '../repositories/transfer.repository.js';
import historyRepository from '../repositories/history.repository.js';
import db from '../config/db.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/custom-error.js';
import auditLogger from '../utils/audit.js';
import crypto from 'crypto';

export const approvalService = {
  /**
   * Get all pending transfer requests awaiting action for the logged-in administrative reviewer
   */
  async getPendingRequests(userId: string, role: string, districtId: string | null) {
    if (role === 'DISTRICT_ADMIN') {
      if (!districtId) throw new AppError('District Admin must have an assigned district.', 400);
      return await approvalRepository.findPendingByStage('DISTRICT_ADMIN_SCRUTINY', districtId);
    }
    if (role === 'DISTRICT_SP') {
      if (!districtId) throw new AppError('District SP must have an assigned district.', 400);
      return await approvalRepository.findPendingByStage('DISTRICT_SP_APPROVAL', districtId);
    }
    if (role === 'TS_UPCC_ADMIN') {
      return await approvalRepository.findPendingByStage('TS_ADMIN_VERIFICATION');
    }
    if (role === 'TS_UPCC_SP') {
      return await approvalRepository.findPendingByStage('SP_TS_APPROVAL');
    }
    if (role === 'TS_DIG_IG') {
      return await approvalRepository.findPendingByStage('DIG_IG_APPROVAL');
    }
    if (role === 'TSHQ_ADMIN') {
      return await approvalRepository.findPendingByStage('TSHQ_ADMIN_SCRUTINY');
    }
    if (role === 'ADG_TS') {
      return await approvalRepository.findPendingByStage('ADG_FINAL_DECISION');
    }

    throw new ForbiddenError('Access denied: You are not authorized to view pending reviews.');
  },

  /**
   * Action a pending transfer request (Recommend, Verify, Approve, Reject, or Return)
   */
  async processApprovalAction(
    userId: string,
    role: string,
    districtId: string | null,
    requestId: string,
    data: {
      action: 'RECOMMEND' | 'VERIFY' | 'APPROVE' | 'REJECT' | 'RETURN';
      remarks: string;
    },
    clientIp: string
  ) {
    // 1. Fetch request details
    const request = await transferRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Transfer request not found.');
    }

    if (request.status !== 'PENDING') {
      throw new AppError('This request is not in a pending state and cannot be reviewed.', 400);
    }

    const currentStage = request.current_stage;
    let nextStage: string;
    let nextStatus: string = 'PENDING';

    const handleNegativeAction = (action: string) => {
      if (action === 'REJECT') {
        return { stage: 'REJECTED', status: 'REJECTED' };
      }
      if (action === 'RETURN') {
        return { stage: 'DRAFT', status: 'RETURNED' };
      }
      return null;
    };

    // 2. Role and State workflow engine authorization checks
    if (role === 'ADMIN') {
      if (currentStage !== 'ADMIN_VERIFICATION') throw new AppError('Request is not at Admin Verification stage.', 400);
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'VERIFY') nextStage = 'DISTRICT_SP_APPROVAL';
      else throw new AppError(`Action ${data.action} is not permitted for Admin.`, 400);
    }
    else if (role === 'DISTRICT_SP') {
      if (currentStage !== 'DISTRICT_SP_APPROVAL') throw new AppError('Request is not at District SP stage.', 400);
      if (!districtId || request.source_district_id !== districtId) {
        throw new ForbiddenError('Access denied: You can only action requests originating from your district.');
      }
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'RECOMMEND') nextStage = 'SP_UPPCC_APPROVAL';
      else throw new AppError(`Action ${data.action} is not permitted for District SP.`, 400);
    } 
    else if (role === 'SP_COMPUTER_CENTRE') {
      if (currentStage !== 'SP_UPPCC_APPROVAL') throw new AppError('Request is not at SP UPPCC stage.', 400);
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'RECOMMEND' || data.action === 'VERIFY') nextStage = 'IG_TS_APPROVAL';
      else throw new AppError(`Action ${data.action} is not permitted for SP Computer Centre.`, 400);
    } 
    else if (role === 'IG_TECHNICAL_SERVICES') {
      if (currentStage !== 'IG_TS_APPROVAL') throw new AppError('Request is not at IG TS stage.', 400);
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'RECOMMEND' || data.action === 'VERIFY') nextStage = 'HQ_REVIEW';
      else throw new AppError(`Action ${data.action} is not permitted for IG Tech Services.`, 400);
    }
    else if (role === 'HQ_REVIEWER') {
      if (currentStage !== 'HQ_REVIEW') throw new AppError('Request is not at HQ Review stage.', 400);
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'RECOMMEND' || data.action === 'VERIFY') nextStage = 'FINAL_APPROVAL';
      else throw new AppError(`Action ${data.action} is not permitted for HQ Reviewer.`, 400);
    }
    else if (role === 'ADG_TECHNICAL_SERVICES') {
      if (currentStage !== 'FINAL_APPROVAL') throw new AppError('Request is not at ADG Final Approval stage.', 400);
      const neg = handleNegativeAction(data.action);
      if (neg) { nextStage = neg.stage; nextStatus = neg.status; }
      else if (data.action === 'APPROVE') { nextStage = 'APPROVED'; nextStatus = 'APPROVED'; }
      else throw new AppError(`Action ${data.action} is not permitted for ADG Technical Services.`, 400);
    } 
    else {
      throw new ForbiddenError('Access denied: Unauthorized role.');
    }

    let generatedOrderNumber: string | undefined = undefined;

    // 3. Persist workflow stage update and approval history log (transactional pool)
    const client = await db.getClient();
    try {
      await client.beginTransaction();

      // Update transfer request state
      await client.query(
        `UPDATE transfer_requests 
         SET current_stage = ?, status = ?, updated_at = NOW() 
         WHERE request_id = ?`,
        [nextStage, nextStatus, requestId]
      );

      // Record in history log
      const approvalId = crypto.randomUUID();
      await client.query(
        `INSERT INTO approval_history (
          approval_id, request_id, action_by_user_id, action, from_stage, to_stage, remarks, action_ip
         ) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [approvalId, requestId, userId, data.action, currentStage, nextStage, data.remarks, clientIp]
      );

      // 4. If action is APPROVED, generate a Transfer Order and update Operator's active district
      if (data.action === 'APPROVE') {
        const orderNumber = `UPP/TS/TO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
        generatedOrderNumber = orderNumber;
        const orderId = crypto.randomUUID();
        
        // Create transfer order
        await client.query(
          `INSERT INTO transfer_orders (order_id, request_id, order_number, order_date, signed_by, remarks)
           VALUES (?, ?, ?, NOW(), ?, ?)`,
          [orderId, requestId, orderNumber, userId, `Approved by ADG Technical Services. Remarks: ${data.remarks}`]
        );

        // Update operator current district assignment to target district
        await client.query(
          `UPDATE personnel
           SET current_district_id = ?, updated_at = NOW()
           WHERE personnel_id = ?`,
          [request.preference_1_district_id, request.personnel_id]
        );
      }

      await client.commit();
    } catch (err) {
      await client.rollback();
      throw err;
    } finally {
      client.release();
    }

    auditLogger.log(
      userId,
      `WORKFLOW_${data.action}`,
      `Reviewer executed action ${data.action} on request ${requestId}. Stage transitioned from ${currentStage} to ${nextStage}`,
      clientIp
    );

    return {
      request_id: requestId,
      previous_stage: currentStage,
      new_stage: nextStage,
      status: nextStatus,
      order_number: generatedOrderNumber
    };
  }
};
export default approvalService;
