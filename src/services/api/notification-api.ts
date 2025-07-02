// src/api/ticket.ts
import { BaseAPI } from "./base-api";


class NotificationAPI extends BaseAPI {
  constructor() {
    super("/notification");
  }

  // API sẽ nhận các tham số để lọc và phân trang
  async getAllNotifications(params?: { [key: string]: any }): Promise<any> {
    return this.get("/", params);
  }

  async markNotificationAsRead(id: string): Promise<{ data: Notification }> {
    return this.patch(`/${id}`);
  }


}

export const notificationAPI = new NotificationAPI();