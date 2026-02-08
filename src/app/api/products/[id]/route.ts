import { NextRequest, NextResponse } from "next/server";

// Sample product data
const PRODUCTS: Record<string, any> = {
  "1": {
    id: "1",
    name: "Handwoven Carpet",
    slug: "handwoven-carpet",
    description: "Beautiful handwoven Kashmiri carpet with traditional patterns",
    fullDescription:
      "This exquisite handwoven carpet features authentic Kashmiri patterns passed down through generations. Each piece is meticulously crafted by skilled artisans using traditional looms.",
    price: 299.99,
    originalPrice: 399.99,
    image: "/images/product-1.jpg",
    images: ["/images/product-1.jpg", "/images/product-1-alt-1.jpg"],
    category: { id: "1", name: "Home Decor" },
    rating: 4.8,
    reviewCount: 24,
    stockQuantity: 15,
    sku: "CARPET-001",
    material: "Wool",
    origin: "Kashmir",
    weight: "2.5kg",
  },
  "2": {
    id: "2",
    name: "Pashmina Shawl",
    slug: "pashmina-shawl",
    price: 199.99,
    originalPrice: 249.99,
    image: "/images/product-2.jpg",
    images: ["/images/product-2.jpg"],
    category: { id: "2", name: "Clothing" },
    rating: 4.9,
    reviewCount: 18,
    stockQuantity: 30,
    sku: "SHAWL-001",
  },
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const product = PRODUCTS[productId];

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const body = await request.json();
    return NextResponse.json(
      { message: "Product updated", data: { id: productId, ...body } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
