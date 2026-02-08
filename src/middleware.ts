import { NextRequest, NextResponse } from 'next/server'
// import { errorHandler } from './lib/middleware/error-handler'
// import { detectApiVersion } from './lib/middleware/version-detector';

// const allowedOrigins = process.env.NODE_ENV === 'production'
//   ? ['https://your-production-domain.com'] // Replace with your production domain
//   : ['http://localhost:3000', 'http://localhost:3001']; // Add other development origins as needed

export async function middleware(request: NextRequest) {
  // try {
  //   // Detect API version first
  //   detectApiVersion(request);

  //   const response = NextResponse.next();
  //   const origin = request.headers.get('origin');

  //   // Set CORS headers for all responses
  //   if (origin && allowedOrigins.includes(origin)) {
  //     response.headers.set('Access-Control-Allow-Origin', origin);
  //   }
  //   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  //   response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  //   response.headers.set('Access-Control-Allow-Credentials', 'true');

  //   // Handle preflight OPTIONS requests
  //   if (request.method === 'OPTIONS') {
  //     return new NextResponse(null, { status: 204, headers: response.headers });
  //   }

  //   // Your existing middleware logic can go here
  //   // For example, authentication checks, request logging, etc.

  //   // If an error occurs in any of the above middleware or API routes,
  //   // it will be caught by the errorHandler.
  //   return response
  // } catch (error: any) {
  //   return errorHandler(error, request)
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
