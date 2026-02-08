"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerAvatar,
  rating,
  title,
  comment,
  date,
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={reviewerAvatar} alt={reviewerName} />
          <AvatarFallback>{reviewerName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-lg">{reviewerName}</CardTitle>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
                fill={i < rating ? "currentColor" : "none"}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">{date}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-md mb-2 font-semibold">{title}</h3>
        <p className="text-sm text-gray-700">{comment}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
