"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onSuggestions?: (suggestions: string[]) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  onSuggestions,
  placeholder = "Search products...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/search/products?query=${encodeURIComponent(query)}&limit=5`
        );
        const data = await res.json();
        const suggestions = data.suggestions || [];
        setSuggestions(suggestions);
        setShowSuggestions(true);
        onSuggestions?.(suggestions);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSuggestions]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    onSearch?.(searchQuery);
  };

  return (
    <div className="form-control relative w-full">
      <div className="input-group w-full">
        <input
          type="text"
          placeholder={placeholder}
          className="input input-bordered w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
        />
        <button className="btn btn-square btn-primary" onClick={() => handleSearch(query)}>
          <Search size={20} />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="dropdown-content menu bg-base-100 rounded-box z-10 mt-1 w-full p-2 shadow">
          {suggestions.map((suggestion, idx) => (
            <li key={idx}>
              <a onClick={() => handleSearch(suggestion)}>{suggestion}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
