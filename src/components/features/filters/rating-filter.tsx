"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface RatingFilterProps {
  initialSelectedRatings?: number[];
  onApplyFilter: (selectedRatings: number[]) => void;
}

const RatingFilter: React.FC<RatingFilterProps> = ({
  initialSelectedRatings = [],
  onApplyFilter,
}) => {
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    initialSelectedRatings,
  );

  const handleCheckboxChange = (rating: number, isChecked: boolean) => {
    let newSelectedRatings;
    if (isChecked) {
      newSelectedRatings = [...selectedRatings, rating];
    } else {
      newSelectedRatings = selectedRatings.filter((r) => r !== rating);
    }
    setSelectedRatings(newSelectedRatings);
    onApplyFilter(newSelectedRatings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(rating, checked as boolean)
                }
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star key={i + rating} className="h-4 w-4 text-gray-300" fill="none" />
                ))}
                <span className="ml-2">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingFilter;
