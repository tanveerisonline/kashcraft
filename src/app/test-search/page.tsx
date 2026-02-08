"use client";

import React, { useState, useMemo } from "react";
import SearchBar from "@/components/features/search/search-bar";
import SearchResults from "@/components/features/search/search-results";
import SearchFilters from "@/components/features/search/search-filters";
import SearchSuggestions from "@/components/features/search/search-suggestions";
import NoResults from "@/components/features/search/no-results";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Pro",
    category: "Electronics",
    price: 1200,
    description: "Powerful laptop for professionals.",
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 150,
    description: "Tactile and responsive typing experience.",
  },
  {
    id: "3",
    name: "Wireless Mouse",
    category: "Accessories",
    price: 50,
    description: "Ergonomic design for comfortable use.",
  },
  {
    id: "4",
    name: "4K Monitor",
    category: "Electronics",
    price: 400,
    description: "Stunning visuals for work and play.",
  },
  {
    id: "5",
    name: "USB-C Hub",
    category: "Accessories",
    price: 75,
    description: "Expand your connectivity options.",
  },
  {
    id: "6",
    name: "Gaming Headset",
    category: "Gaming",
    price: 100,
    description: "Immersive audio for competitive gaming.",
  },
  {
    id: "7",
    name: "External SSD 1TB",
    category: "Storage",
    price: 130,
    description: "Fast and portable storage solution.",
  },
  {
    id: "8",
    name: "Webcam HD",
    category: "Electronics",
    price: 60,
    description: "Clear video calls and streaming.",
  },
  {
    id: "9",
    name: "Desk Lamp with Wireless Charger",
    category: "Home Office",
    price: 80,
    description: "Modern lamp with convenient charging.",
  },
  {
    id: "10",
    name: "Ergonomic Chair",
    category: "Home Office",
    price: 300,
    description: "Supportive chair for long working hours.",
  },
];

const categories = ["Electronics", "Accessories", "Gaming", "Storage", "Home Office"];

const TestSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSuggestions([]); // Clear suggestions on search
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleInputChangeForSuggestions = (query: string) => {
    // Simulate API call for suggestions
    if (query.length > 1) {
      const filteredSuggestions = dummyProducts
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .map((p) => p.name);
      setSuggestions(Array.from(new Set(filteredSuggestions)).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion); // Perform search with selected suggestion
  };

  const filteredProducts = useMemo(() => {
    let filtered = dummyProducts;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }

    return filtered;
  }, [searchQuery, selectedCategories]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">Search Components Test Page</h1>

      <div className="relative mb-8 flex justify-center">
        <SearchBar
          onSearch={handleSearch}
          onChange={handleInputChangeForSuggestions}
          initialQuery={searchQuery}
          placeholder="Search for products..."
        />
        {searchQuery.length > 1 && suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        )}
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <SearchFilters title="Product Categories">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
              />
              <Label htmlFor={category}>{category}</Label>
            </div>
          ))}
        </SearchFilters>

        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <SearchResults
              results={filteredProducts}
              renderItem={(product) => (
                <Card key={product.id} className="p-4">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.category}</p>
                  <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                  <p className="mt-2 text-sm">{product.description}</p>
                </Card>
              )}
            />
          ) : (
            <NoResults />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSearchPage;
