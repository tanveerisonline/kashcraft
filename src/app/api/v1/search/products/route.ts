import { advancedSearchService } from "@/lib/services/search/advanced-search.service";
import { validateBody } from "@/lib/middleware/validation-helper";
import { searchProductsSchema, type SearchProductsInput } from "@/validations/api.schema";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseHandler } from "@/lib/api/response";

export const POST = validateBody<SearchProductsInput>(searchProductsSchema)(async (
  req: NextRequest,
  validated: SearchProductsInput
) => {
  try {
    const { query, filters, sortBy, page = 1, limit = 20, userId } = validated;

    const results = await advancedSearchService.search({
      query,
      filters,
      sortBy,
      page,
      limit,
      userId,
    });

    return NextResponse.json(ApiResponseHandler.success(results));
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      ApiResponseHandler.error("SEARCH_ERROR", "Failed to search products"),
      { status: 500 }
    );
  }
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json(
        ApiResponseHandler.error("INVALID_QUERY", "Query parameter is required"),
        { status: 400 }
      );
    }

    const suggestions = await advancedSearchService.getSuggestions(query);
    return NextResponse.json(ApiResponseHandler.success({ suggestions }));
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      ApiResponseHandler.error("SUGGESTIONS_ERROR", "Failed to get suggestions"),
      { status: 500 }
    );
  }
}
