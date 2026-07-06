import { Router } from 'express';
import approvalController from '../controllers/approval.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRoles from '../middlewares/rbac.middleware.js';
import validateRequest from '../middlewares/validation.middleware.js';
import { approvalActionSchema } from '../models/dto/approval.dto.js';

const router = Router();

// Protect all approval endpoints by authMiddleware
router.use(authMiddleware);

// Only administrative SP/ADG reviewers can access approvals
router.use(authorizeRoles('DISTRICT_SP', 'SP_COMPUTER_CENTRE', 'ADG_TECHNICAL_SERVICES'));

// Get list of requests awaiting action for current reviewer
router.get(
  '/pending',
  approvalController.getPendingRequests
);

// Review action processing (recommend, verify, approve, reject, return)
router.post(
  '/:requestId/action',
  validateRequest(approvalActionSchema),
  approvalController.processApprovalAction
);

export default router;
