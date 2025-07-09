import type { Seat } from "@/types/trip";
import { BaseAPI } from "./base-api";


import type { RequestListResponse } from "@/types/request";

class RequestAPI extends BaseAPI {
  constructor() {
    super("/ticket-requests");
  }

  async createNewRequest(
    userId: string,
    tripId: string,
    status: string,
    titleRequest: string,
    seats: Seat[],
    passengerName: string,
    passengerPhone: string,
    type: string,
    price: string,
  ) {
    
    return this.post("/", {
      userId,
      tripId,
      status,
      titleRequest,
      seats,
      passengerName,
      passengerPhone,
      type,
      price,
    })
  }

  

  async getAllRequests(params: any): Promise<RequestListResponse> {
    return this.get("/", params)
  }

   async approveRequest(id: string, titleRequest: string, status?: string, seats?: Seat[]): Promise<void> {
      return this.patch(`/${id}`, {
        titleRequest,
        status,
        seats
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
