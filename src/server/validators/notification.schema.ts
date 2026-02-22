import { z } from 'zod'

const mediaTypeEnum = z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'])

/** Create announcement schema */
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  targetRole: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).nullable().optional(),
  mediaType: mediaTypeEnum.optional(),
  mediaUrl: z
    .string()
    .trim()
    .max(2048, 'Media URL too long')
    .optional()
    .refine(
      (val) => !val || /^https:\/\//.test(val),
      'Media URL must be a valid https URL (e.g. Cloudinary, YouTube)'
    ),
})

/** Update announcement schema */
export const updateAnnouncementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  targetRole: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).nullable().optional(),
  isPublished: z.boolean().optional(),
  mediaType: mediaTypeEnum.optional(),
  mediaUrl: z
    .string()
    .trim()
    .max(2048, 'Media URL too long')
    .optional()
    .refine(
      (val) => !val || /^https:\/\//.test(val),
      'Media URL must be a valid https URL (e.g. Cloudinary, YouTube)'
    ),
})

/** Add prerequisite schema */
export const addPrerequisiteSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  prerequisiteCode: z.string().min(1, 'Prerequisite code is required'),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
export type AddPrerequisiteInput = z.infer<typeof addPrerequisiteSchema>
