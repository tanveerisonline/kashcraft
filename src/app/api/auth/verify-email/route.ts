import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Verification token is missing" }, { status: 400 });
    }

    // 1. Validate the token (placeholder)
    // const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    // if (!user) {
    //   return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    // }

    // 2. Update user's verification status (placeholder)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { isVerified: true, verificationToken: null },
    // });

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
