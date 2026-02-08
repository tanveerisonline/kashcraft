"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterGroup {
  name: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  onFilterChange?: (groupName: string, optionId: string, checked: boolean) => void;
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filters.map((f) => f.name))
  );

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <aside className="bg-base-100 border-base-300 w-full rounded-lg border p-4 lg:w-64">
      <h2 className="mb-4 text-lg font-bold">Filters</h2>

      {filters.map((group) => (
        <div key={group.name} className="mb-4">
          <button
            className="hover:bg-base-200 flex w-full items-center justify-between rounded px-2 py-2"
            onClick={() => toggleGroup(group.name)}
          >
            <span className="text-sm font-semibold">{group.name}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${expandedGroups.has(group.name) ? "" : "-rotate-90"}`}
            />
          </button>

          {expandedGroups.has(group.name) && (
            <div className="mt-2 space-y-2 pl-2">
              {group.options.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    onChange={(e) => onFilterChange?.(group.name, option.id, e.target.checked)}
                  />
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-gray-500">({option.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-sm btn-ghost mt-4 w-full">Clear All</button>
    </aside>
  );
}
