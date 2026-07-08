import { Request, Response, NextFunction } from 'express';
import adminRepository from '../repositories/admin.repository.js';
import { UnauthorizedError } from '../utils/custom-error.js';

export const adminController = {
  /**
   * GET /admin/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Access Denied');
      }

      const stats = await adminRepository.getStats();

      res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully.',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/audit-logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Access Denied');
      }

      const logs = await adminRepository.getAuditLogs();

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully.',
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /admin/users/:userId/service
   */
  async updateServiceInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Access denied: Administrator permissions required.');
      }
      const { userId } = req.params;
      
      // Import the userRepository dynamically or use a service
      // Let's require it at the top ideally, but I'll do it inline for simplicity or add to imports
      const { userRepository } = await import('../repositories/user.repository.js');
      
      const updateData = {
        rank: req.body.rank,
        employee_category: req.body.employee_category,
        batch_year: req.body.batch_year,
        current_posting_date: req.body.current_posting_date,
        joining_date: req.body.joining_date
        // Add more fields if needed
      };
      
      await userRepository.updateProfile(userId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Service information updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /admin/documents/:documentId/verify
   */
  async verifyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Access denied: Administrator permissions required.');
      }
      
      const { documentId } = req.params;
      const { is_verified } = req.body;
      
      const { userDocumentRepository } = await import('../repositories/user_document.repository.js');
      
      const success = await userDocumentRepository.updateVerificationStatus(documentId, is_verified);
      
      if (!success) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Document verification status updated.'
      });
    } catch (error) {
      next(error);
    }
  }
};
export default adminController;
