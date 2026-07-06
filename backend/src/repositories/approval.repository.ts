import db from '../config/db.js';
import { DetailedRequestRow } from './transfer.repository.js';

export const approvalRepository = {
  /**
   * Universal fetch pending requests method based on the current stage
   */
  async findPendingByStage(stage: string, districtId?: string): Promise<DetailedRequestRow[]> {
    let query = `
      SELECT 
        tr.*,
        p.name AS operator_name,
        p.pno AS operator_pno,
        p.grade AS operator_grade,
        p.designation AS operator_designation,
        sd.district_name AS source_district_name,
        sd.district_code AS source_district_code,
        p1.district_name AS preference_1_district_name,
        p1.district_code AS preference_1_district_code,
        p2.district_name AS preference_2_district_name,
        p2.district_code AS preference_2_district_code,
        p3.district_name AS preference_3_district_name,
        p3.district_code AS preference_3_district_code
      FROM transfer_requests tr
      JOIN personnel p ON tr.personnel_id = p.personnel_id
      JOIN districts sd ON tr.source_district_id = sd.district_id
      JOIN districts p1 ON tr.preference_1_district_id = p1.district_id
      LEFT JOIN districts p2 ON tr.preference_2_district_id = p2.district_id
      LEFT JOIN districts p3 ON tr.preference_3_district_id = p3.district_id
      WHERE tr.current_stage = ?
        AND tr.status = 'PENDING'
    `;
    const params: any[] = [stage];

    if (districtId) {
      query += ` AND tr.source_district_id = ?`;
      params.push(districtId);
    }

    query += ` ORDER BY tr.application_date ASC`;

    const res = await db.query<DetailedRequestRow>(query, params);
    return res.rows;
  },

  /**
   * Update request workflow stage, status, and log history transaction
   */
  async updateWorkflowStage(
    requestId: string,
    nextStage: string,
    status: string
  ): Promise<void> {
    const query = `
      UPDATE transfer_requests
      SET current_stage = ?,
          status = ?,
          updated_at = NOW()
      WHERE request_id = ?
    `;
    await db.query(query, [nextStage, status, requestId]);
  }
};
export default approvalRepository;
