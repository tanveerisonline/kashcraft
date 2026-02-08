"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  featured?: boolean;
}

export function FeaturedPosts() {
  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/blog/posts?limit=3&featured=true");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="skeleton h-64" />;
  if (posts.length === 0) return null;

  return (
    <section className="from-primary to-primary-focus text-primary-content rounded-lg bg-gradient-to-r py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold">Featured From Our Blog</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="card cursor-pointer bg-white shadow-lg transition-shadow hover:shadow-xl">
                {post.image && (
                  <figure className="relative h-40">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  </figure>
                )}
                <div className="card-body">
                  <h3 className="card-title line-clamp-2 text-gray-900">{post.title}</h3>
                  <p className="line-clamp-2 text-gray-600">{post.excerpt}</p>
                  <div className="card-actions mt-4">
                    <button className="btn btn-primary btn-sm">Read More</button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
