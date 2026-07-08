import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import validateRequest from '../middlewares/validation.middleware.js';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../models/dto/auth.dto.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import rateLimiter from '../middlewares/rate-limiter.js';

const router = Router();

// Login path: enforces rate limits (max 5 login requests per 15 minutes)
router.post(
  '/login',
  rateLimiter(5, 15),
  validateRequest(loginSchema),
  authController.login
);

// Registration path
router.post(
  '/register',
  rateLimiter(5, 15),
  validateRequest(registerSchema),
  authController.register
);

// Forgot Password path
router.post(
  '/forgot-password',
  rateLimiter(5, 15),
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

// Protected logout route
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

// Protected change password route
router.post(
  '/change-password',
  authMiddleware,
  authController.changePassword
);

export default router;
