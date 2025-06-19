// Generic API response types
export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface ApiError {
  statusCode: number;
  message: string;
} 