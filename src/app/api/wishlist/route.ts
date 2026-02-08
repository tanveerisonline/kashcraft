import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { WishlistService } from "@/lib/services/wishlist/wishlist.service";

const wishlistService = new WishlistService(prisma);

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const wishlistItems = await wishlistService.getWishlist(session.user.id);

    return NextResponse.json({
      message: "Wishlist retrieved successfully",
      data: wishlistItems,
    });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    const wishlistItem = await wishlistService.addToWishlist(session.user.id, productId);

    return NextResponse.json(
      {
        message: "Item added to wishlist successfully",
        data: wishlistItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding item to wishlist:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    await wishlistService.removeFromWishlist(session.user.id, productId);

    return NextResponse.json({
      message: "Item removed from wishlist successfully",
    });
  } catch (error: any) {
    console.error("Error removing item from wishlist:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
