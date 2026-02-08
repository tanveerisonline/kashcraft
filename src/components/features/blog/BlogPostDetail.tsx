"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  publishedAt: string;
  readTime?: number;
}

interface BlogPostDetailProps {
  slug: string;
}

export function BlogPostDetail({ slug }: BlogPostDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/blog/posts/${slug}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data.post || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="skeleton h-96" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!post) return <p className="text-center">Post not found</p>;

  return (
    <article className="prose prose-sm md:prose-base lg:prose-lg mx-auto max-w-4xl">
      {post.image && (
        <figure className="relative mb-8 h-96 overflow-hidden rounded-lg">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </figure>
      )}

      <h1>{post.title}</h1>

      <div className="mb-8 flex items-center gap-4 text-sm text-gray-500">
        <span>{post.author}</span>
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        {post.readTime && <span>{post.readTime} min read</span>}
      </div>

      <div className="bg-base-100 mb-8 rounded-lg p-6">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="divider" />

      <div className="card bg-base-100 p-6 shadow">
        <h3 className="mb-2 text-lg font-bold">About the Author</h3>
        <p>Written by {post.author}</p>
      </div>
    </article>
  );
}
