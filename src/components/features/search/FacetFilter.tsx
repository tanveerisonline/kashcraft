"use client";

interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
}

interface FacetFilterProps {
  name: string;
  options: FacetOption[];
  onSelect?: (value: string, selected: boolean) => void;
}

export function FacetFilter({ name, options, onSelect }: FacetFilterProps) {
  return (
    <details className="border-base-300 collapse border">
      <summary className="collapse-title text-sm font-bold">{name}</summary>
      <div className="collapse-content space-y-2 pl-4">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              defaultChecked={option.selected}
              onChange={(e) => onSelect?.(option.value, e.target.checked)}
            />
            <span className="flex-1 text-sm">{option.label}</span>
            <span className="text-xs text-gray-500">({option.count})</span>
          </label>
        ))}
      </div>
    </details>
  );
}
