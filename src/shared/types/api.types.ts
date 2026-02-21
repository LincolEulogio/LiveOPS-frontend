export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
