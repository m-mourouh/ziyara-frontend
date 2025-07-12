import { DestinationType } from "./destination.model";

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchRequest {
  keyword?: string;
  cityId?: number;
  type?: DestinationType;
  minRating?: number;
  maxPrice?: number;
  tags?: string[];
  freeOnly?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}
