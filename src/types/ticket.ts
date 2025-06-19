import type { BaseEntity } from "./common";
import type { BusRoute } from "./route";
import type { User } from "./user";

// Ticket related types
export interface Ticket extends BaseEntity {
  ticketCode: string;
  routeId: string;
  route?: BusRoute;
  customerId: string;
  customer?: User;
  agentId?: string; // ID of agent who sold the ticket
  agent?: User;
  seatNumber: string;
  departureTime: string;
  status: "booked" | "used" | "cancelled" | "pending_confirmation";
  price: number;
  paymentMethod: "cash" | "transfer" | "card";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  bookingDate: string;
  notes?: string;
}

export interface TicketFilters {
  status?: Ticket["status"][];
  routeId?: string;
  customerId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: Ticket["paymentStatus"][];
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