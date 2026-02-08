import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { CartService } from "@/lib/services/cart/cart.service";
import { CacheService } from "@/lib/services/cache/cache.service";
import { ProductService } from "@/lib/services/product/product.service";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { UploadServiceFactory } from "@/lib/services/upload/upload.factory";
import { UploadProvider } from "@/lib/services/upload/upload.interface";
import { AnalyticsService } from "@/lib/services/analytics/analytics.service";

// Initialize services
const cacheService = new CacheService();
const productRepo = new ProductRepository(prisma);
const uploadService = UploadServiceFactory.create(UploadProvider.CLOUDINARY);
const productService = new ProductService(productRepo, cacheService, uploadService);
const cartService = new CartService(cacheService, productService);
const analyticsService = new AnalyticsService(prisma);

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const cart = await cartService.getCart(session.user.id);

    return NextResponse.json({
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
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
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: "Invalid product ID or quantity" }, { status: 400 });
    }

    const cart = await cartService.addItem(session.user.id, productId, quantity);
    await analyticsService.trackAddToCart(productId, session.user.id);

    return NextResponse.json(
      {
        message: "Item added to cart successfully",
        data: cart,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
