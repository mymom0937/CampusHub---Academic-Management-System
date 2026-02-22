/** Support contact */
export const SUPPORT_EMAIL = 'support@campushub.com'
export const GITHUB_URL = 'https://github.com'

/** Maximum credits a student can enroll in per semester */
export const MAX_CREDITS_PER_SEMESTER = 18

/** Minimum credits for full-time status */
export const MIN_CREDITS_FULL_TIME = 12

// Session & auth constants are managed by Better-Auth configuration in src/lib/auth.ts

/** Grade point values mapping */
export const GRADE_POINTS: Record<string, number | null> = {
  A_PLUS: 4.0,
  A: 4.0,
  A_MINUS: 3.75,
  B_PLUS: 3.5,
  B: 3.0,
  B_MINUS: 2.75,
  C_PLUS: 2.5,
  C: 2.0,
  D: 1.0,
  F: 0.0,
  P: null, // Pass - no GPA impact
  I: null, // Incomplete - no GPA impact
  W: null, // Withdrawn - no GPA impact
  DO: null, // Dropout - no GPA impact
  NG: null, // No Grade - no GPA impact
}

/** Grade display labels */
export const GRADE_LABELS: Record<string, string> = {
  A_PLUS: 'A+',
  A: 'A',
  A_MINUS: 'A-',
  B_PLUS: 'B+',
  B: 'B',
  B_MINUS: 'B-',
  C_PLUS: 'C+',
  C: 'C',
  D: 'D',
  F: 'F',
  P: 'P',
  I: 'I',
  W: 'W',
  DO: 'DO',
  NG: 'NG',
}

/** Academic standing thresholds */
export const ACADEMIC_STANDING = {
  DEANS_LIST: 3.5,
  GOOD_STANDING: 2.0,
} as const

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
