import db from '../config/db.js';
import crypto from 'crypto';

export interface TransferRequestRow {
  request_id: number | string;
  personnel_id: string;
  source_district_id: string;
  preference_1_district_id: string;
  preference_2_district_id: string | null;
  preference_3_district_id: string | null;
  transfer_category: string;
  reason: string;
  current_stage: 'DRAFT' | 'ADMIN_VERIFICATION' | 'DISTRICT_SP_APPROVAL' | 'SP_UPPCC_APPROVAL' | 'IG_TS_APPROVAL' | 'HQ_REVIEW' | 'FINAL_APPROVAL' | 'APPROVED' | 'REJECTED';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  application_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DetailedRequestRow extends TransferRequestRow {
  operator_name: string;
  operator_pno: string;
  operator_grade: string;
  operator_designation: string;
  source_district_name: string;
  source_district_code: string;
  preference_1_district_name: string;
  preference_1_district_code: string;
  preference_2_district_name: string | null;
  preference_2_district_code: string | null;
  preference_3_district_name: string | null;
  preference_3_district_code: string | null;
}

export const transferRepository = {
  /**
   * Insert new transfer request
   */
  async create(data: {
    personnel_id: string;
    source_district_id: string;
    preference_1_district_id: string;
    preference_2_district_id: string | null;
    preference_3_district_id: string | null;
    transfer_category: string;
    reason: string;
    current_stage: string;
    status: string;
    application_date: Date | null;
  }): Promise<TransferRequestRow> {
    const requestId = crypto.randomUUID();
    const query = `
      INSERT INTO transfer_requests (
        request_id, personnel_id, source_district_id, 
        preference_1_district_id, preference_2_district_id, preference_3_district_id,
        transfer_category, reason, current_stage, status, application_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const res = await db.query(query, [
      requestId,
      data.personnel_id,
      data.source_district_id,
      data.preference_1_district_id,
      data.preference_2_district_id,
      data.preference_3_district_id,
      data.transfer_category,
      data.reason,
      data.current_stage,
      data.status,
      data.application_date
    ]);
    
    // Now get the newly inserted row by ID
    const newRequest = await this.findById(requestId);
    if (!newRequest) throw new Error('Failed to retrieve created request');
    return newRequest;
  },

  /**
   * Find request by ID
   */
  async findById(requestId: string): Promise<DetailedRequestRow | null> {
    const query = `
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
      WHERE tr.request_id = ?
    `;
    const res = await db.query<DetailedRequestRow>(query, [requestId]);
    return res.rows[0] || null;
  },

  /**
   * Get all transfer requests submitted by a specific computer operator
   */
  async findByOperatorId(personnelId: string): Promise<DetailedRequestRow[]> {
    const query = `
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
      WHERE tr.personnel_id = ?
      ORDER BY tr.created_at DESC
    `;
    const res = await db.query<DetailedRequestRow>(query, [personnelId]);
    return res.rows;
  },

  /**
   * Update request content fields (allowed only in DRAFT or RETURNED status)
   */
  async update(
    requestId: string,
    data: {
      preference_1_district_id?: string;
      preference_2_district_id?: string | null;
      preference_3_district_id?: string | null;
      transfer_category?: string;
      reason?: string;
      current_stage?: string;
      status?: string;
      application_date?: Date | null;
    }
  ): Promise<TransferRequestRow> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    });

    values.push(requestId);
    const query = `
      UPDATE transfer_requests
      SET ${fields.join(', ')},
          updated_at = NOW()
      WHERE request_id = ?
    `;
    await db.query(query, values);
    
    // Fetch updated request
    const selectQuery = 'SELECT * FROM transfer_requests WHERE request_id = ?';
    const selectRes = await db.query<TransferRequestRow>(selectQuery, [requestId]);
    return selectRes.rows[0];
  },

  /**
   * Update stage and status of workflow request
   */
  async updateStageAndStatus(
    requestId: string,
    stage: string,
    status: string,
    applicationDate?: Date | null
  ): Promise<void> {
    const dateField = applicationDate !== undefined ? ', application_date = ?' : '';
    const query = `
      UPDATE transfer_requests
      SET current_stage = ?, status = ?, updated_at = NOW() ${dateField}
      WHERE request_id = ?
    `;
    const params = applicationDate !== undefined 
      ? [stage, status, applicationDate, requestId] 
      : [stage, status, requestId];
      
    await db.query(query, params);
  }
};
export default transferRepository;
