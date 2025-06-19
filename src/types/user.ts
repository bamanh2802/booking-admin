import type { BaseEntity } from "./common";

// User related types
export interface User extends BaseEntity {
  email: string;
  fullName: string;
  phone: string;
  roleName: string;
  parentId: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roleName: "AgentLv1" | "AgentLv2" | "Client";
}

export interface UpdateUserRequest {
  fullName?: string;
}

export interface UserListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    results: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserDetailResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: User;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  roleName?: string;
  parentId?: string;
} 