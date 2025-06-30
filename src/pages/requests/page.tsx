"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import requestAPI from "@/services/api/request-api";
import type {
  TicketRequest,
  RequestTitle,
  RequestStatus,
} from "@/types/request";

import { getRequestColumns } from "@/components/requests/columns";
import { RequestDetails } from "@/components/requests/request-details";

import { DataTable } from "@/components/trips/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ActionType = "approve" | "reject";

interface RequestFilters {
  status: RequestStatus[];
  titleRequest: RequestTitle[];
}

const REQUEST_TITLE_OPTIONS: { value: RequestTitle; label: string }[] = [
  { value: "Book Ticket", label: "Yêu cầu Đặt vé" },
  { value: "Cancel Ticket", label: "Yêu cầu Hủy vé" },
  { value: "Refund Ticket", label: "Yêu cầu Hoàn tiền" },
];

const REQUEST_STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Approved", label: "Đã chấp thuận" },
  { value: "Rejected", label: "Đã từ chối" },
];

export default function RequestManagementPage() {
  const [requests, setRequests] = useState<TicketRequest[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [viewingRequest, setViewingRequest] = useState<TicketRequest | null>(
    null
  );
  const [processingRequest, setProcessingRequest] = useState<{
    req: TicketRequest;
    type: ActionType;
  } | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  const [filters, setFilters] = useState<RequestFilters>({
    status: ["Pending"],
    titleRequest: [],
  });
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [debouncedFilters] = useDebounce(filters, 500);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { [key: string]: any } = {
        page: pageIndex + 1,
        limit: 10,
      };
      if (debouncedFilters.status.length > 0)
        params.status = debouncedFilters.status.join(",");
      if (debouncedFilters.titleRequest.length > 0)
        params.titleRequest = debouncedFilters.titleRequest.join(",");

      const response = await requestAPI.getAllRequests(params);
      if (response.success) {
        setRequests(response.data.results);
        setPageCount(response.data.pagination.totalPages);
      } else {
        toast.error("Lấy danh sách yêu cầu thất bại", {
          description: response.message,
        });
      }
    } catch (error) {
      const err = error as Error;
      toast.error("Lỗi kết nối máy chủ.", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, debouncedFilters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (table.getState().pagination.pageIndex !== 0) {
      table.setPageIndex(0);
    }
  }, [debouncedFilters]);

  const columns = useMemo(
    () => getRequestColumns(handleViewDetails, handleApprove, handleReject),
    []
  );

  const table = useReactTable({
    data: requests,
    columns,
    pageCount: pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  function handleViewDetails(req: TicketRequest) {
    setViewingRequest(req);
    setIsDetailsSheetOpen(true);
  }
  function handleApprove(req: TicketRequest) {
    setProcessingRequest({ req, type: "approve" });
  }
  function handleReject(req: TicketRequest) {
    setProcessingRequest({ req, type: "reject" });
  }

  function confirmProcessing() {
    if (!processingRequest) return;
    const { req, type } = processingRequest;
    const promise = () =>
      type === "approve"
        ? requestAPI.approveRequest(req._id)
        : requestAPI.rejectRequest(req._id);
    toast.promise(promise, {
      loading: "Đang xử lý...",
      success: () => {
        setProcessingRequest(null);
        fetchRequests();
        return `Đã ${type === "approve" ? "chấp thuận" : "từ chối"} yêu cầu.`;
      },
      error: (err: any) => `Xử lý thất bại: ${err.message}`,
    });
  }

  return (
    <div className="container mx-auto pb-6">
      <div className="space-y-4">
        <DataTableToolbar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Trạng thái ({filters.status.length || "Tất cả"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {REQUEST_STATUS_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: checked
                        ? [...prev.status, option.value]
                        : prev.status.filter((s) => s !== option.value),
                    }))
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Loại yêu cầu ({filters.titleRequest.length || "Tất cả"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Lọc theo loại yêu cầu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {REQUEST_TITLE_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.titleRequest.includes(option.value)}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({
                      ...prev,
                      titleRequest: checked
                        ? [...prev.titleRequest, option.value]
                        : prev.titleRequest.filter((t) => t !== option.value),
                    }))
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </DataTableToolbar>

        <DataTable table={table} columns={columns} isLoading={isLoading} />
        <DataTablePagination table={table} />
      </div>

      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết Yêu cầu</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <RequestDetails request={viewingRequest} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!processingRequest}
        onOpenChange={() => setProcessingRequest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận{" "}
              {processingRequest?.type === "approve" ? "Chấp thuận" : "Từ chối"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn{" "}
              {processingRequest?.type === "approve" ? "chấp thuận" : "từ chối"}{" "}
              yêu cầu của{" "}
              <strong>{processingRequest?.req.passengerName}</strong>? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmProcessing}
              className={
                processingRequest?.type === "approve"
                  ? ""
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
