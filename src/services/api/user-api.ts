import { BaseAPI } from "./base-api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth";
import type {
  User,
  UserListResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
} from "@/types/user";
import type { ApiResponse } from "@/types/api";

class UserAPI extends BaseAPI {
  constructor() {
    super("/admin/users");
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post("/login", credentials);
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    return this.post("/refresh-token");
  }

  // User management endpoints
  async getUserList(params?: UserListParams): Promise<UserListResponse> {
    return this.get("", params);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.post("/", userData);
  }

  async getUserById(userId: string): Promise<UserDetailResponse> {
    return this.get(`/${userId}`);
  }

  async updateUser(
    userId: string,
    userData: UpdateUserRequest,
  ): Promise<ApiResponse<User>> {
    return this.patch(`/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.delete(`/${userId}`);
  }
}

export const userAPI = new UserAPI();
export default userAPI;
