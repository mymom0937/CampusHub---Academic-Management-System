/** Standard error codes used throughout the application */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'ENROLLMENT_CLOSED'
  | 'COURSE_FULL'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'DROP_DEADLINE_PASSED'
  | 'INTERNAL_ERROR'

/** HTTP status codes for each error code */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  CONFLICT: 409,
  ENROLLMENT_CLOSED: 400,
  COURSE_FULL: 400,
  CREDIT_LIMIT_EXCEEDED: 400,
  DROP_DEADLINE_PASSED: 400,
  INTERNAL_ERROR: 500,
}

/** Custom application error with structured error data */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = ERROR_STATUS_MAP[code]
    this.details = details
  }

  /** Convert to API error response format */
  toResponse(): {
    success: false
    error: { code: string; message: string; details?: Record<string, unknown> }
  } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    }
  }
}

/** Type guard to check if an error is an AppError */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/** Wrap unknown errors into AppError */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error
  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', error.message)
  }
  return new AppError('INTERNAL_ERROR', 'An unexpected error occurred')
}
