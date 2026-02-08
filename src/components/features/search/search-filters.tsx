import React from "react";

interface SearchFiltersProps {
  children: React.ReactNode;
  title?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  children,
  title = "Filters",
}) => {
  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default SearchFilters;
