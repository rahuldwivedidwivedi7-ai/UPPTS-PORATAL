import { Router } from 'express';
import personnelController from '../controllers/personnel.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRoles from '../middlewares/rbac.middleware.js';

const router = Router();

// Protect personnel profile: must be APPLICANT role
router.get(
  '/profile',
  authMiddleware,
  authorizeRoles('APPLICANT'),
  personnelController.getProfile
);

export default router;
