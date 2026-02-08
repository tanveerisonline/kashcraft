import { NextRequest, NextResponse } from "next/server";

// Sample users for demo (replace with database queries)
const USERS: Record<string, any> = {
  "user@example.com": {
    id: "1",
    email: "user@example.com",
    password: "password123", // In production, this should be hashed
    name: "John Doe",
    phone: "555-0000",
  },
  "demo@kashcraft.com": {
    id: "2",
    email: "demo@kashcraft.com",
    password: "demo123",
    name: "Demo User",
    phone: "555-0001",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = USERS[email.toLowerCase()];

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // TODO: Generate JWT token
    const token = `jwt-token-${user.id}-${Date.now()}`;

    // TODO: Set secure HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          token,
        },
      },
      { status: 200 }
    );

    // Set token in cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
