import React from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  className?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews, className }) => {
  if (!reviews || reviews.length === 0) {
    return <div className={`text-gray-600 ${className}`}>No reviews yet. Be the first to review!</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{review.author}</h3>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <div className="mt-1 flex items-center">
            {/* Placeholder for star rating */}
            <span className="text-yellow-500">{'★'.repeat(Math.round(review.rating))}</span>
            <span className="ml-2 text-sm text-gray-600">{review.rating.toFixed(1)} out of 5 stars</span>
          </div>
          <p className="mt-2 text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export { ProductReviews };
