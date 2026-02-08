"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategoryFilterProps {
  categories: string[];
  initialSelectedCategories?: string[];
  onApplyFilter: (selectedCategories: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  initialSelectedCategories = [],
  onApplyFilter,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialSelectedCategories,
  );

  const handleCheckboxChange = (category: string, isChecked: boolean) => {
    let newSelectedCategories;
    if (isChecked) {
      newSelectedCategories = [...selectedCategories, category];
    } else {
      newSelectedCategories = selectedCategories.filter((c) => c !== category);
    }
    setSelectedCategories(newSelectedCategories);
    onApplyFilter(newSelectedCategories);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(category, checked as boolean)
                }
              />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
