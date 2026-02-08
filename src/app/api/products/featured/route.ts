import { NextRequest, NextResponse } from "next/server";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Handwoven Carpet",
    slug: "handwoven-carpet",
    description: "Beautiful handwoven Kashmiri carpet",
    price: 299.99,
    image: "/images/product-1.jpg",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "2",
    name: "Pashmina Shawl",
    slug: "pashmina-shawl",
    description: "Luxurious Pashmina shawl with embroidery",
    price: 199.99,
    image: "/images/product-2.jpg",
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: "3",
    name: "Walnut Wood Box",
    slug: "walnut-wood-box",
    description: "Hand-carved walnut wood box",
    price: 79.99,
    image: "/images/product-3.jpg",
    rating: 4.6,
    reviewCount: 12,
  },
  {
    id: "4",
    name: "Silk Scarf",
    slug: "silk-scarf",
    description: "Hand-dyed silk scarf",
    price: 59.99,
    image: "/images/product-5.jpg",
    rating: 4.7,
    reviewCount: 15,
  },
];

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "4");
    return NextResponse.json({
      data: FEATURED_PRODUCTS.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 });
  }
}
