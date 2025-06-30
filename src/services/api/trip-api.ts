// src/api/trip.ts

import { BaseAPI } from "./base-api";
import type { Trip, TripListParams, TripListResponse, CreateNewTripProps } from "@/types/trip";

class TripAPI extends BaseAPI {
  constructor() {
    super("/trips");
  }

  async getAllTrip(params?: TripListParams): Promise<TripListResponse> {
    return this.get("/", params);
  }

  async getTripById(id: string): Promise<{ data: Trip }> {
    return this.get(`/${id}`);
  }

  async createTrip(data: CreateNewTripProps): Promise<{ data: Trip }> {
    return this.post("/", data);
  }

  async updateTrip(id: string, data: CreateNewTripProps): Promise<{ data: Trip }> {
    return this.patch(`/${id}`, data);
  }

  async deleteTrip(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }

  async getDetailTrip(id: string): Promise<any> {
    return this.get(`/${id}`);
  }
}

export const tripAPI = new TripAPI();
export default tripAPI;