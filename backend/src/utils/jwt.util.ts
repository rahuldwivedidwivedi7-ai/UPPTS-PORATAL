import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload {
  user_id: string;
  username: string;
  role: string;
  personnel_id: string | null;
  district_id: string | null;
}

export const jwtUtil = {
  /**
   * Encodes a payload into a JWT token
   */
  signToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY as any,
    });
  },

  /**
   * Decodes and validates a JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw error;
    }
  }
};
export default jwtUtil;
