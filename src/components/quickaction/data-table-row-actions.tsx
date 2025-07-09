"use client";

import type { Row } from "@tanstack/react-table";
import { toast } from "sonner"; // Hoặc react-hot-toast, toast từ shadcn
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quickActionAPI } from "@/services/api/quickaction-api";
import type { QuickAction } from "@/types/quickaction";

interface DataTableRowActionsProps {
  row: Row<QuickAction>;
  onActionComplete: () => void; 
}

export function DataTableRowActions({
  row,
  onActionComplete,
}: DataTableRowActionsProps) {
  const action = row.original;

  const handleMarkAsDone = async () => {
    try {
      await quickActionAPI.markQuickActionAsDone(action._id);
      toast.success("Đã đánh dấu yêu cầu là hoàn thành.");
      onActionComplete(); 
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
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
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(action.phone)}
        >
          Sao chép SĐT
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!action.isDone && (
          <DropdownMenuItem onClick={handleMarkAsDone}>
            Đánh dấu đã xong
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled className="text-red-500">
          Xóa yêu cầu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
