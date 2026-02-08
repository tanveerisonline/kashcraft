import { recommendationEngine } from "@/lib/services/recommendations/recommendation.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    let recommendations;

    switch (type) {
      case "frequent":
        if (!productId) {
          return Response.json({ error: "productId is required for frequent recommendations" }, { status: 400 });
        }
        recommendations = await recommendationEngine.getFrequentlyBoughtTogether(productId);
        break;
      case "similar":
        if (!productId) {
          return Response.json({ error: "productId is required for similar recommendations" }, { status: 400 });
        }
        recommendations = await recommendationEngine.getSimilarProducts(productId);
        break;
      case "personalized":
        if (!userId) {
          return Response.json({ error: "userId is required for personalized recommendations" }, { status: 400 });
        }
        recommendations = await recommendationEngine.getPersonalizedRecommendations(userId);
        break;
      case "trending":
        recommendations = await recommendationEngine.getTrendingProducts();
        break;
      default:
        recommendations = await recommendationEngine.getProductRecommendations(
          productId || "",
          userId || undefined
        );
    }

    return Response.json(recommendations || {});
  } catch (error) {
    console.error("Recommendations error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
