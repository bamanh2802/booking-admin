"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "./data-table-row-actions";
import type { QuickAction } from "@/types/quickaction";
import { format } from "date-fns";

// Props cho các cột, bao gồm callback
export type QuickActionColumnsProps = {
  onActionComplete: () => void;
};

// Hàm tạo columns, nhận props vào
export const createColumns = ({
  onActionComplete,
}: QuickActionColumnsProps): ColumnDef<QuickAction>[] => [
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "title",
    header: "Loại yêu cầu",
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "isDone",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isDone = row.getValue("isDone");
      return (
        <Badge variant={isDone ? "default" : "destructive"}>
          {isDone ? "Đã xong" : "Chờ xử lý"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "dd/MM/yyyy HH:mm")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onActionComplete={onActionComplete} />
    ),
  },
];
