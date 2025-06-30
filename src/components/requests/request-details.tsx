"use client";

import type { TicketRequest, RequestTitle } from "@/types/request";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DetailRow = ({
  label,
  value,
  hidden = false,
}: {
  label: string;
  value: React.ReactNode;
  hidden?: boolean;
}) => {
  if (hidden) return null;
  return (
    <div className="flex flex-col gap-1 py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
};

// CẬP NHẬT: Dùng lại map từ file columns.tsx để nhất quán
const TITLE_STYLES: {
  [key in RequestTitle]: {
    label: string;
    variant: "default" | "outline" | "destructive";
  };
} = {
  "Book Ticket": { label: "Yêu cầu Đặt vé", variant: "default" },
  "Cancel Ticket": { label: "Yêu cầu Hủy vé", variant: "outline" },
  "Refund Ticket": { label: "Yêu cầu Hoàn tiền", variant: "destructive" },
};

export function RequestDetails({ request }: { request: TicketRequest | null }) {
  if (!request) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("vi-VN");
  const titleStyle = TITLE_STYLES[request.titleRequest];

  return (
    <div className="space-y-4">
      <DetailRow
        label="Loại yêu cầu"
        value={<Badge variant={titleStyle.variant}>{titleStyle.label}</Badge>}
      />
      <DetailRow
        label="Hành khách"
        value={`${request.passengerName} - ${request.passengerPhone}`}
      />
      <Separator />
      <DetailRow label="Chuyến đi" value={request.tripInfo.location} />
      <DetailRow label="Nhà xe" value={request.carCompanyInfo.name} />
      <DetailRow
        label="Thời gian đi"
        value={formatDateTime(request.tripInfo.startTime)}
      />
      <DetailRow
        label="Ghế yêu cầu xử lý"
        value={
          <Badge variant="secondary">
            {request.seats.map((s) => s.code).join(", ")}
          </Badge>
        }
      />
      <Separator />
      <DetailRow label="Giá vé gốc" value={formatCurrency(request.price)} />

      {/* CẬP NHẬT: Chỉ hiển thị các trường này nếu chúng tồn tại */}
      <DetailRow
        label="Số tiền yêu cầu hoàn"
        value={
          <span className="font-bold text-primary">
            {formatCurrency(request.amount!)}
          </span>
        }
        hidden={typeof request.amount !== "number"}
      />
      <DetailRow
        label="Lý do của khách hàng"
        value={
          <p className="italic bg-muted p-3 rounded-md">{request.reason}</p>
        }
        hidden={!request.reason}
      />
    </div>
  );
}
