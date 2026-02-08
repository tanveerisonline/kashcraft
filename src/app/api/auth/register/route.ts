import { NextRequest, NextResponse } from "next/server";

// In-memory user storage (replace with database)
let USERS: Record<string, any> = {
  "user@example.com": {
    id: "1",
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
    phone: "",
  },
};

let nextUserId = 2;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword } = body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    if (USERS[email.toLowerCase()]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create user
    const user = {
      id: nextUserId.toString(),
      email: email.toLowerCase(),
      password, // TODO: Hash password with bcrypt
      name: fullName,
      phone: "",
      createdAt: new Date().toISOString(),
    };

    USERS[email.toLowerCase()] = user;
    nextUserId++;

    // TODO: Send verification email
    // TODO: Generate JWT token

    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
