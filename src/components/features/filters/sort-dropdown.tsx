"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  initialSortBy?: string;
  onSelectSort: (sortBy: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  initialSortBy,
  onSelectSort,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    initialSortBy || options[0]?.value || "",
  );

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    onSelectSort(value);
  };

  const currentLabel =
    options.find((option) => option.value === selectedOption)?.label ||
    "Sort By";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleSelect(option.value)}
            className={selectedOption === option.value ? "font-semibold" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
