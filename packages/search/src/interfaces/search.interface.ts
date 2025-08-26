export interface SearchQuery {
  term: string;
  filters?: Record<string, any>;
  sort?: SearchSort[];
  pagination?: SearchPagination;
  highlight?: string[];
}

export interface SearchSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchPagination {
  page: number;
  limit: number;
}

export interface SearchResult<T = any> {
  hits: SearchHit<T>[];
  total: number;
  page: number;
  limit: number;
  aggregations?: Record<string, any>;
}

export interface SearchHit<T = any> {
  id: string;
  score: number;
  source: T;
  highlight?: Record<string, string[]>;
}

export interface SearchIndex {
  name: string;
  mappings: Record<string, any>;
  settings?: Record<string, any>;
}