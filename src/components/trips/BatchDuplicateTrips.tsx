"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CreateNewTripProps } from "@/types/trip";
import tripAPI from "@/services/api/trip-api"; // Giả sử bạn export type này từ file api
import type { Trip } from "@/types/trip";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface BatchDuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sourceTrips: Trip[]; // Nhận trực tiếp các chuyến đi nguồn
}

export function BatchDuplicateDialog({
  isOpen,
  onClose,
  onSuccess,
  sourceTrips,
}: BatchDuplicateDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicate = async () => {
    if (!targetDate) {
      toast.error("Vui lòng chọn ngày đích để nhân bản.");
      return;
    }

    if (sourceTrips.length === 0) {
      toast.info("Không có chuyến đi nào được chọn để nhân bản.");
      onClose();
      return;
    }

    setIsLoading(true);

    // Tạo payload cho các chuyến đi mới dựa trên sourceTrips
    const newTripPayloads: CreateNewTripProps[] = sourceTrips.map((trip) => {
      const sTime = new Date(trip.startTime);
      const eTime = new Date(trip.endTime);

      // Tạo ngày giờ mới bằng cách kết hợp ngày người dùng chọn và giờ gốc
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(
        sTime.getHours(),
        sTime.getMinutes(),
        sTime.getSeconds()
      );

      // Giữ nguyên khoảng thời gian di chuyển
      const duration = eTime.getTime() - sTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      // Xây dựng payload một cách tường minh để khớp với API
      return {
        carCompanyId: trip.carCompanyId,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        startStation: trip.startStation,
        endStation: trip.endStation,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        price: trip.price.toString(), // Chuyển đổi sang string nếu API yêu cầu
        type: trip.type,
        status: "Not Started", // Chuyến đi mới luôn ở trạng thái này
      };
    });

    // Gọi API để tạo từng chuyến một cách đồng thời
    const createPromises = newTripPayloads.map((payload) =>
      tripAPI.createTrip(payload)
    );

    await toast.promise(Promise.all(createPromises), {
      loading: `Đang nhân bản ${sourceTrips.length} chuyến đi...`,
      success: () => {
        onSuccess(); // Gọi callback để làm mới dữ liệu
        onClose(); // Đóng dialog
        return `Đã nhân bản thành công ${sourceTrips.length} chuyến đi.`;
      },
      error: (err: any) =>
        `Có lỗi xảy ra: ${err.message || "Vui lòng thử lại."}`,
      finally: () => setIsLoading(false),
    });
  };

  // Reset state khi dialog đóng để lần mở sau không bị dính dữ liệu cũ
  const handleOnClose = () => {
    if (!isLoading) {
      setTargetDate(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhân bản {sourceTrips.length} chuyến đi</DialogTitle>
          <DialogDescription>
            Chọn ngày đích để tạo bản sao cho các chuyến đi đang hiển thị trên
            bảng.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="default" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Lưu ý quan trọng!</AlertTitle>
          <AlertDescription>
            Hành động này sẽ chỉ nhân bản các chuyến đi trên{" "}
            <b>trang hiện tại</b> của bảng. Nếu có nhiều trang, bạn cần thực
            hiện cho từng trang.
          </AlertDescription>
        </Alert>

        <div className="py-4 flex flex-col items-center gap-2">
          <span className="font-medium">Chọn ngày đích</span>
          <Calendar
            mode="single"
            selected={targetDate}
            onSelect={setTargetDate}
            disabled={(date) =>
              date < new Date(new Date().setDate(new Date().getDate() - 1))
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleOnClose}>
            Hủy
          </Button>
          <Button onClick={handleDuplicate} disabled={isLoading || !targetDate}>
            {isLoading ? "Đang xử lý..." : "Xác nhận nhân bản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
