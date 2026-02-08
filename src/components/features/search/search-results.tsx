import React from "react";

interface SearchResultsProps<T> {
  results: T[];
  renderItem: (item: T) => React.ReactNode;
  noResultsMessage?: string;
}

const SearchResults = <T,>({
  results,
  renderItem,
  noResultsMessage = "No results found.",
}: SearchResultsProps<T>) => {
  if (!results.length) {
    return <div className="py-8 text-center text-gray-500">{noResultsMessage}</div>;
  }

  return <div className="grid gap-4">{results.map(renderItem)}</div>;
};

export default SearchResults;
