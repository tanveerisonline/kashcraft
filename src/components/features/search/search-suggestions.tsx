import React from "react";

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
}) => {
  if (!suggestions.length) {
    return null;
  }

  return (
    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
      {suggestions.map((suggestion, index) => (
        <li
          key={index}
          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  );
};

export default SearchSuggestions;
