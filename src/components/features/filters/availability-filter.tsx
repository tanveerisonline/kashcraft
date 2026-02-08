"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AvailabilityFilterProps {
  options: string[]; // e.g., ["In Stock", "Out of Stock"]
  initialSelectedOptions?: string[];
  onApplyFilter: (selectedOptions: string[]) => void;
}

const AvailabilityFilter: React.FC<AvailabilityFilterProps> = ({
  options,
  initialSelectedOptions = [],
  onApplyFilter,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelectedOptions);

  const handleCheckboxChange = (option: string, isChecked: boolean) => {
    let newSelectedOptions;
    if (isChecked) {
      newSelectedOptions = [...selectedOptions, option];
    } else {
      newSelectedOptions = selectedOptions.filter((o) => o !== option);
    }
    setSelectedOptions(newSelectedOptions);
    onApplyFilter(newSelectedOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`availability-${option}`}
                checked={selectedOptions.includes(option)}
                onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
              />
              <Label htmlFor={`availability-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityFilter;
