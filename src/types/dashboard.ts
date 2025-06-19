import type { BaseEntity } from "./common";

// Agent related types
export interface Agent extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  level: "level1" | "level2";
  commissionRate: number; // percentage
  totalTicketsSold: number;
  totalRevenue: number;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  managerID?: string; // For level 2 agents
  manager?: Agent;
}

// Dashboard related types
export interface DashboardStats {
  totalRevenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  ticketsSold: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  refunds: {
    amount: number;
    count: number;
    percentageOfRevenue: number;
    percentageChange: number;
  };
}

export interface ChartData {
  date: string;
  revenue: number;
  ticketsSold: number;
  refunds: number;
} 