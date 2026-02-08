import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = [
  {
    id: "1",
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful home decoration items",
  },
  { id: "2", name: "Clothing", slug: "clothing", description: "Traditional and modern clothing" },
  { id: "3", name: "Jewelry", slug: "jewelry", description: "Handcrafted jewelry pieces" },
  { id: "4", name: "Accessories", slug: "accessories", description: "Unique accessories" },
];

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit");
    let categories = CATEGORIES;

    if (limit) {
      categories = categories.slice(0, parseInt(limit));
    }

    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCategory = {
      id: (CATEGORIES.length + 1).toString(),
      ...body,
    };
    return NextResponse.json({ message: "Category created", data: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
