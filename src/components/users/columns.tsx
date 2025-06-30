"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { User } from "@/types/user";
import {
  getRoleBadgeVariant,
  getRoleDisplayName,
  getRoleBadgeStyle,
} from "@/constants/roles";

interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  // onDelete: (user: User) => void; // Có thể thêm lại sau
}

const UserActions = ({ user, onView, onEdit }: UserActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Mở menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onView(user)}>
        <Eye className="mr-2 h-4 w-4" />
        Xem chi tiết
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(user)}>
        <Edit className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </DropdownMenuItem>
      {/* <DropdownMenuSeparator />
      <DropdownMenuItem className="text-red-500" onClick={() => onDelete(user)}>
        <Trash2 className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem> */}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const getUserColumns = (
  onView: (user: User) => void,
  onEdit: (user: User) => void
  // onDelete: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "fullName",
    header: "Tên",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
  },
  {
    accessorKey: "roleName",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.original.roleName;
      return (
        <Badge
          variant={getRoleBadgeVariant(role)}
          style={getRoleBadgeStyle(role)}
        >
          {getRoleDisplayName(role)}
        </Badge>
      );
    },
    // Cho phép lọc theo cột này
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UserActions
        user={row.original}
        onView={onView}
        onEdit={onEdit}
        // onDelete={onDelete}
      />
    ),
  },
];
