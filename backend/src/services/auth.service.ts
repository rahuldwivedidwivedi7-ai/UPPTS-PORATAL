import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import userRepository, { UserRow } from '../repositories/user.repository.js';
import { AppError } from '../utils/custom-error.js';
import jwtUtil from '../utils/jwt.util.js';
import auditLogger from '../utils/audit.js';
import { RegisterInput, ForgotPasswordInput } from '../models/dto/auth.dto.js';
import crypto from 'crypto';

export const authService = {
  /**
   * Standard Password Login
   */
  async login(username: string, password: string, clientIp: string): Promise<{ token: string; user: any }> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid username or password', 400);
    }

    const now = new Date();

    if (user.status === 'LOCKED') {
      if (user.lockout_until && now > user.lockout_until) {
        await userRepository.resetLoginAttempts(user.user_id);
        user.status = 'ACTIVE';
        user.failed_login_attempts = 0;
      } else {
        const lockoutTimeRemaining = user.lockout_until
          ? Math.ceil((user.lockout_until.getTime() - now.getTime()) / 60000)
          : 15;
        auditLogger.log(user.user_id, 'LOGIN_LOCKED', `Brute force guard blocked login check for user: ${username}`, clientIp);
        throw new AppError(`Account is temporarily locked. Try again in ${lockoutTimeRemaining} minutes.`, 403);
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const attempts = await userRepository.incrementFailedAttempts(user.user_id);
      auditLogger.log(user.user_id, 'LOGIN_FAILED', `Password verification failed. (Attempts: ${attempts}/5)`, clientIp);
      
      if (attempts >= 5) {
        const lockoutUntil = new Date(now.getTime() + 15 * 60 * 1000);
        await userRepository.lockAccount(user.user_id, lockoutUntil);
        auditLogger.log(user.user_id, 'ACCOUNT_LOCKOUT', `Brute force guard locked user account ${username}`, clientIp);
        throw new AppError('Too many failed login attempts. Account locked for 15 minutes.', 403);
      }
      throw new AppError('Invalid username or password', 400);
    }

    await userRepository.resetLoginAttempts(user.user_id);

    const token = jwtUtil.signToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      personnel_id: user.personnel_id,
      district_id: user.district_id,
    });

    auditLogger.log(user.user_id, 'LOGIN_SUCCESS', `User ${username} successfully established session.`, clientIp);

    return {
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        name: user.full_name || user.username,
        district_id: user.district_id
      }
    };
  },

  /**
   * Register a new user and map them to the personnel table
   */
  async register(data: RegisterInput, clientIp: string): Promise<void> {
    // Check if user already exists
    const existingUser = await userRepository.findByUsername(data.pno_number);
    if (existingUser) {
      throw new AppError('PNO Number is already registered', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userId = crypto.randomUUID();
    const personnelId = crypto.randomUUID();

    // Map home and posting districts to dummy UUIDs or look them up in a real scenario
    // For this demonstration, we assume we need to insert the district if it doesn't exist, 
    // but the db has foreign keys. We will fetch a valid district_id or use a default one.
    const districtRes = await db.query('SELECT district_id FROM districts LIMIT 1');
    const defaultDistrictId = districtRes.rows[0]?.district_id || crypto.randomUUID();

    // Create personnel record to satisfy transfer constraints
    const personnelQuery = `
      INSERT INTO personnel (
        personnel_id, pno, name, grade, designation, date_of_birth, joining_date, home_district_id, current_district_id, current_posting, mobile_number, email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(personnelQuery, [
      personnelId, data.pno_number, data.full_name, 'GRADE_A', 'Computer Operator Grade A', data.dob, new Date(), defaultDistrictId, defaultDistrictId, data.posting_district, data.mobile_number, data.email, 'ACTIVE'
    ]);

    // Create user record
    await userRepository.createUser({
      user_id: userId,
      personnel_id: personnelId,
      district_id: defaultDistrictId,
      username: data.pno_number,
      pno_number: data.pno_number,
      full_name: data.full_name,
      father_name: data.father_name,
      dob: new Date(data.dob),
      gender: data.gender as any,
      rank: data.rank,
      posting_district: data.posting_district,
      password_hash: passwordHash,
      email: data.email,
      mobile_number: data.mobile_number,
      role: 'APPLICANT'
    });

    auditLogger.log(userId, 'REGISTER_SUCCESS', `User ${data.pno_number} successfully registered.`, clientIp);
  },

  /**
   * Forgot Password
   */
  async forgotPassword(data: ForgotPasswordInput, clientIp: string): Promise<void> {
    const user = await userRepository.findByPnoAndDob(data.pno_number, data.dob);
    if (!user) {
      throw new AppError('Invalid PNO Number or Date of Birth', 400);
    }

    const passwordHash = await bcrypt.hash(data.new_password, 12);
    await userRepository.updatePassword(user.user_id, passwordHash);

    auditLogger.log(user.user_id, 'PASSWORD_RESET', `User ${data.pno_number} successfully reset their password via Forgot Password flow.`, clientIp);
  }
};

export default authService;
