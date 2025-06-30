// src/api/trip.ts

import { BaseAPI } from "./base-api";
import type { Trip, TripListParams } from "@/types/trip";
import type { CarCompanyListResponse, CarCompanyProps } from "@/types/car-company";

class CompaniesAPI extends BaseAPI {
  constructor() {
    super("/car-companies");
  }

  async getAllCompanies(params?: TripListParams): Promise<CarCompanyListResponse> {
    return this.get("/", params);
  }

  async getTripById(id: string): Promise<{ data: Trip }> {
    return this.get(`/${id}`);
  }

  async createTrip(data: CarCompanyProps): Promise<{ data: any }> {
    return this.post("/", data);
  }

  async updateTrip(id: string, data: CarCompanyProps): Promise<{ data: Trip }> {
    return this.patch(`/${id}`, data);
  }

  async deleteTrip(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }
}

export const companiesAPI = new CompaniesAPI();
export default companiesAPI;