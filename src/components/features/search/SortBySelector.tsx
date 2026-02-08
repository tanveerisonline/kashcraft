"use client";

interface SortOption {
  value: string;
  label: string;
}

interface SortBySelectorProps {
  options?: SortOption[];
  onSort?: (sortBy: string) => void;
}

const defaultOptions: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "bestselling", label: "Best Selling" },
];

export function SortBySelector({ options = defaultOptions, onSort }: SortBySelectorProps) {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text font-semibold">Sort by:</span>
      </label>
      <select
        className="select select-bordered w-full"
        onChange={(e) => onSort?.(e.target.value)}
        defaultValue="relevance"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
