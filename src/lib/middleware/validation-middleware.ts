import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RouteHandler } from "./auth-middleware"; // Reusing RouteHandler type

// Placeholder for a custom API response handler.
// In a real application, this would be a utility to standardize API error responses.
const ApiResponseHandler = {
  error: (code: string, message: string, details?: any) => {
    return NextResponse.json({ code, message, details }, { status: 400 });
  },
};

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (handler: RouteHandler) => {
    return async (request: NextRequest, ...args: any[]) => {
      try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
          return ApiResponseHandler.error(
            "VALIDATION_ERROR",
            "Invalid request data",
            result.error.issues
          );
        }

        // Attach validated data to the request object for downstream handlers
        (request as any).validatedBody = result.data;

        return handler(request, ...args);
      } catch (error) {
        console.error("Error in validation middleware:", error);
        return ApiResponseHandler.error("INTERNAL_SERVER_ERROR", "Failed to process request body");
      }
    };
  };
}
