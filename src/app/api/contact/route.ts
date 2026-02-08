import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// You'll need to configure nodemailer or another email service
// For now, we'll just log the data and return success

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // TODO: Send email using nodemailer or your email service
    console.log("Contact form submission:", { name, email, subject, message });

    // For now, just return success
    return NextResponse.json(
      { message: "Message sent successfully. We will get back to you soon." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact request:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
