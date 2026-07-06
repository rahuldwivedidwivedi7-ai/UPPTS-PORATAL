import { Request, Response, NextFunction } from 'express';
import approvalService from '../services/approval.service.js';
import { UnauthorizedError } from '../utils/custom-error.js';

export const approvalController = {
  /**
   * GET /approvals/pending
   */
  async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      const requests = await approvalService.getPendingRequests(
        req.user.user_id,
        req.user.role,
        req.user.district_id
      );

      res.status(200).json({
        success: true,
        message: 'Pending reviews retrieved successfully.',
        count: requests.length,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /approvals/:requestId/action
   */
  async processApprovalAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await approvalService.processApprovalAction(
        req.user.user_id,
        req.user.role,
        req.user.district_id,
        req.params.requestId,
        req.body,
        clientIp
      );

      res.status(200).json({
        success: true,
        message: `Workflow action '${req.body.action}' processed successfully.`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};
export default approvalController;
