"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";

interface ProductReviewProps {
  productId: string;
  onSubmitted?: () => void;
}

export function ProductReview({ productId, onSubmitted }: ProductReviewProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setMessage({ type: "error", text: "Please log in to review" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, review }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Review submitted!" });
        setRating(0);
        setTitle("");
        setReview("");
        onSubmitted?.();
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: "Failed to submit review" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error submitting review" });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id) {
    return <p className="text-center text-gray-500">Please log in to review this product</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 p-6 shadow">
      <h3 className="mb-4 text-lg font-bold">Share Your Review</h3>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">Rating</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="btn btn-ghost btn-circle"
            >
              <Star
                size={24}
                className={rating >= value ? "fill-warning text-warning" : "text-gray-400"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">Review Title</span>
        </label>
        <input
          type="text"
          placeholder="Brief summary of your review"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">Your Review</span>
        </label>
        <textarea
          placeholder="Share your detailed experience with this product..."
          className="textarea textarea-bordered h-24"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.type === "success" ? "text-success" : "text-error"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading || rating === 0 || !title || !review}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
