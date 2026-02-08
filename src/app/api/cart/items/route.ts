import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { CartService } from "@/lib/services/cart/cart.service";
import { CacheService } from "@/lib/services/cache/cache.service";
import { ProductService } from "@/lib/services/product/product.service";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { UploadServiceFactory } from "@/lib/services/upload/upload.factory";
import { UploadProvider } from "@/lib/services/upload/upload.interface";

// Initialize services
const cacheService = new CacheService();
const productRepo = new ProductRepository(prisma);
const uploadService = UploadServiceFactory.create(UploadProvider.CLOUDINARY);
const productService = new ProductService(productRepo, cacheService, uploadService);
const cartService = new CartService(cacheService, productService);

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined || quantity < 0) {
      return NextResponse.json({ message: "Invalid product ID or quantity" }, { status: 400 });
    }

    const updatedCart = await cartService.updateItemQuantity(session.user.id, productId, quantity);

    return NextResponse.json({
      message: "Cart item quantity updated successfully",
      data: updatedCart,
    });
  } catch (error: any) {
    console.error("Error updating cart item quantity:", error);
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

    const updatedCart = await cartService.removeItem(session.user.id, productId);

    return NextResponse.json({
      message: "Cart item removed successfully",
      data: updatedCart,
    });
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
