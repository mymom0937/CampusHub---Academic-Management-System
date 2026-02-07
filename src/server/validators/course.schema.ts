import { z } from 'zod'

/** Create course schema */
export const createCourseSchema = z.object({
  code: z
    .string()
    .min(1, 'Course code is required')
    .max(20, 'Course code too long')
    .transform((v) => v.toUpperCase().trim()),
  name: z
    .string()
    .min(1, 'Course name is required')
    .max(200, 'Course name too long')
    .transform((v) => v.trim()),
  description: z.string().max(1000).nullable().optional(),
  credits: z.coerce
    .number()
    .int()
    .min(1, 'Credits must be at least 1')
    .max(6, 'Credits cannot exceed 6'),
  capacity: z.coerce
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .max(500, 'Capacity cannot exceed 500'),
  semesterId: z.string().min(1, 'Semester is required'),
})

/** Update course schema */
export const updateCourseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).transform((v) => v.trim()).optional(),
  description: z.string().max(1000).nullable().optional(),
  credits: z.coerce.number().int().min(1).max(6).optional(),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
})

/** Assign instructor schema */
export const assignInstructorSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  instructorId: z.string().min(1, 'Instructor is required'),
  isPrimary: z.boolean().default(true),
})

/** Remove instructor assignment schema */
export const removeInstructorSchema = z.object({
  courseId: z.string().min(1),
  instructorId: z.string().min(1),
})

/** Create semester schema */
export const createSemesterSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Semester name is required')
      .max(50)
      .transform((v) => v.trim()),
    code: z
      .string()
      .min(1, 'Semester code is required')
      .max(20)
      .transform((v) => v.toUpperCase().trim()),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    enrollmentStart: z.coerce.date(),
    enrollmentEnd: z.coerce.date(),
    dropDeadline: z.coerce.date(),
    isActive: z.boolean().default(false),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.enrollmentEnd > data.enrollmentStart, {
    message: 'Enrollment end must be after enrollment start',
    path: ['enrollmentEnd'],
  })

/** Update semester schema */
export const updateSemesterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50).transform((v) => v.trim()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  enrollmentStart: z.coerce.date().optional(),
  enrollmentEnd: z.coerce.date().optional(),
  dropDeadline: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
})

/** Course list filters */
export const courseListFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  semesterId: z.string().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type AssignInstructorInput = z.infer<typeof assignInstructorSchema>
export type CreateSemesterInput = z.infer<typeof createSemesterSchema>
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>
export type CourseListFilters = z.infer<typeof courseListFiltersSchema>
