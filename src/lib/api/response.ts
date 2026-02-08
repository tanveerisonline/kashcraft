export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export class ApiResponseHandler {
  static success<T>(data: T, meta?: object): ApiResponse<T> {
    return { success: true, data, meta };
  }

  static error(code: string, message: string, details?: unknown): ApiResponse<never> {
    return { success: false, error: { code, message, details } };
  }
}
