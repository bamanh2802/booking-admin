"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import type { QuickAction } from "@/types/quickaction";
import { quickActionAPI } from "@/services/api/quickaction-api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ticket, CheckCircle } from "lucide-react";

interface CreateColumnsProps {
  onActionComplete: () => void;
}

export const createColumns = ({ onActionComplete }: CreateColumnsProps): ColumnDef<QuickAction>[] => {
  // Hàm xử lý việc đánh dấu yêu cầu đã hoàn thành
  const handleMarkAsDone = (id: string) => {
    // API sẽ nhận { isDone: true }
    const promise = quickActionAPI.markQuickActionAsDone(id);

    toast.promise(promise, {
      loading: "Đang cập nhật trạng thái...",
      success: (res: any) => {
        if (res.success) {
          onActionComplete(); 
          return "Yêu cầu đã được đánh dấu đã xử lý.";
        } else {
          throw new Error(res.message);
        }
      },
      error: (err) => `Lỗi: ${err.message}`,
    });
  };

  return [
    {
      accessorKey: "phone",
      header: "Số điện thoại",
    },
    {
      accessorKey: "userInfo",
      header: "Người dùng",
      cell: ({ row }) => {
        const { userInfo } = row.original;
        return userInfo ? (
          <div className="flex flex-col">
            <span className="font-medium">{userInfo.email}</span>
            <span className="text-xs text-muted-foreground">Đã đăng ký</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Khách vãng lai</span>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Yêu cầu",
    },
    {
      accessorKey: "isDone", // Thay đổi accessorKey
      header: "Trạng thái",
      cell: ({ row }) => {
        const isDone = row.original.isDone;
        
        return isDone ? (
          <Badge variant="default">Đã xử lý</Badge>
        ) : (
          <Badge variant="secondary">Đang chờ</Badge>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
          locale: vi,
        });
      },
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const action = row.original;
        const navigate = useNavigate();

        const handleCreateTicket = () => {
          if (action.userId) {
            navigate(`/trips?userId=${action.userId}`);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Nút tạo vé vẫn giữ nguyên logic */}
              {action.userId && (
                <DropdownMenuItem onClick={handleCreateTicket}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Tạo vé
                </DropdownMenuItem>
              )}
              {/* Chỉ hiển thị nút này nếu yêu cầu chưa được xử lý */}
              {!action.isDone && (
                <DropdownMenuItem onClick={() => handleMarkAsDone(action._id)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Đánh dấu đã xử lý
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};