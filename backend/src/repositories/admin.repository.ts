import db from '../config/db.js';

export interface AuditLogItem {
  log_id: string;
  user_id: string | null;
  username_display: string;
  role: string | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: Date;
}

export const adminRepository = {
  /**
   * Fetch core metrics and statuses counters for the administrator dashboard
   */
  async getStats() {
    const personnelRes = await db.query('SELECT COUNT(*) AS count FROM personnel');
    const requestsRes = await db.query('SELECT COUNT(*) AS count FROM transfer_requests');
    const ordersRes = await db.query('SELECT COUNT(*) AS count FROM transfer_orders');
    
    const statusRes = await db.query(`
      SELECT status, COUNT(*) AS count 
      FROM transfer_requests 
      GROUP BY status
    `);

    // Organize status map
    const statusCounts: Record<string, number> = {
      DRAFT: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      RETURNED: 0
    };

    statusRes.rows.forEach((row: { status: string; count: number }) => {
      statusCounts[row.status] = Number(row.count);
    });

    return {
      total_operators: Number(personnelRes.rows[0].count),
      total_requests: Number(requestsRes.rows[0].count),
      total_orders: Number(ordersRes.rows[0].count),
      status_breakdown: statusCounts
    };
  },

  /**
   * Fetch latest 100 logs from audit_logs table
   */
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const query = `
      SELECT 
        al.log_id,
        al.user_id,
        COALESCE(p.name, u.username, 'System') AS username_display,
        u.role,
        al.action,
        al.details,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN personnel p ON u.personnel_id = p.personnel_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `;
    const res = await db.query<AuditLogItem>(query);
    return res.rows;
  }
};
export default adminRepository;
