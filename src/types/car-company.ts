// src/types/car-company.ts
import type { BaseEntity } from "./common";

export interface Seat {
  code: string;
  floor: number;
}

export interface CarCompany extends BaseEntity {
  name: string;
  description: string;
  hotline: string;
  type: 'Regular' | 'VIP';
  totalSeats: number;
  seatMap: Seat[];    
}

export interface CarCompanyProps {
  name: string;
  description: string;
  hotline: string;
  type: 'Regular' | 'VIP';
  totalSeats: number;
  seatMap: Seat[];  
}

export interface CarCompanyListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    results: CarCompany[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}