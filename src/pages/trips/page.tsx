"use client";

import { useEffect, useState, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";

// API & Types
import tripAPI from "@/services/api/trip-api";
import type {
  Trip,
  TripDetails as TripDetailsType,
  TripStatus,
} from "@/types/trip";

// Components chuyên biệt cho trang này
import { getColumns } from "@/components/trips/columns";
import { TripForm } from "@/components/trips/trip-form";
import { TripDetails } from "@/components/trips/trip-details";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Định nghĩa kiểu cho state lọc
interface TripFilters {
  query: string; // Cho tìm kiếm chung theo tuyến đường
  status: TripStatus[];
}

export default function TripManagementPage() {
  // --- State chính cho dữ liệu và pagination ---
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- State cho các hành động và UI ---
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [viewingTripDetails, setViewingTripDetails] =
    useState<TripDetailsType | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // --- State cho Server-Side Pagination và Filtering ---
  const [filters, setFilters] = useState<TripFilters>({
    query: "",
    status: [],
  });
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Hàm gọi API chính, được tối ưu hóa
  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageIndex + 1,
        limit: pageSize,
        ...(filters.query && { location: filters.query }), // `location` là param tìm kiếm
        ...(filters.status.length > 0 && { status: filters.status.join(",") }),
      };
      const response = await tripAPI.getAllTrip(params);
      if (response.success) {
        setTrips(response.data.results);
        setPageCount(response.data.pagination.totalPages);
      } else {
        toast.error("Lấy danh sách chuyến đi thất bại", {
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

  // useEffect để theo dõi và gọi lại API, có debounce cho ô tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      // Đặt lại trang về 0 khi filter thay đổi để tránh lỗi trang không tồn tại
      if (table.getState().pagination.pageIndex !== 0) {
        table.setPageIndex(0);
      } else {
        fetchTrips();
      }
    }, 500); // Chờ 500ms sau khi người dùng ngừng gõ
    return () => clearTimeout(handler);
  }, [filters]); // Chỉ trigger khi filter thay đổi

  // useEffect riêng cho pagination để phản hồi ngay lập tức
  useEffect(() => {
    fetchTrips();
  }, [pageIndex, pageSize]);

  // --- Handlers cho các hành động của người dùng ---
  const handleOpenCreateForm = () => {
    setEditingTrip(null);
    setIsFormOpen(true);
  };
  const handleOpenEditForm = (trip: Trip) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTrip(null);
  };
  const handleFormSuccess = () => {
    handleCloseForm();
    fetchTrips();
  };
  const handleDeleteRequest = (trip: Trip) => {
    setDeletingTrip(trip);
  };

  const handleViewDetails = async (trip: Trip) => {
    setIsDetailsSheetOpen(true);
    setIsDetailsLoading(true);
    setViewingTripDetails(null);
    try {
      const response = await tripAPI.getTripById(trip._id);
      setViewingTripDetails(response.data as TripDetailsType);
    } catch (error) {
      const err = error as Error;
      toast.error("Không thể kết nối đến máy chủ.", {
        description: err.message,
      });
      setIsDetailsSheetOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTrip) return;
    const promise = () => tripAPI.delete(deletingTrip._id);
    toast.promise(promise, {
      loading: "Đang xóa...",
      success: () => {
        setDeletingTrip(null);
        fetchTrips();
        return "Đã xóa chuyến đi thành công.";
      },
      error: "Xóa chuyến đi thất bại.",
    });
  };

  // --- Khởi tạo và cấu hình Tanstack Table ---
  const columns = useMemo(
    () =>
      getColumns(handleViewDetails, handleOpenEditForm, handleDeleteRequest),
    []
  );

  const table = useReactTable({
    data: trips,
    columns,
    pageCount: pageCount,
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
            placeholder="Tìm theo điểm đi/đến..."
            value={filters.query}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            className="h-10 w-[250px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Trạng thái ({filters.status.length || "Tất cả"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["Not Started", "Completed", "Delayed"] as TripStatus[]).map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: checked
                          ? [...prev.status, status]
                          : prev.status.filter((s) => s !== status),
                      }))
                    }
                  >
                    {status === "Not Started"
                      ? "Chưa bắt đầu"
                      : status === "Completed"
                      ? "Đã hoàn thành"
                      : "Bị hoãn"}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Nút thêm mới có thể đặt ở đây nếu muốn */}
          <Button onClick={handleOpenCreateForm}>Tạo Chuyến đi</Button>
        </DataTableToolbar>

        <DataTable table={table} columns={columns} isLoading={isLoading} />

        <DataTablePagination table={table} />
      </div>

      {/* --- Các Sheet và Dialog --- */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTrip ? "Chỉnh sửa chuyến đi" : "Tạo chuyến đi mới"}
            </SheetTitle>
            <SheetDescription>
              {editingTrip
                ? "Cập nhật thông tin cho chuyến đi."
                : "Điền thông tin để tạo một chuyến đi mới."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TripForm
              initialData={editingTrip}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết chuyến đi</SheetTitle>
            <SheetDescription>
              Thông tin chi tiết và sơ đồ ghế của chuyến đi.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {isDetailsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TripDetails trip={viewingTripDetails} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deletingTrip}
        onOpenChange={() => setDeletingTrip(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chuyến đi{" "}
              <strong>
                {deletingTrip?.startLocation} → {deletingTrip?.endLocation}
              </strong>{" "}
              sẽ bị xóa vĩnh viễn.
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
