import db from '../config/db.js';
import crypto from 'crypto';

export interface HistoryRow {
  approval_id: string;
  request_id: number | string;
  action_by_user_id: string;
  action_by_name: string;
  action_by_role: string;
  action: string;
  from_stage: string;
  to_stage: string;
  remarks: string | null;
  action_ip: string;
  action_date: Date;
}

export const historyRepository = {
  /**
   * Log a new approval action step
   */
  async create(data: {
    request_id: number | string;
    action_by_user_id: string;
    action: string;
    from_stage: string;
    to_stage: string;
    remarks: string | null;
    action_ip: string;
  }): Promise<void> {
    const approvalId = crypto.randomUUID();
    const query = `
      INSERT INTO approval_history (
        approval_id, request_id, action_by_user_id, action, from_stage, to_stage, remarks, action_ip
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      approvalId,
      data.request_id,
      data.action_by_user_id,
      data.action,
      data.from_stage,
      data.to_stage,
      data.remarks,
      data.action_ip
    ]);
  },

  /**
   * Fetch complete history timeline for a request
   */
  async findByRequestId(requestId: number | string): Promise<HistoryRow[]> {
    const query = `
      SELECT 
        ah.approval_id,
        ah.request_id,
        ah.action_by_user_id,
        COALESCE(p.name, u.username) AS action_by_name,
        u.role AS action_by_role,
        ah.action,
        ah.from_stage,
        ah.to_stage,
        ah.remarks,
        ah.action_ip,
        ah.action_date
      FROM approval_history ah
      JOIN users u ON ah.action_by_user_id = u.user_id
      LEFT JOIN personnel p ON u.personnel_id = p.personnel_id
      WHERE ah.request_id = ?
      ORDER BY ah.action_date ASC
    `;
    const res = await db.query<HistoryRow>(query, [requestId]);
    return res.rows;
  }
};
export default historyRepository;
