import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// All profile routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/me', profileController.getProfile);

// Update personal information
router.put('/me', profileController.updatePersonalInformation);

// Upload profile photo
router.post('/photo', upload.single('photo'), profileController.uploadPhoto);

// Document endpoints
router.get('/documents', profileController.getDocuments);
router.post('/documents', upload.single('document'), profileController.uploadDocument);
router.delete('/documents/:documentId', profileController.deleteDocument);

export default router;
