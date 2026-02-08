import React from "react";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number | number[];
  onValueChange?: (value: number | number[]) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className = "",
}) => {
  // Handle range values (for dual-handle sliders)
  if (Array.isArray(value) && value.length === 2) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex justify-between mb-2">
          <span className="text-sm">{value[0]}</span>
          <span className="text-sm">{value[1]}</span>
        </div>
        <div className="relative h-5">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              onValueChange?.([newValue, value[1]]);
            }}
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none"
            style={{ zIndex: 2 }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              onValueChange?.([value[0], newValue]);
            }}
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none"
            style={{ zIndex: 1 }}
          />
          <div className="absolute w-full h-2 mt-1.5 bg-gray-200 rounded-lg">
            <div
              className="absolute h-2 bg-blue-500 rounded-lg"
              style={{
                left: `${((value[0] - min) / (max - min)) * 100}%`,
                width: `${((value[1] - value[0]) / (max - min)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Handle single value
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value as number}
      onChange={(e) => {
        const newValue = parseFloat(e.target.value);
        onValueChange?.(newValue);
      }}
      className={`range ${className}`}
    />
  );
};

export { Slider };