import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

// Helper to check if user is admin
async function isAdmin(userId?: string) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      stockQuantity,
      lowStockThreshold,
      weight,
      material,
      origin,
      categoryId,
      isActive,
      isFeatured,
    } = body;

    // Validate required fields
    if (!name || !slug || !description || !price || !sku || !categoryId) {
      return NextResponse.json({ message: "Missing required product fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku,
        barcode,
        stockQuantity: stockQuantity || 0,
        lowStockThreshold: lowStockThreshold || 5,
        weight: weight ? parseFloat(weight) : null,
        material,
        origin,
        categoryId,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    // Parse numeric fields if provided
    const updateData: any = { ...updates };
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.compareAtPrice !== undefined)
      updateData.compareAtPrice = updates.compareAtPrice
        ? parseFloat(updates.compareAtPrice)
        : null;
    if (updates.costPrice !== undefined)
      updateData.costPrice = updates.costPrice ? parseFloat(updates.costPrice) : null;
    if (updates.weight !== undefined)
      updateData.weight = updates.weight ? parseFloat(updates.weight) : null;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Product soft deleted successfully",
    });
  } catch (error: any) {
    console.error("Error soft deleting product:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
