"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  initialMin?: number;
  initialMax?: number;
  onApplyFilter: (min: number, max: number) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  initialMin,
  initialMax,
  onApplyFilter,
}) => {
  const [range, setRange] = useState<[number, number]>([
    initialMin ?? minPrice,
    initialMax ?? maxPrice,
  ]);

  const handleSliderChange = (newRange: number[]) => {
    setRange([newRange[0], newRange[1]]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setRange([Math.max(minPrice, Math.min(value, range[1])), range[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setRange([range[0], Math.min(maxPrice, Math.max(value, range[0]))]);
    }
  };

  const handleApply = () => {
    onApplyFilter(range[0], range[1]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={1}
            value={range}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="min-price">Min</Label>
            <Input
              id="min-price"
              type="number"
              value={range[0]}
              onChange={handleMinInputChange}
              onBlur={handleApply}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max-price">Max</Label>
            <Input
              id="max-price"
              type="number"
              value={range[1]}
              onChange={handleMaxInputChange}
              onBlur={handleApply}
              className="w-full"
            />
          </div>
        </div>
        {/* Optionally add an explicit apply button if onBlur is not sufficient */}
        {/* <Button onClick={handleApply} className="w-full">Apply Filter</Button> */}
      </CardContent>
    </Card>
  );
};

export default PriceRangeFilter;
