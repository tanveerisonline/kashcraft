"use client";

import { useState, useEffect } from "react";
import { RatingDisplay } from "./RatingDisplay";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

interface ReviewsListProps {
  productId: string;
  limit?: number;
}

export function ReviewsList({ productId, limit = 5 }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${productId}/reviews?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, limit]);

  if (loading) return <div className="skeleton h-40" />;
  if (reviews.length === 0) return <p className="text-center text-gray-500">No reviews yet</p>;

  return (
    <section className="space-y-4">
      <h3 className="mb-4 text-xl font-bold">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review.id} className="card bg-base-100 p-4 shadow">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <p className="font-semibold">{review.author}</p>
              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <RatingDisplay rating={review.rating} reviewCount={0} />
          </div>
          <h4 className="mb-2 font-semibold">{review.title}</h4>
          <p className="text-sm text-gray-700">{review.content}</p>
        </div>
      ))}
    </section>
  );
}
