import React from "react";

interface SearchFiltersProps {
  children: React.ReactNode;
  title?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ children, title = "Filters" }) => {
  return (
    <div className="w-full border-r border-gray-200 p-4 md:w-64">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default SearchFilters;
