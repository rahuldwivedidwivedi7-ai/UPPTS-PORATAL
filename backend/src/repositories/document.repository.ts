import db from '../config/db.js';
import crypto from 'crypto';

export interface DocumentRow {
  document_id: string;
  request_id: number | string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
}

export const documentRepository = {
  /**
   * Insert new supporting document record
   */
  async create(data: {
    request_id: number | string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }): Promise<DocumentRow> {
    const documentId = crypto.randomUUID();
    const query = `
      INSERT INTO documents (document_id, request_id, file_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      documentId,
      data.request_id,
      data.file_name,
      data.file_path,
      data.file_size,
      data.mime_type
    ]);

    return {
      document_id: documentId,
      request_id: data.request_id,
      file_name: data.file_name,
      file_path: data.file_path,
      file_size: data.file_size,
      mime_type: data.mime_type,
      uploaded_at: new Date()
    };
  },

  /**
   * Fetch all documents for a given request ID
   */
  async findByRequestId(requestId: number | string): Promise<DocumentRow[]> {
    const query = `
      SELECT document_id, request_id, file_name, file_path, file_size, mime_type, uploaded_at
      FROM documents
      WHERE request_id = ?
      ORDER BY uploaded_at ASC
    `;
    const res = await db.query<DocumentRow>(query, [requestId]);
    return res.rows;
  }
};
export default documentRepository;
