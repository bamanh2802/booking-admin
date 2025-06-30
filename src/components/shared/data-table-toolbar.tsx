"use client";

import type { ReactNode } from "react";

interface DataTableToolbarProps {
  children: ReactNode; // Để truyền vào các bộ lọc
}

export function DataTableToolbar({ children }: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">{children}</div>
    </div>
  );
}
