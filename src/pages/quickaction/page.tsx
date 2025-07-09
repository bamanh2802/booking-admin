"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type PaginationState,
} from "@tanstack/react-table";

import { DataTable } from "@/components/trips/data-table"; // Giả sử path này đúng
import { createColumns } from "@/components/quickaction/columns";
import type { QuickAction } from "@/types/quickaction";
import { quickActionAPI } from "@/services/api/quickaction-api";
import { DataTablePagination } from "@/components/quickaction/data-table-pagination";

export default function QuickActionsPage() {
  const [data, setData] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageCount, setPageCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      const response = await quickActionAPI.getAllQuickActions(params);
      console.log(response)
      setData(response.data.docs);
      setPageCount(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch quick actions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(
    () => createColumns({ onActionComplete: fetchData }),
    [fetchData]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Quản lý Yêu cầu nhanh</h1>
      <p className="text-muted-foreground mb-6">
        Danh sách các yêu cầu nhanh từ người dùng cần được xử lý.
      </p>

      <DataTable table={table} columns={columns} isLoading={isLoading} />
      <DataTablePagination table={table} />
    </div>
  );
}
