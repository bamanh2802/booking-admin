"use client";

import { useEffect, useState, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import type { PaginationState, RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { DuplicateDayDialog } from "@/components/trips/DuplicateDayDialog";

// API Services
import tripAPI from "@/services/api/trip-api";

// Types
import type {
  Trip,
  TripDetails as TripDetailsType,
  TripStatus,
} from "@/types/trip";

// Tanstack Table Utilities
import {
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

// Date & Locale
import { vi } from "date-fns/locale";
import { format } from "date-fns";

// Local Components
import { getColumns } from "@/components/trips/columns";
import { TripForm } from "@/components/trips/trip-form";
import { TripDetails } from "@/components/trips/trip-details";
import { DataTable } from "@/components/trips/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { AdvancedBatchDuplicateDialog } from "@/components/trips/AdvancedBatchDuplicateDialog";

// UI Components (shadcn/ui)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Icons (lucide-react)
import {
  Loader2,
  Copy,
  CalendarIcon,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";

// --- Dữ liệu tĩnh cho các địa điểm ---
interface Location {
  id: number;
  name: string;
  key: string;
}

const locations: Location[] = [
  { id: 1, name: "Hà Nội", key: "HN" },
  { id: 2, name: "Nghệ An", key: "NA" },
  { id: 3, name: "Đà Nẵng", key: "DN" },
  { id: 4, name: "Hà Tĩnh", key: "HT" },
  { id: 5, name: "Kỳ Anh", key: "KA" },
  { id: 6, name: "Quảng Bình", key: "QB" },
];

// --- Interface cho bộ lọc ---
interface TripFilters {
  startLocation: string | null;
  endLocation: string | null;
  status: TripStatus[];
}

export default function TripManagementPage() {
  // --- State chính cho dữ liệu và pagination ---
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- State cho các hành động và UI ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDuplicateDayOpen, setIsDuplicateDayOpen] = useState(false);
  const [isAdvancedDuplicateOpen, setIsAdvancedDuplicateOpen] = useState(false);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [viewingTripDetails, setViewingTripDetails] = useState<TripDetailsType | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // --- State cho Server-Side Filtering, Sorting và Pagination ---
  const [filters, setFilters] = useState<TripFilters>({
    startLocation: null,
    endLocation: null,
    status: [],
  });
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");

  // --- Hàm fetch dữ liệu chính ---
  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pageIndex + 1,
        limit: pageSize,
        roleName: "Admin",
        day: format(selectedDate, "yyyy-MM-dd"),
      };
      // Thêm các tham số lọc nếu chúng được chọn
      if (filters.startLocation) {
        params.startLocation = filters.startLocation;
      }
      if (filters.endLocation) {
        params.endLocation = filters.endLocation;
      }

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

  // --- useEffect để gọi lại API khi bộ lọc, sắp xếp, hoặc ngày thay đổi ---
  useEffect(() => {
    if (table.getState().pagination.pageIndex !== 0) {
      table.setPageIndex(0);
    } else {
      fetchTrips();
    }
  }, [filters, sortBy, selectedDate]);

  // --- useEffect riêng cho pagination ---
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
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTrip) return;
    const promise = tripAPI.delete(deletingTrip._id);
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
  
  const handleConfirmBatchDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const tripIdsToDelete = selectedRows.map((row) => row.original._id);
    const deletePromises = tripIdsToDelete.map(id => tripAPI.delete(id));
    
    toast.promise(Promise.all(deletePromises), {
      loading: `Đang xóa ${tripIdsToDelete.length} chuyến đi...`,
      success: () => {
        fetchTrips();
        setRowSelection({});
        setIsBatchDeleteConfirmOpen(false);
        return `Đã xóa thành công ${tripIdsToDelete.length} chuyến đi.`;
      },
      error: (err) => {
        setIsBatchDeleteConfirmOpen(false);
        const error = err as Error;
        return `Xóa hàng loạt thất bại: ${error.message}`;
      }
    });
  };

  // --- Khởi tạo Tanstack Table ---
  const columns = useMemo(
    () => getColumns(handleViewDetails, handleOpenEditForm, handleDeleteRequest),
    []
  );

  const table = useReactTable({
    data: trips,
    columns,
    pageCount: pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const numSelected = Object.keys(rowSelection).length;
  const selectedTripData = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="container mx-auto pb-6">
      <div className="space-y-4">
        <DataTableToolbar>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Bộ lọc ngày */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[240px] justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Bộ lọc Điểm đi */}
            <Select
              value={filters.startLocation || "all"}
              onValueChange={(value) => setFilters((prev) => ({...prev, startLocation: value === "all" ? null : value}))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn điểm đi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả điểm đi</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.key} value={loc.key}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bộ lọc Điểm đến */}
            <Select
              value={filters.endLocation || "all"}
              onValueChange={(value) => setFilters((prev) => ({...prev, endLocation: value === "all" ? null : value}))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn điểm đến" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả điểm đến</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.key} value={loc.key}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nút sắp xếp */}
            <Button
              variant="outline"
              onClick={() => setSortBy((prev) => (prev === "asc" ? "desc" : "asc"))}
              disabled={isLoading}
              className="w-[180px]"
            >
              Sắp xếp: Giờ đi
              {sortBy === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Nút xóa đã chọn */}
            {numSelected > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBatchDeleteConfirmOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ({numSelected})
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setIsDuplicateDayOpen(true)}
              disabled={isLoading || trips.length === 0}
            >
              <CopyPlus className="mr-2 h-4 w-4" />
              Nhân bản cả ngày
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAdvancedDuplicateOpen(true)}
              disabled={isLoading || numSelected === 0}
            >
              <Copy className="mr-2 h-4 w-4" />
              Nhân bản ({numSelected})
            </Button>
            <Button onClick={handleOpenCreateForm} disabled={isLoading}>
              Tạo Chuyến đi
            </Button>
          </div>
        </DataTableToolbar>
        
        <DataTable table={table} columns={columns} isLoading={isLoading} />
        <DataTablePagination table={table} />
      </div>

      {/* --- Các Sheet và Dialog --- */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTrip ? "Chỉnh sửa chuyến đi" : "Tạo chuyến đi mới"}</SheetTitle>
            <SheetDescription>{editingTrip ? "Cập nhật thông tin cho chuyến đi." : "Điền thông tin để tạo một chuyến đi mới."}</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TripForm
              initialData={editingTrip}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
              defaultDate={selectedDate}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết chuyến đi</SheetTitle>
            <SheetDescription>Thông tin chi tiết và sơ đồ ghế của chuyến đi.</SheetDescription>
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

      <AlertDialog open={!!deletingTrip} onOpenChange={() => setDeletingTrip(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chuyến đi <strong>{deletingTrip?.startLocation} → {deletingTrip?.endLocation}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBatchDeleteConfirmOpen} onOpenChange={setIsBatchDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. <strong>{numSelected}</strong> chuyến đi đã chọn sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBatchDelete} className="bg-red-600 hover:bg-red-700">Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isAdvancedDuplicateOpen && (
        <AdvancedBatchDuplicateDialog
          isOpen={isAdvancedDuplicateOpen}
          onClose={() => { setIsAdvancedDuplicateOpen(false); setRowSelection({}); }}
          onSuccess={() => { fetchTrips(); setRowSelection({}); }}
          selectedTrips={selectedTripData}
        />
      )}

      {isDuplicateDayOpen && (
        <DuplicateDayDialog
          isOpen={isDuplicateDayOpen}
          onClose={() => setIsDuplicateDayOpen(false)}
          onSuccess={fetchTrips}
          sourceDate={selectedDate}
        />
      )}
    </div>
  );
}