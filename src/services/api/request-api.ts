import { BaseAPI } from "./base-api";


import type { RequestListResponse } from "@/types/request";

class RequestAPI extends BaseAPI {
  constructor() {
    super("/ticket-requests");
  }

  async getAllRequests(params: any): Promise<RequestListResponse> {
    return this.get("/", params)
  }

   async approveRequest(id: string): Promise<void> {
      return this.patch(`/${id}`, {
        titleRequest: "Book Ticket"
      }); 
    }
  
    async rejectRequest(id:string): Promise<void> {
      return this.patch(`/${id}`, {
        status: "Rejected"
      });
    }
}

export const requestAPI = new RequestAPI();
export default requestAPI;
