// src/api/ticket.ts
import { BaseAPI } from "./base-api";

class QuickActionAPI extends BaseAPI {

  constructor() {
    super("/admin/quick-action");
  }

  // API sẽ nhận các tham số để lọc và phân trang
  async getAllQuickActions(params?: { [key: string]: any }): Promise<any> {
    return this.get("/", params);
  }

  async markQuickActionAsDone(id: string): Promise<{ data: any }> {
    return this.patch(`/${id}`, { isDone: true });
  }


}

export const quickActionAPI = new QuickActionAPI();