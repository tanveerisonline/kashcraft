import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { AddressService } from "@/lib/services/address/address.service";

const addressService = new AddressService(prisma);

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const addresses = await addressService.getUserAddresses(session.user.id);

    return NextResponse.json({
      message: "User addresses retrieved successfully",
      data: addresses,
    });
  } catch (error: any) {
    console.error("Error fetching user addresses:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const { type, street, city, state, zipCode, country, isDefault } = body;

    // Validate required fields
    if (!street || !city || !state || !zipCode || !country) {
      return NextResponse.json({ message: "Missing required address fields" }, { status: 400 });
    }

    const newAddress = await addressService.createAddress({
      userId: session.user.id,
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });

    return NextResponse.json(
      {
        message: "Address added successfully",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding new address:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
