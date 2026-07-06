import { Router } from 'express';
import districtController from '../controllers/district.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Protect districts lookup: any authenticated user role can query it
router.get(
  '/',
  authMiddleware,
  districtController.getDistricts
);

export default router;
