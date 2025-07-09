// src/components/requests/columns.tsx

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
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import type { TicketRequest, RequestTitle, RequestStatus } from "@/types/request";

// --- Helpers ---
const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --- Badge Components ---
const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const config = {
    Approved: { variant: "default" as const, text: "Đã chấp thuận", icon: Check },
    Rejected: { variant: "destructive" as const, text: "Đã từ chối", icon: X },
    Pending: { variant: "secondary" as const, text: "Chờ xử lý", icon: Info },
  };
  const current = config[status];
  const Icon = current.icon;
  return (
    <Badge variant={current.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {current.text}
    </Badge>
  );
};

const TitleBadge = ({ title }: { title: RequestTitle }) => {
  const styles = {
    "Book Ticket": { variant: "default" as const, icon: Ticket, text: "Đặt vé" },
    "Cancel Ticket": { variant: "outline" as const, icon: FilePenLine, text: "Hủy vé" },
    "Refund Ticket": { variant: "destructive" as const, icon: CircleDollarSign, text: "Hoàn tiền" },
  };
  const currentStyle = styles[title];
  const Icon = currentStyle.icon;
  return (
    <Badge variant={currentStyle.variant} className="whitespace-nowrap h-fit">
      <Icon className="mr-2 h-4 w-4" />
      {currentStyle.text}
    </Badge>
  );
};

// --- Type Guards ---
const hasPrice = (request: TicketRequest): request is TicketRequest & { price: number } => {
  return 'price' in request && typeof request.price === 'number';
};

const hasAmount = (request: TicketRequest): request is TicketRequest & { amount: number } => {
  return 'amount' in request && typeof request.amount === 'number';
};

const hasPassengerName = (request: TicketRequest): request is TicketRequest & { passengerName: string } => {
  return 'passengerName' in request;
};

const hasReason = (request: TicketRequest): request is TicketRequest & { reason: string } => {
  return 'reason' in request;
};

const hasTicketId = (request: TicketRequest): request is TicketRequest & { ticketId: string } => {
  return 'ticketId' in request;
};

const hasTripInfo = (request: TicketRequest): request is TicketRequest & { tripInfo: any } => {
  return 'tripInfo' in request;
};

// --- Main Columns Definition ---
export const getRequestColumns = (
  onViewDetails: (req: TicketRequest) => void,
  onApprove: (req: TicketRequest) => void,
  onReject: (req: TicketRequest) => void
): ColumnDef<TicketRequest>[] => [
  {
    id: "requestInfo",
    header: "Thông tin yêu cầu",
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="space-y-2">
          {/* Title Badge */}
          <TitleBadge title={request.titleRequest} />
          
          {/* Main Info */}
          <div className="space-y-1">
            {hasPassengerName(request) && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-sm">{request.passengerName}</span>
              </div>
            )}
            
            {hasReason(request) && (
              <p className="text-sm text-muted-foreground italic line-clamp-2" title={request.reason}>
                {request.reason}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "details",
    header: "Chi tiết",
    cell: ({ row }) => {
      const request = row.original;
      
      return (
        <div className="space-y-1 text-sm">
          {request.titleRequest === "Book Ticket" && hasTripInfo(request) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{request.tripInfo?.location || 'N/A'}</span>
            </div>
          )}
          
          {(request.titleRequest === "Cancel Ticket" || request.titleRequest === "Refund Ticket") && hasTicketId(request) && (
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-mono text-xs">#{request.ticketId?.slice(-8)}</span>
            </div>
          )}
          
          {request.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "value",
    header: () => <div className="text-right">Giá trị</div>,
    cell: ({ row }) => {
      const request = row.original as any;
      
      if (hasPrice(request)) {
        return <div className="font-semibold text-right">{formatCurrency(request.price)}</div>;
      }
      
      if (hasAmount(request)) {
        return <div className="font-semibold text-right">{formatCurrency(request.amount)}</div>;
      }
      
      return <div className="text-right text-muted-foreground">N/A</div>;
    },
  },
  {
    id: "creator",
    header: "Người tạo",
    cell: ({ row }) => {
      const creator = row.original.creatorInfo;
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {creator ? creator.fullName : "Khách hàng"}
            </div>
            {creator?.fullName && (
              <div className="text-xs text-muted-foreground truncate">
                {creator?.fullName}
              </div>
            )}
          </div>
        </div>
      );
    },
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
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(request)}
            className="text-xs"
          >
            Chi tiết
          </Button>
          
          {isPending && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700" 
                onClick={() => onApprove(request)}
                title="Chấp thuận"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700" 
                onClick={() => onReject(request)}
                title="Từ chối"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      );
    },
  },
];