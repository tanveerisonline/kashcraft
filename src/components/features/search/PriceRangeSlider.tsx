"use client";

import { useState } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  onRangeChange?: (min: number, max: number) => void;
}

export function PriceRangeSlider({
  min: initialMin,
  max: initialMax,
  step = 10,
  onRangeChange,
}: PriceRangeSliderProps) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);

  const handleMinChange = (value: number) => {
    if (value <= max) {
      setMin(value);
      onRangeChange?.(value, max);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value >= min) {
      setMax(value);
      onRangeChange?.(min, value);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Price Range</span>
      </label>

      <div className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text text-sm">Min: ${min}</span>
          </label>
          <input
            type="range"
            min={initialMin}
            max={initialMax}
            step={step}
            value={min}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className="range range-sm"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text text-sm">Max: ${max}</span>
          </label>
          <input
            type="range"
            min={initialMin}
            max={initialMax}
            step={step}
            value={max}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className="range range-sm"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-sm text-gray-500">
        ${min} - ${max}
      </p>
    </div>
  );
}
