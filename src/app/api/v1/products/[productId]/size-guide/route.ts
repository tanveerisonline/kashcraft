import { sizeGuideService } from "@/lib/services/products/size-guide.service";

export async function GET(request: Request, { params }: { params: { productId: string } }) {
  try {
    const guide = await sizeGuideService.getSizeGuideForProduct(params.productId);

    if (!guide) {
      return Response.json({ error: "Size guide not found" }, { status: 404 });
    }

    return Response.json({ guide });
  } catch (error) {
    console.error("Size guide error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
