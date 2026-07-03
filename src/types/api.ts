export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface APIListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}
