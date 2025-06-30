"use client";

import type { Table } from "@tanstack/react-table";
import { Search, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL_ROLE_OPTIONS } from "@/constants/roles";
import type { User } from "@/types/user";

interface DataTableToolbarProps {
  table: Table<User>;
  onAdd: () => void;
  onRefresh: () => void;
}

export function DataTableToolbar({
  table,
  onAdd,
  onRefresh,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-10 w-[150px] pl-8 lg:w-[250px]"
          />
        </div>
        <select
          value={
            (table.getColumn("roleName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("roleName")?.setFilterValue(event.target.value)
          }
          className="h-10 px-3 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Tất cả vai trò</option>
          {ALL_ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>
    </div>
  );
}
