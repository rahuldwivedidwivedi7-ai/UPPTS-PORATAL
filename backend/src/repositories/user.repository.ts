import db from '../config/db.js';

export interface UserRow {
  user_id: string;
  personnel_id: string | null;
  district_id: string | null;
  username: string;
  pno_number: string;
  full_name: string;
  father_name: string;
  dob: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  rank: string;
  posting_district: string;
  password_hash: string;
  email: string;
  mobile_number: string;
  role: 'SUPER_ADMIN' | 'APPLICANT' | 'DISTRICT_ADMIN' | 'DISTRICT_SP' | 'TS_UPCC_ADMIN' | 'TS_UPCC_SP' | 'TS_DIG_IG' | 'TSHQ_ADMIN' | 'ADG_TS';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  failed_login_attempts: number;
  lockout_until: Date | null;
  address?: string | null;
  aadhaar_number?: string | null;
  emergency_contact?: string | null;
  profile_photo_url?: string | null;
  batch_year?: number | null;
  employee_category?: string | null;
  current_posting_date?: Date | null;
  home_district_id?: string | null;
  joining_date?: Date | null;
  reporting_authority_user_id?: string | null;
  deleted_at?: Date | null;
}

export const userRepository = {
  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<UserRow | null> {
    const query = `
      SELECT user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, status, failed_login_attempts, lockout_until, address, aadhaar_number, emergency_contact, profile_photo_url, batch_year, employee_category, current_posting_date, home_district_id, joining_date, reporting_authority_user_id, deleted_at
      FROM users
      WHERE username = ? AND deleted_at IS NULL
    `;
    const res = await db.query<UserRow>(query, [username]);
    return res.rows[0] || null;
  },

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<UserRow | null> {
    const query = `
      SELECT user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, status, failed_login_attempts, lockout_until, address, aadhaar_number, emergency_contact, profile_photo_url, batch_year, employee_category, current_posting_date, home_district_id, joining_date, reporting_authority_user_id, deleted_at
      FROM users
      WHERE user_id = ? AND deleted_at IS NULL
    `;
    const res = await db.query<UserRow>(query, [userId]);
    return res.rows[0] || null;
  },

  /**
   * Get complete user profile by joining personnel
   */
  async getProfileWithPersonnel(userId: string): Promise<any | null> {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.mobile_number,
        u.profile_photo_url,
        u.address,
        u.aadhaar_number,
        u.emergency_contact,
        u.gender,
        u.father_name,
        p.personnel_id,
        COALESCE(p.name, u.full_name) AS name,
        COALESCE(p.name, u.full_name) AS full_name,
        COALESCE(p.pno, u.pno_number) AS pno,
        COALESCE(p.pno, u.pno_number) AS pno_number,
        COALESCE(p.designation, u.rank) AS designation,
        COALESCE(p.designation, u.rank) AS \`rank\`,
        p.grade,
        COALESCE(p.date_of_birth, u.dob) AS date_of_birth,
        COALESCE(p.date_of_birth, u.dob) AS dob,
        COALESCE(p.joining_date, u.joining_date) AS joining_date,
        p.current_district_id AS district_id,
        p.home_district_id,
        p.current_posting AS current_posting,
        p.current_posting AS posting_district,
        u.role,
        u.status,
        u.reporting_authority_user_id
      FROM users u
      LEFT JOIN personnel p ON u.personnel_id = p.personnel_id
      WHERE u.user_id = ? AND u.deleted_at IS NULL
    `;
    const res = await db.query<any>(query, [userId]);
    return res.rows[0] || null;
  },

  /**
   * Find user by PNO Number and Date of Birth
   */
  async findByPnoAndDob(pnoNumber: string, dob: string): Promise<UserRow | null> {
    const query = `
      SELECT user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, status, failed_login_attempts, lockout_until, address, aadhaar_number, emergency_contact, profile_photo_url, batch_year, employee_category, current_posting_date, home_district_id, joining_date
      FROM users
      WHERE pno_number = ? AND dob = ?
    `;
    const res = await db.query<UserRow>(query, [pnoNumber, dob]);
    return res.rows[0] || null;
  },

  /**
   * Create a new user
   */
  async createUser(user: Omit<UserRow, 'failed_login_attempts' | 'lockout_until' | 'status'>): Promise<void> {
    const query = `
      INSERT INTO users (
        user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, reporting_authority_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      user.user_id, user.personnel_id, user.district_id, user.username, user.pno_number,
      user.full_name, user.father_name, user.dob, user.gender, user.rank,
      user.posting_district, user.password_hash, user.email, user.mobile_number, user.role, user.reporting_authority_user_id || null
    ]);
  },

  /**
   * Update user password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const query = `
      UPDATE users
      SET password_hash = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    await db.query(query, [passwordHash, userId]);
  },

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(userId: string): Promise<number> {
    const updateQuery = `
      UPDATE users
      SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW()
      WHERE user_id = ?
    `;
    await db.query(updateQuery, [userId]);

    const selectQuery = `
      SELECT failed_login_attempts FROM users WHERE user_id = ?
    `;
    const res = await db.query<{ failed_login_attempts: number }>(selectQuery, [userId]);
    return res.rows[0].failed_login_attempts;
  },

  /**
   * Lock user account
   */
  async lockAccount(userId: string, lockoutUntil: Date): Promise<void> {
    const query = `
      UPDATE users
      SET status = 'LOCKED', lockout_until = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    await db.query(query, [lockoutUntil, userId]);
  },

  /**
   * Reset failed attempts and unlock account
   */
  async resetLoginAttempts(userId: string): Promise<void> {
    const query = `
      UPDATE users
      SET failed_login_attempts = 0, lockout_until = NULL, status = 'ACTIVE', updated_at = NOW()
      WHERE user_id = ?
    `;
    await db.query(query, [userId]);
  },
  
  /**
   * Update User Profile (Personal Information)
   */
  async updateProfile(userId: string, data: Partial<UserRow>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`\`${key}\` = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) return;
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    values.push(userId);
    
    await db.query(query, values);
  },

  /**
   * Find users with filters (for User Management)
   */
  async findUsers(filters?: { role?: string, status?: string, district_id?: string, search?: string }): Promise<UserRow[]> {
    let query = `
      SELECT user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, status, failed_login_attempts, lockout_until, address, aadhaar_number, emergency_contact, profile_photo_url, batch_year, employee_category, current_posting_date, home_district_id, joining_date, reporting_authority_user_id, deleted_at
      FROM users
      WHERE deleted_at IS NULL
    `;
    const params: any[] = [];

    if (filters) {
      if (filters.role) {
        query += ` AND role = ?`;
        params.push(filters.role);
      }
      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }
      if (filters.district_id) {
        query += ` AND district_id = ?`;
        params.push(filters.district_id);
      }
      if (filters.search) {
        query += ` AND (username LIKE ? OR full_name LIKE ? OR pno_number LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
    }
    
    query += ` ORDER BY created_at DESC`;

    const res = await db.query<UserRow>(query, params);
    return res.rows;
  },

  /**
   * Soft Delete a user
   */
  async softDelete(userId: string): Promise<void> {
    const query = `UPDATE users SET deleted_at = NOW(), status = 'INACTIVE', updated_at = NOW() WHERE user_id = ?`;
    await db.query(query, [userId]);
  }
};

export default userRepository;
