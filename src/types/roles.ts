/** User roles in the system */
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'

/** Role hierarchy for permission checks */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  INSTRUCTOR: 2,
  STUDENT: 1,
}

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
}

/** Role-based dashboard paths */
export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
}

/** Check if a role has at least a certain permission level */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
