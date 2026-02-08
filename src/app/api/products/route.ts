import { NextRequest, NextResponse } from "next/server";

// Sample product data - Replace with database queries using Prisma
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Handwoven Carpet",
    slug: "handwoven-carpet",
    description: "Beautiful handwoven Kashmiri carpet with traditional patterns",
    price: 299.99,
    originalPrice: 399.99,
    image: "/images/product-1.jpg",
    categoryId: "1",
    category: { id: "1", name: "Home Decor", slug: "home-decor" },
    rating: 4.8,
    reviewCount: 24,
    stockQuantity: 15,
    sku: "CARPET-001",
    material: "Wool",
    origin: "Kashmir",
    weight: "2.5kg",
  },
  {
    id: "2",
    name: "Pashmina Shawl",
    slug: "pashmina-shawl",
    description: "Luxurious Pashmina shawl with intricate embroidery",
    price: 199.99,
    originalPrice: 249.99,
    image: "/images/product-2.jpg",
    categoryId: "2",
    category: { id: "2", name: "Clothing", slug: "clothing" },
    rating: 4.9,
    reviewCount: 18,
    stockQuantity: 30,
    sku: "SHAWL-001",
    material: "Pashmina",
    origin: "Kashmir",
    weight: "0.5kg",
  },
  {
    id: "3",
    name: "Walnut Wood Box",
    slug: "walnut-wood-box",
    description: "Hand-carved walnut wood decorative box",
    price: 79.99,
    image: "/images/product-3.jpg",
    categoryId: "1",
    category: { id: "1", name: "Home Decor", slug: "home-decor" },
    rating: 4.6,
    reviewCount: 12,
    stockQuantity: 25,
    sku: "BOX-001",
    material: "Walnut Wood",
    origin: "Kashmir",
    weight: "1.2kg",
  },
  {
    id: "4",
    name: "Papier-Mâché Plate",
    slug: "papier-mache-plate",
    description: "Colorful papier-mâché decorative plate",
    price: 49.99,
    image: "/images/product-4.jpg",
    categoryId: "1",
    category: { id: "1", name: "Home Decor", slug: "home-decor" },
    rating: 4.5,
    reviewCount: 8,
    stockQuantity: 40,
    sku: "PLATE-001",
    material: "Papier-Mâché",
    origin: "Kashmir",
    weight: "0.3kg",
  },
  {
    id: "5",
    name: "Silk Scarf",
    slug: "silk-scarf",
    description: "Hand-dyed silk scarf with natural colors",
    price: 59.99,
    originalPrice: 79.99,
    image: "/images/product-5.jpg",
    categoryId: "2",
    category: { id: "2", name: "Clothing", slug: "clothing" },
    rating: 4.7,
    reviewCount: 15,
    stockQuantity: 50,
    sku: "SCARF-001",
    material: "Silk",
    origin: "Kashmir",
    weight: "0.2kg",
  },
  {
    id: "6",
    name: "Leather Jacket",
    slug: "leather-jacket",
    description: "Premium quality leather jacket",
    price: 149.99,
    image: "/images/product-6.jpg",
    categoryId: "2",
    category: { id: "2", name: "Clothing", slug: "clothing" },
    rating: 4.8,
    reviewCount: 20,
    stockQuantity: 10,
    sku: "JACKET-001",
    material: "Leather",
    origin: "Kashmir",
    weight: "1.5kg",
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest";
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : null;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : null;
    const search = searchParams.get("search");

    let filtered = [...SAMPLE_PRODUCTS];

    // Filter by search
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }

    // Filter by price range
    if (minPrice !== null) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    // Sort
    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
      default:
        filtered.reverse();
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filtered.slice(start, end);

    return NextResponse.json(
      {
        data: paginatedProducts,
        totalPages,
        total: filtered.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create product using Prisma
    return NextResponse.json({ message: "Product created", data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
