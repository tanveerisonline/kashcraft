import { NextRequest, NextResponse } from "next/server";

const CATEGORIES: Record<string, any> = {
  "home-decor": {
    id: "1",
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful home decoration items",
    image: "/images/category-home-decor.jpg",
    subcategories: [
      { id: "1-1", name: "Carpets", slug: "carpets" },
      { id: "1-2", name: "Decorative Items", slug: "decorative-items" },
      { id: "1-3", name: "Wall Art", slug: "wall-art" },
    ],
  },
  clothing: {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    description: "Traditional and modern clothing",
    image: "/images/category-clothing.jpg",
    subcategories: [
      { id: "2-1", name: "Shawls", slug: "shawls" },
      { id: "2-2", name: "Scarves", slug: "scarves" },
      { id: "2-3", name: "Jackets", slug: "jackets" },
    ],
  },
  jewelry: {
    id: "3",
    name: "Jewelry",
    slug: "jewelry",
    description: "Handcrafted jewelry pieces",
    image: "/images/category-jewelry.jpg",
    subcategories: [],
  },
};

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const category = CATEGORIES[slug];

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
