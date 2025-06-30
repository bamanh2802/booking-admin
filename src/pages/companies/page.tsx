"use client";

import { useEffect, useState, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";

// API & Types
import companiesAPI from "@/services/api/car-company";
import type { CarCompany } from "@/types/car-company";

import { getCompanyColumns } from "@/components/companies/columns";
import { CompanyForm } from "@/components/companies/company-form";

import { DataTable } from "@/components/trips/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
// Components UI cơ bản
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Định nghĩa kiểu cho state lọc
interface CompanyFilters {
  query: string; // Cho tìm kiếm chung theo tên nhà xe
}

export default function CompanyManagementPage() {
  // --- State chính cho dữ liệu và pagination ---
  const [companies, setCompanies] = useState<CarCompany[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- State cho các hành động và UI ---
  const [editingCompany, setEditingCompany] = useState<CarCompany | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CarCompany | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- State cho Server-Side Pagination và Filtering ---
  const [filters, setFilters] = useState<CompanyFilters>({ query: "" });
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Hàm gọi API chính
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageIndex + 1,
        limit: pageSize,
        ...(filters.query && { name: filters.query }), // `name` là param tìm kiếm
      };
      const response = await companiesAPI.getAllCompanies(params);
      if (response.success) {
        setCompanies(response.data.results);
        setPageCount(response.data.pagination.totalPages);
      } else {
        toast.error("Lấy danh sách nhà xe thất bại", {
          description: response.message,
        });
      }
    } catch (error) {
      const err = error as Error;
      toast.error("Lỗi kết nối", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để theo dõi và gọi lại API, có debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (table.getState().pagination.pageIndex !== 0) {
        table.setPageIndex(0);
      } else {
        fetchCompanies();
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, [pageIndex, pageSize]);

  const handleOpenCreateForm = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };
  const handleOpenEditForm = (company: CarCompany) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  };
  const handleFormSuccess = () => {
    handleCloseForm();
    fetchCompanies();
  };
  const handleDeleteRequest = (company: CarCompany) => {
    setDeletingCompany(company);
  };

  const confirmDelete = async () => {
    if (!deletingCompany) return;
    const promise = () => companiesAPI.delete(deletingCompany._id); // Giả sử có hàm delete
    toast.promise(promise, {
      loading: "Đang xóa...",
      success: () => {
        setDeletingCompany(null);
        fetchCompanies();
        return `Đã xóa nhà xe ${deletingCompany.name}.`;
      },
      error: "Xóa thất bại.",
    });
  };

  // --- Khởi tạo và cấu hình Tanstack Table ---
  const columns = useMemo(
    () => getCompanyColumns(handleOpenEditForm, handleDeleteRequest),
    []
  );

  const table = useReactTable({
    data: companies,
    columns,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="container mx-auto pb-6">
      <div className="space-y-4">
        <DataTableToolbar>
          <Input
            placeholder="Tìm theo tên nhà xe..."
            value={filters.query}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            className="h-10 w-[250px]"
          />
          {/* Có thể thêm các bộ lọc khác ở đây, ví dụ lọc theo loại VIP/Thường */}
          <Button onClick={handleOpenCreateForm}>Thêm Nhà xe</Button>
        </DataTableToolbar>

        <DataTable table={table} columns={columns} isLoading={isLoading} />

        <DataTablePagination table={table} />
      </div>

      {/* --- Các Sheet và Dialog (không thay đổi cấu trúc) --- */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {editingCompany ? "Chỉnh sửa nhà xe" : "Tạo nhà xe mới"}
            </SheetTitle>
            <SheetDescription>
              {editingCompany
                ? "Cập nhật thông tin cho nhà xe."
                : "Điền thông tin để tạo một nhà xe mới."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <CompanyForm
              initialData={editingCompany}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deletingCompany}
        onOpenChange={() => setDeletingCompany(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa nhà xe{" "}
              <strong>{deletingCompany?.name}</strong>. Các chuyến đi liên quan
              có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
