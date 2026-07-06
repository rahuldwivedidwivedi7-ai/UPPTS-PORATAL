import { z } from 'zod';

export const approvalActionSchema = z.object({
  action: z.enum(['RECOMMEND', 'VERIFY', 'APPROVE', 'REJECT', 'RETURN'], {
    required_error: 'Action is required and must be RECOMMEND, VERIFY, APPROVE, REJECT, or RETURN'
  }),
  remarks: z
    .string({ required_error: 'Remarks are required' })
    .trim()
    .min(10, { message: 'Remarks must be at least 10 characters long' })
});

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
