import { NextRequest, NextResponse } from 'next/server';
import { withAuth, RouteHandler } from './auth-middleware';

export function withAdmin(handler: RouteHandler) {
  return withAuth(async (request: NextRequest, ...args: any[]) => {
    // Assuming 'user' is attached to the request by withAuth middleware
    const user = (request as any).user;

    if (!user || !user.roles.includes('admin')) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    return handler(request, ...args);
  });
}
