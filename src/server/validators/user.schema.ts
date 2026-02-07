import { z } from 'zod'

/** Create user schema (admin creating users) */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*)'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .transform((v) => v.trim()),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .transform((v) => v.trim()),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']),
})

/** Update user schema */
export const updateUserSchema = z.object({
  id: z.string().min(1),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50)
    .transform((v) => v.trim())
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50)
    .transform((v) => v.trim())
    .optional(),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).optional(),
  isActive: z.boolean().optional(),
})

/** Update profile schema */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50)
    .transform((v) => v.trim()),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50)
    .transform((v) => v.trim()),
})

/** User list filters */
export const userListFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UserListFilters = z.infer<typeof userListFiltersSchema>
