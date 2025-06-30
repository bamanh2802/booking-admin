import { BaseAPI } from "./base-api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth";

class AuthAPI extends BaseAPI {
  constructor() {
    super("/admin/auth");
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post("/login", credentials);
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    return this.post("/refresh-token");
  }
}

export const authAPI = new AuthAPI();
export default authAPI;
