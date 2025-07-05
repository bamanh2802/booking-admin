"use client";

import { useEffect, useState, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";

// API & Types
import { ticketAPI } from "@/services/api/ticket-api";
import type { Ticket } from "@/types/ticket";

import { getTicketColumns } from "@/components/tickets/columns";
import { TicketDetails } from "@/components/tickets/ticket-details";
import { TicketUpdateForm } from "@/components/tickets/ticket-update-form";

import { DataTable } from "@/components/trips/data-table";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

// Components UI cơ bản
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

// Định nghĩa kiểu cho state lọc
interface TicketFilters {
  query: string; // Cho tìm kiếm chung
  status: string[];
}

export default function TicketManagementPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [cancellingTicket, setCancellingTicket] = useState<Ticket | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);

  const [filters, setFilters] = useState<TicketFilters>({
    query: "",
    status: [],
  });
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageIndex + 1,
        limit: 10,
      };
      const response = await ticketAPI.getAllTickets(params);
      if (response.success) {
        setTickets(response.data.results);
        setPageCount(response.data.pagination.totalPages);
      } else {
        toast.error("Lấy danh sách vé thất bại", {
          description: response.message,
        });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => clearTimeout(handler);
  }, [pageIndex, pageSize, filters]);

  const columns = useMemo(
    () =>
      getTicketColumns(
        handleViewDetails,
        handleUpdateRequest,
        handleCancelRequest
      ),
    []
  );

  const table = useReactTable({
    data: tickets,
    columns,
    pageCount: pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  function handleViewDetails(ticket: Ticket) {
    setViewingTicket(ticket);
    setIsDetailsSheetOpen(true);
  }
  function handleUpdateRequest(ticket: Ticket) {
    setEditingTicket(ticket);
    setIsUpdateSheetOpen(true);
  }
  function handleCancelRequest(ticket: Ticket) {
    setCancellingTicket(ticket);
  }
  function handleUpdateSuccess() {
    setIsUpdateSheetOpen(false);
    fetchTickets();
  }

  function confirmCancel() {
    if (!cancellingTicket) return;
    const promise = () =>
      ticketAPI.cancelTicket(cancellingTicket._id, cancellingTicket.seats);
    toast.promise(promise, {
      loading: "Đang hủy vé...",
      success: () => {
        setCancellingTicket(null);
        fetchTickets();
        return "Hủy vé thành công!";
      },
      error: "Hủy vé thất bại.",
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <DataTableToolbar>
          <Input
            placeholder="Tìm kiếm tên, SĐT, mã vé..."
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
              {["Confirmed", "Cancelled", "Refunded"].map((status) => (
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
                  {status === "Confirmed"
                    ? "Đã xác nhận"
                    : status === "Cancelled"
                    ? "Đã hủy"
                    : "Đã hoàn tiền"}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </DataTableToolbar>

        <DataTable table={table} columns={columns} isLoading={isLoading} />

        <DataTablePagination table={table} />
      </div>

      {/* Sheet xem chi tiết */}
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết vé</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <TicketDetails ticket={viewingTicket} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet cập nhật vé */}
      {editingTicket && (
        <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cập nhật thông tin vé</SheetTitle>
              <SheetDescription>
                Chỉnh sửa thông tin hành khách và chọn lại ghế.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <TicketUpdateForm
                ticket={editingTicket}
                onSuccess={handleUpdateSuccess}
                onCancel={() => setIsUpdateSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Dialog hủy vé */}
      <AlertDialog
        open={!!cancellingTicket}
        onOpenChange={() => setCancellingTicket(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy vé?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ hủy vé có mã{" "}
              <strong>
                {cancellingTicket?.requestId.slice(-8).toUpperCase()}
              </strong>{" "}
              của hành khách <strong>{cancellingTicket?.passengerName}</strong>.
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
