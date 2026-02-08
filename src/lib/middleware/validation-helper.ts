import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { AppError } from "./app-error";
import { ApiResponseHandler } from "../api/response";

/**
 * Validates request body against a Zod schema
 * Returns a middleware function that validates before passing to handler
 */
export function validateBody<T>(schema: ZodSchema) {
  return (handler: (req: NextRequest, validated: T) => Promise<Response>) => {
    return async (req: NextRequest, params?: any) => {
      try {
        // Handle all HTTP methods that accept bodies
        if (!["POST", "PUT", "PATCH"].includes(req.method)) {
          return handler(req, undefined as unknown as T);
        }

        const body = await req.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
          const errors = validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }));

          return NextResponse.json(
            ApiResponseHandler.error("VALIDATION_ERROR", "Request validation failed", errors),
            { status: 400 }
          );
        }

        // Pass validated data through the request context or as parameter
        return handler(req, validation.data as T);
      } catch (error) {
        if (error instanceof SyntaxError) {
          return NextResponse.json(
            ApiResponseHandler.error("INVALID_JSON", "Request body is not valid JSON"),
            { status: 400 }
          );
        }

        if (error instanceof AppError) {
          return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
            status: error.statusCode,
          });
        }

        return NextResponse.json(
          ApiResponseHandler.error("INTERNAL_SERVER_ERROR", "Internal server error"),
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema) {
  return (handler: (req: NextRequest, validated: T) => Promise<Response>) => {
    return async (req: NextRequest, params?: any) => {
      try {
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());

        const validation = schema.safeParse(query);

        if (!validation.success) {
          const errors = validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }));

          return NextResponse.json(
            ApiResponseHandler.error("VALIDATION_ERROR", "Query validation failed", errors),
            { status: 400 }
          );
        }

        return handler(req, validation.data as T);
      } catch (error) {
        if (error instanceof AppError) {
          return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
            status: error.statusCode,
          });
        }

        return NextResponse.json(
          ApiResponseHandler.error("INTERNAL_SERVER_ERROR", "Internal server error"),
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Validates both body and query parameters
 */
export function validateRequest<TBody, TQuery>(bodySchema?: ZodSchema, querySchema?: ZodSchema) {
  return (handler: (req: NextRequest, body?: TBody, query?: TQuery) => Promise<Response>) => {
    return async (req: NextRequest, params?: any) => {
      try {
        let validatedBody: TBody | undefined;
        let validatedQuery: TQuery | undefined;

        // Validate query if schema provided
        if (querySchema) {
          const { searchParams } = new URL(req.url);
          const query = Object.fromEntries(searchParams.entries());
          const validation = querySchema.safeParse(query);

          if (!validation.success) {
            const errors = validation.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }));

            return NextResponse.json(
              ApiResponseHandler.error("VALIDATION_ERROR", "Query validation failed", errors),
              { status: 400 }
            );
          }
          validatedQuery = validation.data as TQuery;
        }

        // Validate body if schema provided and method allows it
        if (bodySchema && ["POST", "PUT", "PATCH"].includes(req.method)) {
          try {
            const body = await req.json();
            const validation = bodySchema.safeParse(body);

            if (!validation.success) {
              const errors = validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              }));

              return NextResponse.json(
                ApiResponseHandler.error("VALIDATION_ERROR", "Request validation failed", errors),
                { status: 400 }
              );
            }
            validatedBody = validation.data as TBody;
          } catch (err) {
            if (err instanceof SyntaxError) {
              return NextResponse.json(
                ApiResponseHandler.error("INVALID_JSON", "Request body is not valid JSON"),
                { status: 400 }
              );
            }
            throw err;
          }
        }

        return handler(req, validatedBody, validatedQuery);
      } catch (error) {
        if (error instanceof AppError) {
          return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
            status: error.statusCode,
          });
        }

        return NextResponse.json(
          ApiResponseHandler.error("INTERNAL_SERVER_ERROR", "Internal server error"),
          { status: 500 }
        );
      }
    };
  };
}
