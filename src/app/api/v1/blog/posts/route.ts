import { blogContentService } from "@/lib/services/content/blog-content.service";
import { validateBody } from "@/lib/middleware/validation-helper";
import { createBlogPostSchema, type CreateBlogPostInput } from "@/validations/api.schema";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseHandler } from "@/lib/api/response";
import { AppError } from "@/lib/middleware/app-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";

    let results = await blogContentService.getPublishedPosts(page, limit, category || undefined);

    // Filter by featured if needed
    if (featured) {
      results = {
        ...results,
        posts: results.posts.filter((post) => post.featured),
      };
    }

    return NextResponse.json(ApiResponseHandler.success(results));
  } catch (error) {
    console.error("Blog posts error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(ApiResponseHandler.error("BLOG_ERROR", "Internal server error"), {
      status: 500,
    });
  }
}

export const POST = validateBody<CreateBlogPostInput>(createBlogPostSchema)(async (
  req: NextRequest,
  validated: CreateBlogPostInput
) => {
  try {
    // TODO: Add authentication check for admin
    const {
      title,
      content,
      excerpt,
      author,
      categoryId,
      tags,
      image,
      seoTitle,
      seoDescription,
      seoKeywords,
      featured,
      status,
    } = validated;

    const post = await blogContentService.createBlogPost(
      title,
      content,
      excerpt,
      author,
      categoryId || "",
      tags,
      image,
      seoTitle,
      seoDescription,
      seoKeywords,
      featured,
      status
    );

    return NextResponse.json(ApiResponseHandler.success(post), { status: 201 });
  } catch (error) {
    console.error("Blog post creation error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(ApiResponseHandler.error("BLOG_ERROR", "Failed to create post"), {
      status: 400,
    });
  }
});
