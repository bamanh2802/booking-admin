"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Ticket } from "@/types/ticket";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN");

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const variant =
    status === "Confirmed"
      ? "default"
      : status === "Cancelled"
      ? "destructive"
      : "secondary";
  const text =
    status === "Confirmed"
      ? "Đã xác nhận"
      : status === "Cancelled"
      ? "Đã hủy"
      : "Đã hoàn thành";
  return <Badge variant={variant}>{text}</Badge>;
};

export const getTicketColumns = (
  onViewDetails: (ticket: Ticket) => void,
  onUpdate: (ticket: Ticket) => void,
  onCancel: (ticket: Ticket) => void
): ColumnDef<Ticket>[] => [
  {
    accessorKey: "requestId",
    header: "Mã vé",
    cell: ({ row }) => (
      <div className="font-mono">
        {row.original.requestId.slice(-8).toUpperCase()}
      </div>
    ),
  },
  {
    accessorKey: "passengerName",
    header: "Hành khách",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.passengerName}</div>
        <div className="text-muted-foreground text-sm">
          {row.original.passengerPhone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "tripInfo",
    header: "Thông tin chuyến đi",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.tripInfo.location}</div>
        <div className="text-muted-foreground text-sm">
          {formatDateTime(row.original.tripInfo.startTime)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "seats",
    header: "Ghế",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.seats.map((s) => s.code).join(", ")}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Giá vé
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.price)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      const canBeModified = ticket.status === "Confirmed";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(ticket)}>
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdate(ticket)}
              disabled={!canBeModified}
            >
              Cập nhật thông tin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onCancel(ticket)}
              disabled={!canBeModified}
              className="text-red-600 focus:text-red-500"
            >
              Hủy vé
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
