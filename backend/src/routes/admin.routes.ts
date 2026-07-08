import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRoles from '../middlewares/rbac.middleware.js';

const router = Router();

// Protect all admin endpoints under authMiddleware
router.use(authMiddleware);

// Only Super Admin role is permitted
router.use(authorizeRoles('SUPER_ADMIN'));

// Get system metrics dashboard
router.get(
  '/stats',
  adminController.getStats
);

// Get audit logs ledger
router.get(
  '/audit-logs',
  adminController.getAuditLogs
);

// Update user service info
router.put(
  '/users/:userId/service',
  adminController.updateServiceInfo
);

// Verify user document
router.put(
  '/documents/:documentId/verify',
  adminController.verifyDocument
);

export default router;
