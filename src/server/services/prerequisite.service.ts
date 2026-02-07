import { AppError } from '@/server/errors/AppError'
import * as prerequisiteRepo from '@/server/repositories/prerequisite.repository'

/** Get prerequisites for a course code */
export async function getPrerequisites(courseCode: string) {
  return prerequisiteRepo.getPrerequisites(courseCode)
}

/** Add prerequisite (admin) */
export async function addPrerequisite(
  courseCode: string,
  prerequisiteCode: string
): Promise<void> {
  if (courseCode === prerequisiteCode) {
    throw new AppError('VALIDATION_ERROR', 'A course cannot be its own prerequisite')
  }

  try {
    await prerequisiteRepo.addPrerequisite(courseCode, prerequisiteCode)
  } catch {
    throw new AppError('CONFLICT', 'This prerequisite already exists')
  }
}

/** Remove prerequisite (admin) */
export async function removePrerequisite(id: string): Promise<void> {
  try {
    await prerequisiteRepo.removePrerequisite(id)
  } catch {
    throw new AppError('NOT_FOUND', 'Prerequisite not found')
  }
}

/** Check prerequisites for enrollment */
export async function checkPrerequisitesMet(
  studentId: string,
  courseCode: string
): Promise<{ met: boolean; missing: string[] }> {
  return prerequisiteRepo.checkPrerequisitesMet(studentId, courseCode)
}

/** List all prerequisites (admin) */
export async function listAllPrerequisites() {
  return prerequisiteRepo.listAllPrerequisites()
}
