import { NextRequest, NextResponse } from 'next/server';

export function detectApiVersion(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Regex to match /api/vX/ where X is the version number
  const versionMatch = pathname.match(/^\/api\/(v\d+)\//);

  if (versionMatch && versionMatch[1]) {
    const version = versionMatch[1]; // e.g., 'v1', 'v2'
    // Attach the version to the request object for later use
    (request as any).apiVersion = version;
  }

  return request;
}
