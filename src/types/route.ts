import type { BaseEntity } from "./common";

// Route related types
export interface BusRoute extends BaseEntity {
  departureLocation: string;
  arrivalLocation: string;
  busType: "regular" | "vip";
  price: number;
  departureTimes: string[]; // Array of departure times
  status: "active" | "inactive";
  estimatedDuration: number; // in minutes
  availableSeats: number;
  totalSeats: number;
}

export interface RouteFilters {
  status?: BusRoute["status"][];
  busType?: BusRoute["busType"][];
  departureLocation?: string;
  arrivalLocation?: string;
} 