"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel, type PaginationState } from "@tanstack/react-table";
import { useDebounce } from 'use-debounce';

import { DataTable } from "@/components/trips/data-table"; 
import { DataTablePagination } from "@/components/quickaction/data-table-pagination";
import { DataTableToolbar } from "@/components/quickaction/data-table-toolbar"; 
import { createColumns } from "@/components/quickaction/columns"; 

import type { QuickAction } from "@/types/quickaction";
import { quickActionAPI } from "@/services/api/quickaction-api";
import { toast } from "sonner";

export default function QuickActionsPage() {
  const [data, setData] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [statusFilter, setStatusFilter] = useState('false');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (statusFilter !== 'ALL') {
        params.isDone = statusFilter === 'true';
      }
      if (debouncedSearchQuery) {
        params.phone = debouncedSearchQuery.trim();
      }

      const response = await quickActionAPI.getAllQuickActions(params);
      
      // Kiểm tra response có thành công và có dữ liệu không
      if (response.success && response.data) {
        setData(response.data.docs); 

        // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
        // Tự tính toán tổng số trang từ `total` và `limit`
        const calculatedPageCount = Math.ceil(response.data.total / response.data.limit);
        setPageCount(calculatedPageCount);
        // --- KẾT THÚC THAY ĐỔI ---
      } else {
        // Nếu API không thành công, hiển thị lỗi và reset bảng
        toast.error("Lấy danh sách yêu cầu thất bại", { description: response.message });
        setData([]);
        setPageCount(0);
      }

    } catch (error) {
      console.error("Failed to fetch quick actions:", error);
      toast.error("Lỗi kết nối khi lấy danh sách yêu cầu.");
      setData([]);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, debouncedSearchQuery]);

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
    pageCount, // pageCount bây giờ đã được tính toán chính xác
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="container mx-auto py-10">
      

      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      <DataTable table={table} columns={columns} isLoading={isLoading} />
      <DataTablePagination table={table} />
    </div>
  );
}