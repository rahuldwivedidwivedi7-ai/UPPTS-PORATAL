import { userRepository, UserRow } from '../repositories/user.repository.js';
import { userDocumentRepository, UserDocumentRow } from '../repositories/user_document.repository.js';
import { AppError } from '../utils/custom-error.js';

export const profileService = {
  async getProfile(userId: string) {
    const user = await userRepository.getProfileWithPersonnel(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const { password_hash, ...safeProfile } = user;
    return safeProfile;
  },

  async updatePersonalInformation(userId: string, data: { mobile_number?: string, email?: string, address?: string, emergency_contact?: string }) {
    await userRepository.updateProfile(userId, {
      mobile_number: data.mobile_number,
      email: data.email,
      address: data.address,
      emergency_contact: data.emergency_contact
    });
    return this.getProfile(userId);
  },

  async updateProfilePhoto(userId: string, file_path: string) {
    await userRepository.updateProfile(userId, { profile_photo_url: file_path });
    return this.getProfile(userId);
  },

  async getDocuments(userId: string) {
    return userDocumentRepository.getDocumentsByUserId(userId);
  },

  async uploadDocument(userId: string, document_type: UserDocumentRow['document_type'], file_name: string, file_path: string) {
    // If user wants to "replace" a document, we can just delete the old one of the same type or simply add a new one.
    // For simplicity, let's keep multiple or let the frontend call delete if replacing.
    // But typically we can just delete existing document of same type.
    const existingDocs = await userDocumentRepository.getDocumentsByUserId(userId);
    const existingDoc = existingDocs.find(d => d.document_type === document_type);
    if (existingDoc) {
      await userDocumentRepository.deleteDocument(existingDoc.document_id, userId);
    }
    
    await userDocumentRepository.createDocument({
      user_id: userId,
      document_type,
      file_name,
      file_path
    });
    
    return this.getDocuments(userId);
  },

  async deleteDocument(userId: string, documentId: string) {
    const success = await userDocumentRepository.deleteDocument(documentId, userId);
    if (!success) {
      throw new AppError('Document not found or access denied', 404);
    }
    return this.getDocuments(userId);
  }
};

export default profileService;
