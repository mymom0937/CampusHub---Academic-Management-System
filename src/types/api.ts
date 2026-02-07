/** Standard success response */
export interface ApiSuccess<T> {
  success: true
  data: T
}

/** Standard error response */
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

/** Union API response type */
export type ApiResponse<T> = ApiSuccess<T> | ApiError

/** Pagination parameters */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/** Paginated response data */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Create a success response */
export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

/** Create an error response */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { success: false, error: { code, message, details } }
}
