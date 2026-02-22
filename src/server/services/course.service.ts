import { AppError } from '@/server/errors/AppError'
import { prisma } from '@/lib/prisma'
import * as courseRepo from '@/server/repositories/course.repository'
import * as semesterRepo from '@/server/repositories/semester.repository'
import * as userRepo from '@/server/repositories/user.repository'
import type {
  CreateCourseInput,
  UpdateCourseInput,
  AssignInstructorInput,
  CreateSemesterInput,
  UpdateSemesterInput,
} from '@/server/validators/course.schema'
import type { CourseListItem, SemesterListItem } from '@/types/dto'
import type { PaginatedData } from '@/types/api'

// ============================================================
// COURSE SERVICES
// ============================================================

/** Create a course */
export async function createCourse(input: CreateCourseInput): Promise<CourseListItem> {
  const semester = await semesterRepo.findSemesterById(input.semesterId)
  if (!semester) {
    throw new AppError('NOT_FOUND', 'Semester not found')
  }

  const course = await courseRepo.createCourse(input)
  const full = await courseRepo.findCourseById(course.id)
  if (!full) throw new AppError('INTERNAL_ERROR', 'Failed to create course')

  return mapCourseToDto(full)
}

/** Update a course */
export async function updateCourse(input: UpdateCourseInput): Promise<CourseListItem> {
  const existing = await courseRepo.findCourseById(input.id)
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  await courseRepo.updateCourse(input.id, {
    ...(input.name && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.credits && { credits: input.credits }),
    ...(input.capacity && { capacity: input.capacity }),
  })

  const updated = await courseRepo.findCourseById(input.id)
  if (!updated) throw new AppError('INTERNAL_ERROR', 'Failed to update course')

  return mapCourseToDto(updated)
}

/** List courses with pagination */
export async function listCourses(params: {
  page: number
  pageSize: number
  search?: string
  semesterId?: string
}): Promise<PaginatedData<CourseListItem>> {
  const { items, total } = await courseRepo.listCourses(params)

  return {
    items: items.map(mapCourseToDto),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

/** Assign instructor to course */
export async function assignInstructor(input: AssignInstructorInput): Promise<void> {
  const course = await courseRepo.findCourseById(input.courseId)
  if (!course) throw new AppError('NOT_FOUND', 'Course not found')

  const instructor = await userRepo.findUserById(input.instructorId)
  if (!instructor || instructor.role !== 'INSTRUCTOR') {
    throw new AppError('NOT_FOUND', 'Instructor not found')
  }

  try {
    await courseRepo.assignInstructor(input)
  } catch {
    throw new AppError('CONFLICT', 'Instructor is already assigned to this course')
  }
}

/** Remove instructor from course */
export async function removeInstructor(courseId: string, instructorId: string): Promise<void> {
  try {
    await courseRepo.removeInstructor(courseId, instructorId)
  } catch {
    throw new AppError('NOT_FOUND', 'Assignment not found')
  }
}

/** Archive a course (soft delete) */
export async function archiveCourse(id: string): Promise<void> {
  const existing = await courseRepo.findCourseById(id)
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  await courseRepo.archiveCourse(id)
}

/** Get course detail by ID */
export async function getCourseDetail(id: string): Promise<CourseListItem> {
  const course = await courseRepo.findCourseById(id)
  if (!course) throw new AppError('NOT_FOUND', 'Course not found')
  return mapCourseToDto(course)
}

/** Get instructor's courses */
export async function getInstructorCourses(instructorId: string): Promise<CourseListItem[]> {
  const courses = await courseRepo.findCoursesByInstructor(instructorId)
  return courses.map(mapCourseToDto)
}

/** Get instructor course detail (verifies assignment) */
export async function getInstructorCourseDetail(
  instructorId: string,
  courseId: string
): Promise<CourseListItem> {
  const course = await courseRepo.findCourseById(courseId)
  if (!course) throw new AppError('NOT_FOUND', 'Course not found')

  const isAssigned = course.instructorAssignments.some(
    (a) => a.instructor.id === instructorId
  )
  if (!isAssigned) {
    throw new AppError('FORBIDDEN', 'You are not assigned to this course')
  }

  return mapCourseToDto(course)
}

/** Get course catalog for active semester, with optional enrollment/waitlist status for a student */
export async function getCourseCatalog(search?: string, studentId?: string): Promise<CourseListItem[]> {
  const activeSemester = await semesterRepo.findActiveSemester()
  if (!activeSemester) return []

  const courses = await courseRepo.findCourseCatalog(activeSemester.id, search)

  let enrolledCourseIds = new Set<string>()
  let waitlistedMap = new Map<string, number>() // courseId -> position
  let waitlistCounts = new Map<string, number>() // courseId -> total waitlisted

  if (studentId) {
    const courseIds = courses.map((c) => c.id)

    // Get student's enrollments (enrolled + waitlisted) in these courses
    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: { in: ['ENROLLED', 'WAITLISTED'] },
        courseId: { in: courseIds },
      },
      select: { courseId: true, status: true },
    })

    enrolledCourseIds = new Set(
      studentEnrollments.filter((e) => e.status === 'ENROLLED').map((e) => e.courseId)
    )

    const waitlistedCourseIds = studentEnrollments
      .filter((e) => e.status === 'WAITLISTED')
      .map((e) => e.courseId)

    // Get waitlist positions
    for (const cId of waitlistedCourseIds) {
      const allWaitlisted = await prisma.enrollment.findMany({
        where: { courseId: cId, status: 'WAITLISTED' },
        orderBy: { enrolledAt: 'asc' },
        select: { studentId: true },
      })
      const pos = allWaitlisted.findIndex((w) => w.studentId === studentId)
      if (pos >= 0) waitlistedMap.set(cId, pos + 1)
    }

    // Get waitlist counts for all courses
    const waitlistCountsRaw = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds }, status: 'WAITLISTED' },
      _count: { courseId: true },
    })
    for (const wc of waitlistCountsRaw) {
      waitlistCounts.set(wc.courseId, wc._count.courseId)
    }
  }

  return courses.map((course) => ({
    ...mapCourseToDto(course),
    isEnrolled: enrolledCourseIds.has(course.id),
    isWaitlisted: waitlistedMap.has(course.id),
    waitlistPosition: waitlistedMap.get(course.id),
    waitlistCount: waitlistCounts.get(course.id) || 0,
  }))
}

