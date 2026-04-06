import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export const recordCategories = [
  'SALARY',
  'INVESTMENT',
  'FREELANCE',
  'OTHER_INCOME',
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'EDUCATION',
  'SHOPPING',
  'HOUSING',
  'INSURANCE',
  'OTHER_EXPENSE',
] as const;

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum(recordCategories),
  date: z.string().datetime({ message: 'Invalid date format' }),
  description: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.enum(recordCategories).optional(),
  date: z.string().datetime({ message: 'Invalid date format' }).optional(),
  description: z.string().max(255).nullish(),
  notes: z.string().max(1000).nullish(),
});

export const recordFiltersSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordFiltersInput = z.infer<typeof recordFiltersSchema>;
