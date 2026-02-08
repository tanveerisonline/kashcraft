"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
}

export function BlogSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/blog/posts?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to search");
        const data = await res.json();
        setResults(data.posts || []);
      } catch (err) {
        console.error("Error searching:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="form-control relative w-full">
      <div className="input-group">
        <input
          type="text"
          placeholder="Search blog posts..."
          className="input input-bordered w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-square">
          <Search size={20} />
        </button>
      </div>

      {results.length > 0 && (
        <ul className="dropdown-content menu bg-base-100 rounded-box z-10 mt-1 max-h-60 w-full overflow-y-auto p-2 shadow">
          {results.map((post) => (
            <li key={post.id}>
              <a href={`/blog/${post.slug}`}>
                <div className="flex flex-col gap-1 py-2">
                  <span className="line-clamp-1 font-semibold">{post.title}</span>
                  <span className="line-clamp-1 text-xs text-gray-500">{post.excerpt}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {query && !loading && results.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">No posts found</p>
      )}
    </div>
  );
}
