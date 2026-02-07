import type { UserRole } from './roles'

/** Session user data (safe for client) */
export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
}

/** User list item DTO */
export interface UserListItem {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

/** User detail DTO */
export interface UserDetail extends UserListItem {
  emailVerified: boolean
  enrollmentCount?: number
  courseCount?: number
}

/** Semester list item DTO */
export interface SemesterListItem {
  id: string
  name: string
  code: string
  startDate: string
  endDate: string
  isActive: boolean
  enrollmentStart: string
  enrollmentEnd: string
  dropDeadline: string
  courseCount: number
}

/** Course list item DTO */
export interface CourseListItem {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  capacity: number
  enrolledCount: number
  semesterName: string
  semesterId: string
  instructors: Array<{
    id: string
    firstName: string
    lastName: string
    isPrimary: boolean
  }>
  /** Whether the current student is enrolled (only set in catalog view) */
  isEnrolled?: boolean
  /** Whether the current student is waitlisted (only set in catalog view) */
  isWaitlisted?: boolean
  /** Waitlist position if waitlisted */
  waitlistPosition?: number
  /** Total number of students on the waitlist */
  waitlistCount?: number
}

/** Course detail DTO */
export interface CourseDetail extends CourseListItem {
  semester: {
    id: string
    name: string
    code: string
    enrollmentStart: string
    enrollmentEnd: string
    dropDeadline: string
  }
}

/** Enrollment list item DTO */
export interface EnrollmentListItem {
  id: string
  courseCode: string
  courseName: string
  credits: number
  status: string
  enrolledAt: string
  droppedAt: string | null
  grade: string | null
  gradePoints: number | null
  instructorName: string | null
  semesterName: string
}

/** Grade entry for instructor grading */
export interface StudentGradeEntry {
  enrollmentId: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  status: string
  grade: string | null
  gradePoints: number | null
  gradedAt: string | null
}

/** Transcript entry */
export interface TranscriptEntry {
  semesterName: string
  semesterCode: string
  courses: Array<{
    courseCode: string
    courseName: string
    credits: number
    grade: string | null
    gradePoints: number | null
    status: string
  }>
  semesterGpa: number | null
  semesterCredits: number
}

/** GPA summary */
export interface GpaSummary {
  cumulativeGpa: number | null
  totalCredits: number
  totalGradePoints: number
  academicStanding: string
}

/** Dashboard stats */
export interface AdminDashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalCourses: number
  totalEnrollments: number
  activeSemesters: number
}

/** Extended admin analytics data */
export interface AdminAnalytics extends AdminDashboardStats {
  enrollmentByCourse: Array<{
    courseCode: string
    courseName: string
    enrolled: number
    capacity: number
  }>
  gradeDistribution: Array<{
    grade: string
    count: number
  }>
  recentEnrollments: Array<{
    studentName: string
    courseCode: string
    enrolledAt: string
  }>
}

export interface StudentDashboardStats {
  enrolledCourses: number
  completedCourses: number
  totalCredits: number
  currentGpa: number | null
  gpaTrend: Array<{
    semesterCode: string
    semesterName: string
    gpa: number
  }>
}

export interface InstructorDashboardStats {
  assignedCourses: number
  totalStudents: number
  gradedCount: number
  pendingGrades: number
}

// ============================================================
// PHASE 2 DTOs
// ============================================================

/** Notification DTO */
export interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

/** Announcement DTO */
export interface AnnouncementItem {
  id: string
  title: string
  content: string
  authorName: string
  targetRole: string | null
  isPublished: boolean
  createdAt: string
}

/** Course prerequisite DTO */
export interface PrerequisiteItem {
  id: string
  courseCode: string
  prerequisiteCode: string
}
