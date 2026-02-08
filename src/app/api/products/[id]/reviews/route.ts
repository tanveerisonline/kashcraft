import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    // Sample reviews data
    const reviews = [
      {
        id: "1",
        productId,
        author: "John Doe",
        rating: 5,
        text: "Excellent quality! Exactly as described.",
        date: "2025-01-15",
        helpful: 12,
      },
      {
        id: "2",
        productId,
        author: "Sarah Smith",
        rating: 4,
        text: "Very nice product. Shipping took a bit longer than expected.",
        date: "2025-01-10",
        helpful: 8,
      },
      {
        id: "3",
        productId,
        author: "Mike Johnson",
        rating: 5,
        text: "Perfect for my home. Great craftsmanship!",
        date: "2025-01-05",
        helpful: 15,
      },
    ];

    const totalPages = Math.ceil(reviews.length / limit);
    const start = (page - 1) * limit;
    const paginatedReviews = reviews.slice(start, start + limit);

    return NextResponse.json({
      data: paginatedReviews,
      pagination: {
        page,
        limit,
        total: reviews.length,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Authenticate user (placeholder)
    // const userId = getUserIdFromSession(request);
    // if (!userId) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // Verify user purchased product (placeholder)
    // const hasPurchased = await orderService.hasUserPurchasedProduct(userId, id);
    // if (!hasPurchased) {
    //   return NextResponse.json({ message: 'User has not purchased this product' }, { status: 403 });
    // }

    // Create review (placeholder)
    // const newReview = await reviewService.createReview(id, userId, body);

    return NextResponse.json(
      {
        message: `Review for product ID: ${id} created successfully`,
        data: {}, // Replace with actual new review data
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product review:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
