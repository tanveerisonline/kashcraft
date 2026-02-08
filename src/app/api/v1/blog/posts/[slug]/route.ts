import { blogContentService } from "@/lib/services/content/blog-content.service";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await blogContentService.getBlogPostBySlug(params.slug);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const relatedPosts = await blogContentService.getRelatedPosts(post.id);

    return Response.json({ post, relatedPosts });
  } catch (error) {
    console.error("Blog post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
