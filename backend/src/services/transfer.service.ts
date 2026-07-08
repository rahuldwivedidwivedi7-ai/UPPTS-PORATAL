import transferRepository from '../repositories/transfer.repository.js';
import documentRepository from '../repositories/document.repository.js';
import historyRepository from '../repositories/history.repository.js';
import personnelRepository from '../repositories/personnel.repository.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/custom-error.js';
import auditLogger from '../utils/audit.js';

export const transferService = {
  /**
   * Submit or save a new transfer request
   */
  async createRequest(
    personnelId: string,
    userId: string,
    data: {
      preference_1_district_id: string;
      preference_2_district_id?: string | null;
      preference_3_district_id?: string | null;
      transfer_category: string;
      reason: string;
      action: 'DRAFT' | 'SUBMIT';
    },
    clientIp: string
  ) {
    // 1. Retrieve personnel profile
    const profile = await personnelRepository.findByPersonnelId(personnelId);
    if (!profile) {
      throw new AppError('Operator profile record not found.', 404);
    }

    // 2. Validate preferences against current and home district
    const preferences = [
      data.preference_1_district_id,
      data.preference_2_district_id,
      data.preference_3_district_id
    ].filter(Boolean);

    for (const pref of preferences) {
      if (pref === profile.current_district_id) {
        throw new AppError('Cannot request transfer to your current posting district.', 400);
      }
      if (pref === profile.home_district_id) {
        throw new AppError('Technical Services regulations prohibit transfers to your home district.', 400);
      }
    }

    // 4. Set workflow stage and status based on action
    const isSubmit = data.action === 'SUBMIT';
    const stage = isSubmit ? 'ADMIN_VERIFICATION' : 'DRAFT';
    const status = isSubmit ? 'PENDING' : 'DRAFT';
    const applicationDate = isSubmit ? new Date() : null;

    // 5. Create request record in DB
    const request = await transferRepository.create({
      personnel_id: personnelId,
      source_district_id: profile.current_district_id,
      preference_1_district_id: data.preference_1_district_id,
      preference_2_district_id: data.preference_2_district_id || null,
      preference_3_district_id: data.preference_3_district_id || null,
      transfer_category: data.transfer_category,
      reason: data.reason,
      current_stage: stage,
      status: status,
      application_date: applicationDate
    });

    // 6. Log submit action in history
    if (isSubmit) {
      await historyRepository.create({
        request_id: request.request_id,
        action_by_user_id: userId,
        action: 'SUBMIT',
        from_stage: 'DRAFT',
        to_stage: 'ADMIN_VERIFICATION',
        remarks: 'Initial submission',
        action_ip: clientIp
      });
    }

    auditLogger.log(
      userId,
      isSubmit ? 'TRANSFER_REQUEST_SUBMITTED' : 'TRANSFER_REQUEST_DRAFTED',
      `Operator created transfer request ${request.request_id} (Category: ${data.transfer_category})`,
      clientIp
    );

    return request;
  },

  /**
   * Get all requests submitted by the logged-in Operator
   */
  async getMyRequests(personnelId: string) {
    return await transferRepository.findByOperatorId(personnelId);
  },

  /**
   * Fetch detailed request representation with history timeline and attachments
   */
  async getRequestDetail(userId: string, userRole: string, personnelId: string | null, requestId: string) {
    const request = await transferRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Transfer request not found.');
    }

    // Access control check: Operators can only access their own requests
    if (userRole === 'APPLICANT' && request.personnel_id !== personnelId) {
      throw new ForbiddenError('Access denied: You cannot view requests belonging to other personnel.');
    }

    // Fetch related timeline logs
    const history = await historyRepository.findByRequestId(requestId);

    // Fetch related attachments
    const documents = await documentRepository.findByRequestId(requestId);

    return {
      ...request,
      history,
      documents
    };
  },

  /**
   * Update request content (only permitted if status is DRAFT or RETURNED)
   */
  async updateRequest(
    personnelId: string,
    userId: string,
    requestId: string,
    data: {
      preference_1_district_id?: string;
      preference_2_district_id?: string | null;
      preference_3_district_id?: string | null;
      transfer_category?: string;
      reason?: string;
      action?: 'DRAFT' | 'SUBMIT';
    },
    clientIp: string
  ) {
    const request = await transferRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Transfer request not found.');
    }

    // Verify ownership
    if (request.personnel_id !== personnelId) {
      throw new ForbiddenError('You can only update your own requests.');
    }

    // Enforce modification lock logic
    if (request.status !== 'DRAFT' && request.status !== 'RETURNED') {
      throw new AppError('Only drafts or returned requests can be updated.', 400);
    }

    const profile = await personnelRepository.findByPersonnelId(personnelId);
    if (!profile) {
      throw new AppError('Operator profile record not found.', 404);
    }

    const updatePayload: any = {};

    // Validate district limits if they are changing
    const prefsToCheck = [];
    if (data.preference_1_district_id) {
      prefsToCheck.push(data.preference_1_district_id);
      updatePayload.preference_1_district_id = data.preference_1_district_id;
    }
    if (data.preference_2_district_id !== undefined) {
      if (data.preference_2_district_id) prefsToCheck.push(data.preference_2_district_id);
      updatePayload.preference_2_district_id = data.preference_2_district_id;
    }
    if (data.preference_3_district_id !== undefined) {
      if (data.preference_3_district_id) prefsToCheck.push(data.preference_3_district_id);
      updatePayload.preference_3_district_id = data.preference_3_district_id;
    }

    for (const pref of prefsToCheck) {
      if (pref === profile.current_district_id) {
        throw new AppError('Cannot request transfer to your current posting district.', 400);
      }
      if (pref === profile.home_district_id) {
        throw new AppError('Technical Services regulations prohibit transfers to your home district.', 400);
      }
    }

    if (data.transfer_category !== undefined) updatePayload.transfer_category = data.transfer_category;
    if (data.reason !== undefined) updatePayload.reason = data.reason;

    // Check transition trigger
    const isSubmit = data.action === 'SUBMIT';
    const oldStatus = request.status;
    const oldStage = request.current_stage;

    if (isSubmit) {
      updatePayload.current_stage = 'ADMIN_VERIFICATION';
      updatePayload.status = 'PENDING';
      updatePayload.application_date = new Date();
    }

    const updatedRequest = await transferRepository.update(requestId, updatePayload);

    // Log history
    if (isSubmit) {
      await historyRepository.create({
        request_id: requestId,
        action_by_user_id: userId,
        action: 'SUBMIT',
        from_stage: oldStage,
        to_stage: 'ADMIN_VERIFICATION',
        remarks: oldStatus === 'RETURNED' ? 'Resubmitted after correction' : 'Draft submitted',
        action_ip: clientIp
      });
    }

    auditLogger.log(
      userId,
      isSubmit ? 'TRANSFER_REQUEST_SUBMITTED' : 'TRANSFER_REQUEST_UPDATED',
      `Operator updated transfer request ${requestId} (Action: ${data.action || 'DRAFT'})`,
      clientIp
    );

    return updatedRequest;
  },

  /**
   * Submit a draft application
   */
  async submitDraft(personnelId: string, userId: string, requestId: string, clientIp: string) {
    const request = await transferRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Transfer request not found.');
    }

    if (request.personnel_id !== personnelId) {
      throw new ForbiddenError('You can only submit your own requests.');
    }

    if (request.status !== 'DRAFT' && request.status !== 'RETURNED') {
      throw new AppError('Only drafts or returned requests can be submitted.', 400);
    }

    const oldStage = request.current_stage;
    const oldStatus = request.status;

    await transferRepository.updateStageAndStatus(
      requestId,
      'ADMIN_VERIFICATION',
      'PENDING',
      new Date()
    );

    // Log step in history
    await historyRepository.create({
      request_id: requestId,
      action_by_user_id: userId,
      action: 'SUBMIT',
      from_stage: oldStage,
      to_stage: 'ADMIN_VERIFICATION',
      remarks: oldStatus === 'RETURNED' ? 'Resubmitted after correction' : 'Draft submitted',
      action_ip: clientIp
    });

    auditLogger.log(
      userId,
      'TRANSFER_REQUEST_SUBMITTED',
      `Operator submitted draft request ${requestId}`,
      clientIp
    );

    return {
      request_id: requestId,
      status: 'PENDING',
      current_stage: 'ADMIN_VERIFICATION'
    };
  },

  /**
   * Upload supporting files for draft/returned requests
   */
  async uploadDocument(
    personnelId: string,
    userId: string,
    requestId: string,
    file: {
      originalname: string;
      filename: string;
      size: number;
      mimetype: string;
    },
    clientIp: string
  ) {
    const request = await transferRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Transfer request not found.');
    }

    if (request.personnel_id !== personnelId) {
      throw new ForbiddenError('You can only add attachments to your own requests.');
    }

    if (request.status !== 'DRAFT' && request.status !== 'RETURNED') {
      throw new AppError('Attachments can only be added to drafts or returned requests.', 400);
    }

    // Write file parameters to documents table
    const docPath = `/uploads/documents/${file.filename}`;
    const document = await documentRepository.create({
      request_id: requestId,
      file_name: file.originalname,
      file_path: docPath,
      file_size: file.size,
      mime_type: file.mimetype
    });

    auditLogger.log(
      userId,
      'DOCUMENT_ATTACHED',
      `Attached supporting file ${file.originalname} to request ${requestId}`,
      clientIp
    );

    return document;
  }
};
export default transferService;
