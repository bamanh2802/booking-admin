// Authentication related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    _id: string;
    email: string;
    fullName: string;
    phone: string;
    roleName: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RefreshTokenResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
} 