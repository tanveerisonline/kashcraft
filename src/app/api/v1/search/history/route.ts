import { AdvancedSearchService } from "@/lib/services/search/advanced-search.service";
import { auth } from "@/lib/auth/auth";

const advancedSearchService = AdvancedSearchService.getInstance();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await advancedSearchService.getSearchHistory(session.user.id);
    return Response.json({ history });
  } catch (error) {
    console.error("Search history error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
