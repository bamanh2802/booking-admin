// src/api/ticket.ts
import { BaseAPI } from "./base-api";
import type { TicketListResponse, Ticket,  } from "@/types/ticket";


class TicketAPI extends BaseAPI {
  constructor() {
    super("/tickets");
  }

  // API sẽ nhận các tham số để lọc và phân trang
  async getAllTickets(params?: { [key: string]: any }): Promise<TicketListResponse> {
    return this.get("/", params);
  }

  async updateTicket(id: string, payload: any): Promise<{ data: Ticket }> {
    return this.patch(`/${id}`, payload); 
  }

  // Hàm hủy vé (thường là một action riêng)
  async cancelTicket(id:string): Promise<{ data: Ticket }> {
    return this.post(`/${id}/cancel`, {}); // Giả sử dùng POST đến endpoint /:id/cancel
  }

}

export const ticketAPI = new TicketAPI();