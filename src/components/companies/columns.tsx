// src/app/(main)/companies/columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { CarCompany } from "@/types/car-company";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "../trips/data-table-row-actions"; // Tái sử dụng component actions

export const getCompanyColumns = (
  onEdit: (company: CarCompany) => void,
  onDelete: (company: CarCompany) => void
): ColumnDef<CarCompany>[] => [
  {
    accessorKey: "name",
    header: "Tên nhà xe",
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{company.name}</span>
          <span className="text-sm text-muted-foreground">
            {company.description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "hotline",
    header: "Hotline",
  },
  {
    accessorKey: "type",
    header: "Loại hình",
    cell: ({ row }) => <Badge>{row.original.type}</Badge>,
  },
  {
    accessorKey: "totalSeats",
    header: "Tổng số ghế",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
