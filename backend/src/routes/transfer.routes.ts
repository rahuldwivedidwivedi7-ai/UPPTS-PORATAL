import { Router } from 'express';
import transferController from '../controllers/transfer.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRoles from '../middlewares/rbac.middleware.js';
import validateRequest from '../middlewares/validation.middleware.js';
import { createRequestSchema, updateRequestSchema } from '../models/dto/transfer.dto.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Protect all routes under this module by authMiddleware
router.use(authMiddleware);

// Operator Create Transfer Request
router.post(
  '/',
  authorizeRoles('COMPUTER_OPERATOR'),
  validateRequest(createRequestSchema),
  transferController.createRequest
);

// Operator Fetch My Applications
router.get(
  '/my',
  authorizeRoles('COMPUTER_OPERATOR'),
  transferController.getMyRequests
);

// Fetch Request Details (Available to Operators, District SP, SP CC, ADG)
router.get(
  '/:id',
  transferController.getRequestDetail
);

// Operator Edit Draft/Returned Request
router.put(
  '/:id',
  authorizeRoles('COMPUTER_OPERATOR'),
  validateRequest(updateRequestSchema),
  transferController.updateRequest
);

// Operator Submit Draft Request
router.post(
  '/:id/submit',
  authorizeRoles('COMPUTER_OPERATOR'),
  transferController.submitDraft
);

// Operator Upload Attachments (Max 5MB PDF/Image)
router.post(
  '/:id/upload',
  authorizeRoles('COMPUTER_OPERATOR'),
  upload.single('file'),
  transferController.uploadDocument
);

export default router;
