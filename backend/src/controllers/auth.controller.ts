import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js';
import auditLogger from '../utils/audit.js';

export const authController = {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const data = await authService.login(username, password, clientIp);
      
      res.status(200).json({
        success: true,
        message: 'Login successful. Session established.',
        data
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await authService.register(req.body, clientIp);
      
      res.status(201).json({
        success: true,
        message: 'Registration Successful. Please Login.',
        data: null
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await authService.forgotPassword(req.body, clientIp);
      
      res.status(200).json({
        success: true,
        message: 'Password successfully updated. Please login.',
        data: null
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        auditLogger.log(req.user.user_id, 'LOGOUT', `User ${req.user.username} logged out.`, clientIp);
      }
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { new_password } = req.body;
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      if (!new_password) {
        res.status(400).json({ success: false, message: 'new_password is required' });
        return;
      }
      
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await import('../services/auth.service.js').then(m => m.default.changePassword(req.user!.user_id, new_password, clientIp));
      
      res.status(200).json({
        success: true,
        message: 'Password successfully changed.'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
