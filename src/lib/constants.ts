/** Support contact */
export const SUPPORT_EMAIL = 'support@campushub.com'
export const GITHUB_URL = 'https://github.com'

/** Maximum credits a student can enroll in per semester (uniportal_docs.txt) */
export const MAX_CREDITS_PER_SEMESTER = 18

/** Minimum credits for full-time status (uniportal_docs.txt) */
export const MIN_CREDITS_FULL_TIME = 12

// Session & auth constants are managed by Better-Auth configuration in src/lib/auth.ts

/** Grade point values (4.0 scale) per uniportal_docs.txt */
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

/** Grade display labels (used for dropdowns, CSV import, etc.) */
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

/** Map percentage (0–100) to letter grade per uniportal docs. Special grades (P, I, W, DO, NG) are manual only. */
export const PERCENTAGE_TO_GRADE: Array<{ min: number; max: number; grade: string }> = [
  { min: 90, max: 100, grade: 'A_PLUS' },
  { min: 85, max: 89, grade: 'A' },
  { min: 80, max: 84, grade: 'A_MINUS' },
  { min: 75, max: 79, grade: 'B_PLUS' },
  { min: 70, max: 74, grade: 'B' },
  { min: 65, max: 69, grade: 'B_MINUS' },
  { min: 60, max: 64, grade: 'C_PLUS' },
  { min: 50, max: 59, grade: 'C' },
  { min: 40, max: 49, grade: 'D' },
  { min: 0, max: 39, grade: 'F' },
]

export function percentageToGrade(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage))
  const entry = PERCENTAGE_TO_GRADE.find((r) => clamped >= r.min && clamped <= r.max)
  return entry?.grade ?? 'F'
}

/** Default assessment weights for new courses. maxScore = weight so scores are "points out of max" (e.g. Test 1: 11/15). */
export const DEFAULT_ASSESSMENT_WEIGHTS = [
  { name: 'Test 1', weight: 15, maxScore: 15 },
  { name: 'Mid-Exam', weight: 25, maxScore: 25 },
  { name: 'Assignment', weight: 15, maxScore: 15 },
  { name: 'Quiz', weight: 5, maxScore: 5 },
  { name: 'Final Exam', weight: 40, maxScore: 40 },
] as const

/** Academic standing thresholds (uniportal_docs.txt) */
export const ACADEMIC_STANDING = {
  DEANS_LIST: 3.5,       // GPA ≥ 3.5
  GOOD_STANDING: 2.0,   // GPA ≥ 2.0
  /** GPA < 2.0 = Academic Probation */
} as const

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
