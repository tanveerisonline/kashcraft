// src/lib/services/search/search.interface.ts

import { Product } from '@prisma/client'

// Placeholder interfaces for search-related types
export interface SearchFilters {
  category?: string[]
  priceRange?: { min?: number; max?: number }
  brand?: string[]
  // Add other relevant filters
}

export interface SearchResult {
  products: Product[]
  totalHits: number
  // Add pagination info, facets, etc.
}

export interface ISearchService {
  indexProduct(product: Product): Promise<boolean>
  removeProduct(productId: string): Promise<boolean>
  search(query: string, filters: SearchFilters): Promise<SearchResult>
  updateIndex(): Promise<boolean>
}
