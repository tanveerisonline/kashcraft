import { NextRequest, NextResponse } from 'next/server';

// Define a type for your API route handlers
export type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler) {
  return async (request: NextRequest, ...args: any[]) => {
    // Placeholder for session verification
    const isAuthenticated = request.headers.get('authorization')?.startsWith('Bearer ') || false;

    if (!isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Placeholder for attaching user to request
    // In a real application, you would decode the token, fetch user from DB, etc.
    const user = { id: 'user-123', email: 'user@example.com', roles: ['user'] };
    (request as any).user = user; // Attach user to the request object

    return handler(request, ...args);
  };
}
