"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo SĐT..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 max-w-sm"
        />
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="false">Đang chờ</SelectItem>
            <SelectItem value="true">Đã xử lý</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}