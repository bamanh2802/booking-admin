import type { BaseEntity } from "./common";
import type { User } from "./user";
import type { Seat } from "./trip";

// Ticket related types
export interface Ticket extends BaseEntity {
  userId: string;
  tripId: string;
  requestId: string;
  price: number;
  status: 'Confirmed' | 'Cancelled' | 'Refunded';
  passengerName: string;
  passengerPhone: string;
  seats: Seat[];
  type: 'Regular' | 'VIP';
  createdBy: string | null;
  commissionPaid: boolean;
  pickupStation: string;
  dropoffStation: string;
  tripInfo: TripInfo;
  carCompanyInfo: CarCompanyInfoInTicket;
}

// Refund related types
export interface RefundRequest extends BaseEntity {
  ticketId: string;
  ticket?: Ticket;
  customerId: string;
  customer?: User;
  requestReason: string;
  refundAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  approvedBy?: string;
  approvedByUser?: User;
  approvedAt?: string;
  rejectionReason?: string;
  refundMethod: "cash" | "transfer" | "original_payment";
  processedAt?: string;
}

// Feedback related types
export interface Feedback extends BaseEntity {
  ticketId: string;
  ticket?: Ticket;
  customerId: string;
  customer?: User;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  category:
    | "service"
    | "punctuality"
    | "comfort"
    | "staff"
    | "cleanliness"
    | "other";
  status: "new" | "reviewed" | "responded";
  adminResponse?: string;
  respondedBy?: string;
  respondedByUser?: User;
  respondedAt?: string;
} 

export interface TripInfo {
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

interface CarCompanyInfoInTicket {
  _id: string;
  name: string;
  description: string;
  hotline: string;
  type: 'Regular' | 'VIP';
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    results: Ticket[];
    pagination: {
      total: number;
      page: string | number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface TicketUpdatePayload {
  passengerName?: string;
  passengerPhone?: string;
  seats: Seat[]
}

