// src/types/request.ts

import type { BaseEntity } from "./common"; // Giữ lại nếu bạn có định nghĩa này
import type { Seat } from "./trip"; // Giữ lại nếu bạn có định nghĩa này

// Định nghĩa các type phụ để code rõ ràng hơn
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type RequestTitle = 'Book Ticket' | 'Cancel Ticket' | 'Refund Ticket';

// CẬP NHẬT: Interface này được làm chi tiết hơn để khớp với dữ liệu API
interface TripInfo {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  location: string;
  station: string;
  time: string;
  totalSeats: number;
  availableSeats: number;
  carCompanyId: string;
}

// CẬP NHẬT: Interface này được làm chi tiết hơn để khớp với dữ liệu API
interface CarCompanyInfo {
  _id: string;
  name: string;
  description: string;
  hotline: string;
  type: 'Regular' | 'VIP';
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

// CẬP NHẬT: Interface TicketRequest chính để khớp hoàn toàn với dữ liệu API
export interface TicketRequest extends BaseEntity { // `extends BaseEntity` nếu bạn có
  // Bỏ đi các trường `extends BaseEntity` nếu bạn không dùng
  // _id: string;
  // createdAt: string;
  // updatedAt: string;
  
  userId: string;
  tripId: string;
  ticketId: string | null; // `ticketId` có thể là null cho "Book Ticket"
  titleRequest: RequestTitle;
  price: number;
  passengerName: string;
  passengerPhone: string;
  seats: Seat[];
  type: 'Regular' | 'VIP';
  status: RequestStatus;
  
  // Các trường có thể có hoặc không tùy loại request
  amount?: number; // `amount` chỉ có ở "Refund Ticket", nên là optional
  reason?: string; // `reason` có thể không có ở "Book Ticket", nên là optional

  // Các trường luôn có nhưng có thể null
  createdBy: string | null;
  pickupStation: string | null;
  dropoffStation: string | null;
  
  // Thông tin lồng nhau
  tripInfo: TripInfo;
  carCompanyInfo: CarCompanyInfo;

  // Trường không cần thiết ở frontend nhưng có trong API
  __v?: number; 
}

// Response từ API không đổi
export interface RequestListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    results: TicketRequest[];
    pagination: any; // Hoặc một type Pagination chi tiết hơn
  };
}