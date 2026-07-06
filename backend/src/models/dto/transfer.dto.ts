import { z } from 'zod';

/**
 * Zod schema to validate transfer request creation
 */
export const createRequestSchema = z.object({
  preference_1_district_id: z
    .string({ required_error: 'Preference 1 district ID is required' })
    .uuid({ message: 'Preference 1 district ID must be a valid UUID' }),
  preference_2_district_id: z
    .string()
    .uuid({ message: 'Preference 2 district ID must be a valid UUID' })
    .optional()
    .nullable(),
  preference_3_district_id: z
    .string()
    .uuid({ message: 'Preference 3 district ID must be a valid UUID' })
    .optional()
    .nullable(),
  transfer_category: z
    .string({ required_error: 'Transfer category is required' })
    .trim()
    .min(1, { message: 'Transfer category cannot be empty' }),
  reason: z
    .string({ required_error: 'Reason is required' })
    .trim()
    .min(30, { message: 'Reason must be at least 30 characters long' }),
  action: z
    .enum(['DRAFT', 'SUBMIT'], { required_error: 'Action must be DRAFT or SUBMIT' })
    .default('SUBMIT')
}).refine(data => {
  const prefs = [data.preference_1_district_id];
  if (data.preference_2_district_id) prefs.push(data.preference_2_district_id);
  if (data.preference_3_district_id) prefs.push(data.preference_3_district_id);
  
  // Check for duplicates
  return new Set(prefs).size === prefs.length;
}, {
  message: "Preferred districts must be unique.",
  path: ["preference_2_district_id"] // Attach error here generally
});

/**
 * Zod schema to validate transfer request updates
 */
export const updateRequestSchema = z.object({
  preference_1_district_id: z
    .string()
    .uuid({ message: 'Preference 1 district ID must be a valid UUID' })
    .optional(),
  preference_2_district_id: z
    .string()
    .uuid({ message: 'Preference 2 district ID must be a valid UUID' })
    .optional()
    .nullable(),
  preference_3_district_id: z
    .string()
    .uuid({ message: 'Preference 3 district ID must be a valid UUID' })
    .optional()
    .nullable(),
  transfer_category: z
    .string()
    .trim()
    .min(1, { message: 'Transfer category cannot be empty' })
    .optional(),
  reason: z
    .string()
    .trim()
    .min(30, { message: 'Reason must be at least 30 characters long' })
    .optional(),
  action: z
    .enum(['DRAFT', 'SUBMIT'])
    .optional()
}).refine(data => {
  // We only check for duplicates if preference 1 is provided
  // For partial updates, it's safer to rely on DB constraints or validate at DB level,
  // but if they supply all three in an update, we can validate here.
  const prefs = [];
  if (data.preference_1_district_id) prefs.push(data.preference_1_district_id);
  if (data.preference_2_district_id) prefs.push(data.preference_2_district_id);
  if (data.preference_3_district_id) prefs.push(data.preference_3_district_id);
  
  return new Set(prefs).size === prefs.length;
}, {
  message: "Preferred districts must be unique.",
  path: ["preference_2_district_id"]
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
