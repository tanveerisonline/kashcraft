import { NextRequest, NextResponse } from 'next/server'
import { ApiResponseHandler } from '../../lib/api/response'
import { ZodError } from 'zod'
import { AppError } from './app-error'

export function errorHandler(error: Error, req: NextRequest): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      ApiResponseHandler.error(error.code, error.message),
      { status: error.statusCode },
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      ApiResponseHandler.error('VALIDATION_ERROR', 'Validation failed', error.issues),
      { status: 400 },
    )
  }

  // Generic error handling
  return NextResponse.json(
    ApiResponseHandler.error('INTERNAL_SERVER_ERROR', 'Something went wrong'),
    { status: 500 },
  )
}
