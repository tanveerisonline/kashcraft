"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface ProductCategoryFilterProps {
  categories: Category[];
  selected?: string;
  onSelect?: (categoryId: string) => void;
}

export function ProductCategoryFilter({
  categories,
  selected,
  onSelect,
}: ProductCategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedCategory = categories.find((c) => c.id === selected);

  return (
    <div className="dropdown dropdown-end w-full">
      <button className="btn btn-outline w-full justify-between" onClick={() => setOpen(!open)}>
        <span>{selectedCategory?.name || "All Categories"}</span>
        <ChevronDown size={18} className={open ? "rotate-180" : ""} />
      </button>

      {open && (
        <ul className="dropdown-content menu bg-base-100 rounded-box w-full p-2 shadow">
          <li>
            <a
              onClick={() => {
                onSelect?.(null as any);
                setOpen(false);
              }}
            >
              All Categories
            </a>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <a
                onClick={() => {
                  onSelect?.(category.id);
                  setOpen(false);
                }}
                className={selected === category.id ? "active" : ""}
              >
                <span>{category.name}</span>
                <span className="badge badge-sm">{category.count}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
