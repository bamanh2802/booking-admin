"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { Trip, TripStatus } from "@/types/trip";

// Helper để format tiền tệ
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

// Helper để format ngày giờ
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN");

// Helper để hiển thị Badge trạng thái với màu sắc tương ứng
const StatusBadge = ({ status }: { status: TripStatus }) => {
  const variant =
    status === "Completed"
      ? "default"
      : status === "Delayed"
      ? "destructive"
      : "secondary";
  const text =
    status === "Completed"
      ? "Đã hoàn thành"
      : status === "Delayed"
      ? "Bị hoãn"
      : "Chưa bắt đầu";

  return <Badge variant={variant}>{text}</Badge>;
};

// Hàm định nghĩa các cột cho bảng
export const getColumns = (
  onViewDetails: (trip: Trip) => void, // Callback để xem chi tiết
  onEdit: (trip: Trip) => void, // Callback để sửa
  onDelete: (trip: Trip) => void // Callback để xóa
): ColumnDef<Trip>[] => [
  {
    accessorKey: "startLocation",
    header: "Tuyến đường",
    cell: ({ row }) => {
      const trip = row.original;
      return (
        <div>
          <div className="font-medium">
            {trip.startLocation} → {trip.endLocation}
          </div>
          <div className="text-sm text-muted-foreground">
            {trip.carCompanyInfo.name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Thời gian đi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDateTime(row.original.startTime),
  },
  {
    accessorKey: "price",
    header: "Giá vé",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "availableSeats",
    header: "Số ghế trống",
    cell: ({ row }) => (
      <div className="text-center">{row.original.availableSeats}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status as TripStatus} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-500 focus:bg-red-50 focus:text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
