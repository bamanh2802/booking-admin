import type { BaseEntity } from "./common";


export interface TripListParams {
  page?: number;
  limit?: number;
} 
export interface Seat {
  code: string;
  floor: number;
}


// Định nghĩa thông tin về nhà xe
export interface CarCompanyInfo extends BaseEntity {
  name: string;
  description: string;
  hotline: string;
  type: 'Regular' | 'VIP';
  totalSeats: number;
  seatMap: Seat[];
}

// Định nghĩa thông tin về các ghế đã được đặt
export interface BookedSeats {
  _id: string;
  seats: Seat[];
  totalBookedSeats: number;
}

// Định nghĩa cho một chuyến đi
export interface Trip extends BaseEntity {
  startLocation: string;
  endLocation: string;
  startStation: string;
  endStation: string;
  startTime: string;
  endTime: string;
  carCompanyId: string;
  seatMapId: string;
  price: number;
  type: 'Regular' | 'VIP';
  availableSeats: number;
  totalSeats: number;
  status: TripStatus;
  carCompanyInfo: CarCompanyInfo;
  bookedSeats: BookedSeats;
}

// Định nghĩa cho thông tin phân trang
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Định nghĩa cho toàn bộ response của API lấy danh sách chuyến đi
export interface TripListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    results: Trip[];
    pagination: Pagination;
  };
}

export type TripStatus = "Not Started" | "Completed" | "Delayed";

export interface CreateNewTripProps {
  carCompanyId: string,
  endLocation: string,
  endStation: string,
  endTime: string,
  price: string,
  startLocation: string,
  startStation: string,
  startTime: string,
  type: string,
  status: string,
}

export interface TripDetails extends Trip {
  bookedSeats: {
    _id: string;
    seats: Seat[]; // Danh sách các ghế đã được đặt
    totalBookedSeats: number;
  };
}