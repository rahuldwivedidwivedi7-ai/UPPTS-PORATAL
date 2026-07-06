import { z } from 'zod';

/**
 * Zod schema to validate login request body
 */
export const loginSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(1, { message: 'Username cannot be empty' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' }),
});

/**
 * Zod schema to validate registration request body
 */
export const registerSchema = z.object({
  pno_number: z.string().trim().regex(/^\d+$/, { message: 'PNO must contain only numbers' }),
  full_name: z.string().trim().min(1, 'Full name is required'),
  father_name: z.string().trim().min(1, 'Father name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be YYYY-MM-DD' }),
  mobile_number: z.string().trim().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits' }),
  email: z.string().trim().email({ message: 'Invalid email address' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  rank: z.string().trim().min(1, 'Rank is required'),
  home_district: z.string().trim().min(1, 'Home district is required'),
  posting_district: z.string().trim().min(1, 'Posting district is required'),
  password: z.string().min(5, { message: 'Password must be at least 5 characters long' }),
  confirm_password: z.string().min(5, { message: 'Confirm password is required' })
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"], // path of error
});

/**
 * Zod schema to validate forgot password request
 */
export const forgotPasswordSchema = z.object({
  pno_number: z.string().trim().min(1, 'PNO is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be YYYY-MM-DD' }),
  new_password: z.string().min(5, { message: 'Password must be at least 5 characters long' }),
  confirm_password: z.string().min(5, { message: 'Confirm password is required' })
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
