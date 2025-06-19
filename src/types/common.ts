// Base entity interface
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination related types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and filter types
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOption;
  page?: number;
  limit?: number;
} 