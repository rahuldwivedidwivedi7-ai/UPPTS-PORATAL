import db from '../config/db.js';
import crypto from 'crypto';

export interface UserDocumentRow {
  document_id: string;
  user_id: string;
  document_type: 'AADHAAR' | 'SERVICE_CERTIFICATE' | 'MEDICAL_CERTIFICATE' | 'SPOUSE_POSTING' | 'DISABILITY' | 'OTHER';
  file_name: string;
  file_path: string;
  is_verified: boolean;
  uploaded_at: Date;
}

export const userDocumentRepository = {
  async createDocument(data: Omit<UserDocumentRow, 'document_id' | 'is_verified' | 'uploaded_at'>): Promise<string> {
    const documentId = crypto.randomUUID();
    const query = `
      INSERT INTO user_documents (document_id, user_id, document_type, file_name, file_path)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      documentId,
      data.user_id,
      data.document_type,
      data.file_name,
      data.file_path
    ]);
    return documentId;
  },

  async getDocumentsByUserId(userId: string): Promise<UserDocumentRow[]> {
    const query = `
      SELECT document_id, user_id, document_type, file_name, file_path, is_verified, uploaded_at
      FROM user_documents
      WHERE user_id = ?
      ORDER BY uploaded_at DESC
    `;
    const res = await db.query<UserDocumentRow>(query, [userId]);
    return res.rows;
  },

  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    const query = `DELETE FROM user_documents WHERE document_id = ? AND user_id = ?`;
    const res = await db.query(query, [documentId, userId]);
    return ((res.rows as any).affectedRows || 0) > 0;
  },
  
  async getDocumentById(documentId: string): Promise<UserDocumentRow | null> {
    const query = `SELECT * FROM user_documents WHERE document_id = ?`;
    const res = await db.query<UserDocumentRow>(query, [documentId]);
    return res.rows[0] || null;
  },

  async updateVerificationStatus(documentId: string, isVerified: boolean): Promise<boolean> {
    const query = `UPDATE user_documents SET is_verified = ? WHERE document_id = ?`;
    const res = await db.query(query, [isVerified, documentId]);
    return ((res.rows as any).affectedRows || 0) > 0;
  }
};
