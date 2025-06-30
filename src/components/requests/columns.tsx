"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Info,
  ThumbsDown,
  ThumbsUp,
  X,
  CircleDollarSign,
  Ticket,
  FilePenLine,
} from "lucide-react";
import type { TicketRequest, RequestTitle } from "@/types/request";

// --- Helpers ---
const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN");

// --- Badge Components ---
const StatusBadge = ({ status }: { status: TicketRequest["status"] }) => {
  const variant =
    status === "Approved"
      ? "default"
      : status === "Rejected"
      ? "destructive"
      : "secondary";
  const text =
    status === "Approved"
      ? "Đã chấp thuận"
      : status === "Rejected"
      ? "Đã từ chối"
      : "Chờ xử lý";
  const Icon = status === "Approved" ? Check : status === "Rejected" ? X : Info;
  return (
    <Badge variant={variant}>
      <Icon className="mr-1 h-3 w-3" />
      {text}
    </Badge>
  );
};

const TitleBadge = ({ title }: { title: RequestTitle }) => {
  const styles = {
    "Book Ticket": { variant: "default", icon: Ticket, text: "Đặt vé" },
    "Cancel Ticket": { variant: "outline", icon: FilePenLine, text: "Hủy vé" },
    "Refund Ticket": {
      variant: "destructive",
      icon: CircleDollarSign,
      text: "Hoàn tiền",
    },
  } as const;
  const currentStyle = styles[title];
  const Icon = currentStyle.icon;

  return (
    <Badge variant={currentStyle.variant}>
      <Icon className="mr-2 h-4 w-4" />
      {currentStyle.text}
    </Badge>
  );
};

// --- Main Columns Definition ---
export const getRequestColumns = (
  onViewDetails: (req: TicketRequest) => void,
  onApprove: (req: TicketRequest) => void,
  onReject: (req: TicketRequest) => void
): ColumnDef<TicketRequest>[] => [
  {
    accessorKey: "passengerName",
    header: "Hành khách",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.passengerName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.passengerPhone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "titleRequest",
    header: "Loại yêu cầu",
    cell: ({ row }) => <TitleBadge title={row.original.titleRequest} />,
  },
  {
    accessorKey: "tripInfo",
    header: "Chuyến đi",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.tripInfo.location}</div>
        <div className="text-sm text-muted-foreground">
          {formatDateTime(row.original.tripInfo.startTime)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Số tiền",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row }) => {
      const request = row.original;
      const isPending = request.status === "Pending";
      return (
        <div className="text-right space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(request)}
          >
            Chi tiết
          </Button>
          {isPending && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => onApprove(request)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => onReject(request)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
