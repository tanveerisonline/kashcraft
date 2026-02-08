"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  author: string;
  publishedAt: string;
  readTime?: number;
}

interface BlogPostListProps {
  category?: string;
  limit?: number;
}

export function BlogPostList({ category, limit = 9 }: BlogPostListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        params.append("limit", limit.toString());

        const res = await fetch(`/api/v1/blog/posts?${params}`);
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, limit]);

  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="skeleton h-80" />
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;
  if (posts.length === 0) return <p className="py-8 text-center">No posts found</p>;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <article className="card bg-base-100 shadow transition-shadow hover:shadow-lg">
            {post.image && (
              <figure className="relative h-48">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title line-clamp-2 text-lg">{post.title}</h2>
              <p className="line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>
              <div className="card-actions mt-4 items-center justify-between text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">{post.author}</span>
                  <span className="text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString()}
                    {post.readTime && ` • ${post.readTime} min read`}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm">Read More →</button>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
