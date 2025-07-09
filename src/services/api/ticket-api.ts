// src/api/ticket.ts
import type { Seat } from "@/types/trip";
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
  async cancelTicket(id:string, seats: Seat[]): Promise<{ data: Ticket }> {
    return this.patch(`/${id}`, {titleRequest: "Cancel Ticket", seats}); 
  }

}

export const ticketAPI = new TicketAPI();