// ============================================================
// SEMESTER SERVICES
// ============================================================

/** Get semester detail by ID */
export async function getSemesterDetail(id: string): Promise<SemesterListItem> {
  const semester = await semesterRepo.findSemesterById(id)
  if (!semester) throw new AppError('NOT_FOUND', 'Semester not found')
  return mapSemesterToDto(semester)
}

/** Create a semester */
export async function createSemester(input: CreateSemesterInput): Promise<SemesterListItem> {
  const existing = await semesterRepo.findSemesterByCode(input.code)
  if (existing) {
    throw new AppError('CONFLICT', 'A semester with this code already exists')
  }

  const semester = await semesterRepo.createSemester(input)
  const full = await semesterRepo.findSemesterById(semester.id)
  if (!full) throw new AppError('INTERNAL_ERROR', 'Failed to create semester')

  return mapSemesterToDto(full)
}

/** Update a semester */
export async function updateSemester(input: UpdateSemesterInput): Promise<SemesterListItem> {
  const existing = await semesterRepo.findSemesterById(input.id)
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Semester not found')
  }

  await semesterRepo.updateSemester(input.id, {
    ...(input.name && { name: input.name }),
    ...(input.startDate && { startDate: input.startDate }),
    ...(input.endDate && { endDate: input.endDate }),
    ...(input.enrollmentStart && { enrollmentStart: input.enrollmentStart }),
    ...(input.enrollmentEnd && { enrollmentEnd: input.enrollmentEnd }),
    ...(input.dropDeadline && { dropDeadline: input.dropDeadline }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  })

  const updated = await semesterRepo.findSemesterById(input.id)
  if (!updated) throw new AppError('INTERNAL_ERROR', 'Failed to update semester')

  return mapSemesterToDto(updated)
}

/** List all semesters */
export async function listSemesters(): Promise<SemesterListItem[]> {
  const semesters = await semesterRepo.listSemesters()
  return semesters.map(mapSemesterToDto)
}

// ============================================================
// MAPPERS
// ============================================================

/** Minimal course shape needed for DTO mapping (works with various repo select shapes) */
type CourseForDto = {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  capacity: number
  semester: { id: string; name: string }
  instructorAssignments: Array<{
    instructor: { id: string; firstName: string; lastName: string }
    isPrimary: boolean
  }>
  _count: { enrollments: number }
}

function mapCourseToDto(course: CourseForDto): CourseListItem {
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    credits: course.credits,
    capacity: course.capacity,
    enrolledCount: course._count.enrollments,
    semesterName: course.semester.name,
    semesterId: course.semester.id,
    instructors: course.instructorAssignments.map((a) => ({
      id: a.instructor.id,
      firstName: a.instructor.firstName,
      lastName: a.instructor.lastName,
      isPrimary: a.isPrimary,
    })),
  }
}

function mapSemesterToDto(
  semester: NonNullable<Awaited<ReturnType<typeof semesterRepo.findSemesterById>>>
): SemesterListItem {
  return {
    id: semester.id,
    name: semester.name,
    code: semester.code,
    startDate: semester.startDate.toISOString(),
    endDate: semester.endDate.toISOString(),
    isActive: semester.isActive,
    enrollmentStart: semester.enrollmentStart.toISOString(),
    enrollmentEnd: semester.enrollmentEnd.toISOString(),
    dropDeadline: semester.dropDeadline.toISOString(),
    courseCount: semester._count.courses,
  }
}
