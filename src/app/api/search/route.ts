import { NextRequest, NextResponse } from "next/server";

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Handwoven Carpet",
    slug: "handwoven-carpet",
    description: "Beautiful handwoven Kashmiri carpet with traditional patterns",
    price: 299.99,
    image: "/images/product-1.jpg",
    rating: 4.8,
    reviewCount: 24,
    stockQuantity: 15,
  },
  {
    id: "2",
    name: "Pashmina Shawl",
    slug: "pashmina-shawl",
    description: "Luxurious Pashmina shawl with intricate embroidery",
    price: 199.99,
    image: "/images/product-2.jpg",
    rating: 4.9,
    reviewCount: 18,
    stockQuantity: 30,
  },
  {
    id: "3",
    name: "Walnut Wood Box",
    slug: "walnut-wood-box",
    description: "Hand-carved walnut wood decorative box",
    price: 79.99,
    image: "/images/product-3.jpg",
    rating: 4.6,
    reviewCount: 12,
    stockQuantity: 25,
  },
  {
    id: "4",
    name: "Papier-Mâché Plate",
    slug: "papier-mache-plate",
    description: "Colorful papier-mâché decorative plate",
    price: 49.99,
    image: "/images/product-4.jpg",
    rating: 4.5,
    reviewCount: 8,
    stockQuantity: 40,
  },
  {
    id: "5",
    name: "Silk Scarf",
    slug: "silk-scarf",
    description: "Hand-dyed silk scarf with natural colors",
    price: 59.99,
    image: "/images/product-5.jpg",
    rating: 4.7,
    reviewCount: 15,
    stockQuantity: 50,
  },
];

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const filtered = SAMPLE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      data: filtered,
      count: filtered.length,
      query,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
