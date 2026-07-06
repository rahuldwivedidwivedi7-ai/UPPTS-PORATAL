import { Request, Response, NextFunction } from 'express';
import transferService from '../services/transfer.service.js';
import { UnauthorizedError } from '../utils/custom-error.js';

export const transferController = {
  /**
   * POST /transfer-requests
   */
  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Administrative users cannot submit transfer requests.');
      }
      
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const request = await transferService.createRequest(
        req.user.personnel_id,
        req.user.user_id,
        req.body,
        clientIp
      );

      res.status(201).json({
        success: true,
        message: req.body.action === 'DRAFT' 
          ? 'Transfer request saved as draft.' 
          : 'Transfer request submitted successfully.',
        data: request
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /transfer-requests/my
   */
  async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Administrative users do not possess personal requests history.');
      }

      const requests = await transferService.getMyRequests(req.user.personnel_id);
      
      res.status(200).json({
        success: true,
        message: 'Personal transfer requests retrieved.',
        data: requests
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /transfer-requests/:id
   */
  async getRequestDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      const request = await transferService.getRequestDetail(
        req.user.user_id,
        req.user.role,
        req.user.personnel_id,
        req.params.id
      );

      res.status(200).json({
        success: true,
        message: 'Request details retrieved successfully.',
        data: request
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /transfer-requests/:id
   */
  async updateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Administrative users cannot modify Operator requests.');
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const updatedRequest = await transferService.updateRequest(
        req.user.personnel_id,
        req.user.user_id,
        req.params.id,
        req.body,
        clientIp
      );

      res.status(200).json({
        success: true,
        message: req.body.action === 'SUBMIT'
          ? 'Transfer request updated and submitted.'
          : 'Transfer request draft updated.',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /transfer-requests/:id/submit
   */
  async submitDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Only Operators can submit requests.');
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await transferService.submitDraft(
        req.user.personnel_id,
        req.user.user_id,
        req.params.id,
        clientIp
      );

      res.status(200).json({
        success: true,
        message: 'Draft request submitted successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /transfer-requests/:id/upload
   */
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Only Operators can upload supporting files.');
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file attachment detected. Please upload a valid document.'
        });
        return;
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const doc = await transferService.uploadDocument(
        req.user.personnel_id,
        req.user.user_id,
        req.params.id,
        req.file,
        clientIp
      );

      res.status(201).json({
        success: true,
        message: 'Supporting file attached successfully.',
        data: doc
      });
    } catch (error) {
      next(error);
    }
  }
};
export default transferController;
