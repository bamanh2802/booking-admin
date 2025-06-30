// src/types/commission.ts

export interface Commission {
  _id: string;
  percent: number;
  roleId: string;
  roleName: string;
}

export interface CommissionListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Commission[];
}

// Payload để cập nhật hoa hồng
export interface CommissionUpdatePayload {
  percent: number;
}