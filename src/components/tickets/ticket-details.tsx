"use client";

import type { Ticket } from "@/types/ticket";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-1">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium text-right">{value}</div>
  </div>
);

export function TicketDetails({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("vi-VN");

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h4 className="font-semibold">Thông tin hành khách</h4>
        <div className="p-4 border rounded-lg space-y-2">
          <DetailRow label="Họ tên" value={ticket.passengerName} />
          <DetailRow label="Số điện thoại" value={ticket.passengerPhone} />
          <DetailRow
            label="Mã vé"
            value={<span className="font-mono">{ticket.requestId}</span>}
          />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <h4 className="font-semibold">Thông tin chuyến đi</h4>
        <div className="p-4 border rounded-lg space-y-2">
          <DetailRow label="Tuyến đường" value={ticket.tripInfo.location} />
          <DetailRow label="Bến xe" value={ticket.tripInfo.station} />
          <DetailRow label="Nhà xe" value={ticket.carCompanyInfo.name} />
          <DetailRow
            label="Thời gian đi"
            value={formatDateTime(ticket.tripInfo.startTime)}
          />
          <DetailRow
            label="Thời gian đến"
            value={formatDateTime(ticket.tripInfo.endTime)}
          />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <h4 className="font-semibold">Chi tiết vé</h4>
        <div className="p-4 border rounded-lg space-y-2">
          <DetailRow
            label="Ghế đã đặt"
            value={
              <Badge variant="outline">
                {ticket.seats.map((s) => s.code).join(", ")}
              </Badge>
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
            value={<Badge>{ticket.status}</Badge>}
          />
          <DetailRow
            label="Ngày đặt"
            value={formatDateTime(ticket.createdAt)}
          />
        </div>
      </div>
    </div>
  );
}
