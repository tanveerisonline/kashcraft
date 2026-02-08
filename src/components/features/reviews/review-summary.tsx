"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
}) => {
  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(averageRating) ? "text-yellow-500" : "text-gray-300"
                  }`}
                  fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">{totalReviews} Reviews</p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm font-medium">{star} Star</span>
              <Progress
                value={calculatePercentage(
                  ratingDistribution[star as keyof typeof ratingDistribution]
                )}
                className="h-2 flex-1"
              />
              <span className="w-10 text-right text-sm text-gray-600">
                {ratingDistribution[star as keyof typeof ratingDistribution]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewSummary;
