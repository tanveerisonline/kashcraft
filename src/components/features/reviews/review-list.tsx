"use client";

import ReviewCard from "./review-card";

interface Review {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="text-center text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
    </div>
  );
};

export default ReviewList;
