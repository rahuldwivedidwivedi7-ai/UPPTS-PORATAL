import { Request, Response, NextFunction } from 'express';
import profileService from '../services/profile.service.js';

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const profile = await profileService.getProfile(userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },

  async updatePersonalInformation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const profile = await profileService.updatePersonalInformation(userId, req.body);
      res.status(200).json({ success: true, message: 'Profile updated successfully', data: profile });
    } catch (error) {
      next(error);
    }
  },

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const filePath = `/uploads/documents/${req.file.filename}`;
      const profile = await profileService.updateProfilePhoto(userId, filePath);
      res.status(200).json({ success: true, message: 'Profile photo updated successfully', data: profile });
    } catch (error) {
      next(error);
    }
  },

  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const documents = await profileService.getDocuments(userId);
      res.status(200).json({ success: true, data: documents });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const { document_type } = req.body;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      if (!document_type) {
        return res.status(400).json({ success: false, message: 'Document type is required' });
      }

      const filePath = `/uploads/documents/${req.file.filename}`;
      const documents = await profileService.uploadDocument(userId, document_type, req.file.originalname, filePath);
      res.status(200).json({ success: true, message: 'Document uploaded successfully', data: documents });
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const { documentId } = req.params;
      const documents = await profileService.deleteDocument(userId, documentId);
      res.status(200).json({ success: true, message: 'Document deleted successfully', data: documents });
    } catch (error) {
      next(error);
    }
  }
};

export default profileController;
