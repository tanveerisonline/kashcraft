"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useState } from "react";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be 1-5"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  comment: z.string().min(1, "Comment is required").max(500, "Comment is too long"),
});

type ReviewFormInputs = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  onSubmit: (data: ReviewFormInputs) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const handleStarClick = (ratingValue: number) => {
    form.setValue("rating", ratingValue, { shouldValidate: true });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${
                      i < (hoveredRating || form.watch("rating")) ? "text-yellow-500" : "text-gray-300"
                    }`}
                    fill={i < (hoveredRating || form.watch("rating")) ? "currentColor" : "none"}
                    onClick={() => handleStarClick(i + 1)}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
              {form.formState.errors.rating && (
                <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Review Title</label>
              <Input
                id="title"
                placeholder="Great product!"
                value={form.watch("title") || ""}
                onChange={(e) => form.setValue("title", e.target.value)}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Review</label>
              <Textarea
                id="comment"
                placeholder="Tell us more about your experience..."
                className="resize-y"
                value={form.watch("comment") || ""}
                onChange={(e) => form.setValue("comment", e.target.value)}
              />
              {form.formState.errors.comment && (
                <p className="text-sm text-red-500">{form.formState.errors.comment.message}</p>
              )}
            </div>

            <Button type="submit">Submit Review</Button>
          </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
