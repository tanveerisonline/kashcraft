import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check if basic tables exist
    const userCount = await prisma.user.count().catch(() => -1);

    return Response.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          tables: userCount >= 0 ? "accessible" : "error",
        },
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
