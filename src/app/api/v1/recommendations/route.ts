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
        recommendations = await recommendationEngine.getFrequentlyBoughtTogether(productId);
        break;
      case "similar":
        recommendations = await recommendationEngine.getSimilarProducts(productId);
        break;
      case "personalized":
        recommendations = await recommendationEngine.getPersonalizedRecommendations(userId);
        break;
      case "trending":
        recommendations = await recommendationEngine.getTrendingProducts();
        break;
      default:
        recommendations = await recommendationEngine.getProductRecommendations(productId, userId);
    }

    return Response.json(recommendations || {});
  } catch (error) {
    console.error("Recommendations error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
