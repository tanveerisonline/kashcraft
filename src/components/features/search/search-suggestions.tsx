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
    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
      {suggestions.map((suggestion, index) => (
        <li
          key={index}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  );
};

export default SearchSuggestions;
