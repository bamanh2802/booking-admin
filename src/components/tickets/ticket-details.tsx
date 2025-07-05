"use client";

import type { Ticket as BaseTicket } from "@/types/ticket";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import React from "react";

// Đề xuất một phiên bản type an toàn hơn cho Ticket
// Các thuộc tính lồng nhau nên là optional để phản ánh đúng thực tế dữ liệu có thể thiếu
type Ticket = Omit<BaseTicket, "tripInfo" | "carCompanyInfo"> & {
  tripInfo?: {
    location?: string;
    station?: string;
    startTime?: string;
    endTime?: string;
  };
  carCompanyInfo?: {
    name?: string;
  };
  seats: { code: string }[]; // Đảm bảo seats luôn là một mảng
};

// --- Constants ---
const FALLBACK_TEXT = "Chưa có thông tin";

// --- Helper Functions (an toàn hơn) ---

const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== "number") {
    return FALLBACK_TEXT;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return FALLBACK_TEXT;
  const date = new Date(dateString);
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) {
    return FALLBACK_TEXT;
  }
  return date.toLocaleString("vi-VN");
};

const getStatusVariant = (
  status: string | null | undefined
): BadgeProps["variant"] => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "PAID":
      return "secondary";
    case "CANCELLED":
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
};

// --- Sub-components for better structure ---

const DetailRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex justify-between items-center py-1.5 ${className}`}>
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium text-right">
      {value ?? (
        <span className="text-muted-foreground italic">{FALLBACK_TEXT}</span>
      )}
    </div>
  </div>
);

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-lg">{title}</h4>
    <div className="p-4 border rounded-lg space-y-2 bg-card">{children}</div>
  </div>
);

// --- Main Component ---

export function TicketDetails({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) {
    // Có thể hiển thị một thông báo thân thiện hơn thay vì null
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">
          Không có thông tin vé để hiển thị.
        </p>
      </div>
    );
  }

  const seatCodes = ticket.seats?.map((s) => s.code).join(", ");

  return (
    <div className="space-y-8 p-6 bg-background">
      <DetailSection title="Thông tin hành khách">
        <DetailRow label="Họ tên" value={ticket.passengerName} />
        <DetailRow label="Số điện thoại" value={ticket.passengerPhone} />
        <DetailRow
          label="Mã vé"
          value={
            ticket.requestId ? (
              <span className="font-mono">{ticket.requestId}</span>
            ) : undefined
          }
        />
      </DetailSection>

      <Separator />

      <DetailSection title="Thông tin chuyến đi">
        <DetailRow label="Tuyến đường" value={ticket.tripInfo?.location} />
        <DetailRow label="Bến xe" value={ticket.tripInfo?.station} />
        <DetailRow label="Nhà xe" value={ticket.carCompanyInfo?.name} />
        <DetailRow
          label="Thời gian đi"
          value={formatDateTime(ticket.tripInfo?.startTime)}
        />
        <DetailRow
          label="Thời gian đến"
          value={formatDateTime(ticket.tripInfo?.endTime)}
        />
      </DetailSection>

      <Separator />

      <DetailSection title="Chi tiết vé">
        <DetailRow
          label="Ghế đã đặt"
          value={
            seatCodes ? (
              <Badge variant="outline">{seatCodes}</Badge>
            ) : (
              "Chưa chọn ghế"
            )
          }
        />
        <DetailRow label="Điểm đón" value={ticket.pickupStation} />
        <DetailRow label="Điểm trả" value={ticket.dropoffStation} />
        <DetailRow
          label="Giá vé"
          value={
            <span className="font-bold text-primary">
              {formatCurrency(ticket.price)}
            </span>
          }
        />
        <DetailRow
          label="Trạng thái"
          value={
            <Badge variant={getStatusVariant(ticket.status)}>
              {ticket.status || FALLBACK_TEXT}
            </Badge>
          }
        />
        <DetailRow label="Ngày đặt" value={formatDateTime(ticket.createdAt)} />
      </DetailSection>
    </div>
  );
}
