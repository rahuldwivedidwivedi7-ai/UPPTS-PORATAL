import db from '../config/db.js';

import crypto from 'crypto';

export const auditLogger = {
  /**
   * Log a security or business event into the database audit_logs table
   */
  async log(
    userId: string | null,
    action: string,
    details: string,
    ipAddress: string
  ): Promise<void> {
    try {
      const logId = crypto.randomUUID();
      const query = `
        INSERT INTO audit_logs (log_id, user_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?)
      `;
      // Run as fire-and-forget background query to avoid blocking main service responses
      db.query(query, [logId, userId, action, details, ipAddress]).catch(err => {
        console.error('Failed to write database audit log entry:', err);
      });
    } catch (e) {
      console.error('Audit logger unexpected exception:', e);
    }
  }
};
export default auditLogger;
