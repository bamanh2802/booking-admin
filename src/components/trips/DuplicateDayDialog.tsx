"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { CreateNewTripProps } from "@/types/trip";
import tripAPI from "@/services/api/trip-api";

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
import { Loader2 } from "lucide-react";
import { Label } from "../ui/label";

interface DuplicateDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sourceDate: Date;
}

export function DuplicateDayDialog({
  isOpen,
  onClose,
  onSuccess,
  sourceDate,
}: DuplicateDayDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!targetDate) {
      toast.error("Vui lòng chọn ngày đích.");
      return;
    }
    if (format(targetDate, "yyyy-MM-dd") === format(sourceDate, "yyyy-MM-dd")) {
      toast.error("Ngày đích không được trùng với ngày nguồn.");
      return;
    }

    setIsLoading(true);

    try {
      const params = {
        page: 1,
        day: format(sourceDate, "yyyy-MM-dd"),
      };
      const response = await tripAPI.getAllTrip(params);
      const sourceTrips = response.data.results;
      console.log("Source Trips:", response);

      if (sourceTrips.length === 0) {
        toast.info(
          `Không có chuyến đi nào vào ngày ${format(sourceDate, "PPP", {
            locale: vi,
          })} để nhân bản.`
        );
        setIsLoading(false);
        return;
      }

      // 2. Tạo payloads cho ngày đích
      const payloads: CreateNewTripProps[] = sourceTrips.map((trip) => {
        const sTime = new Date(trip.startTime);
        const eTime = new Date(trip.endTime);
        const newStartTime = new Date(targetDate);
        newStartTime.setHours(
          sTime.getHours(),
          sTime.getMinutes(),
          sTime.getSeconds()
        );
        const duration = eTime.getTime() - sTime.getTime();
        const newEndTime = new Date(newStartTime.getTime() + duration);
        return {
          carCompanyId: trip.carCompanyId,
          startLocation: trip.startLocation,
          endLocation: trip.endLocation,
          startStation: trip.startStation,
          endStation: trip.endStation,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          price: trip.price.toString(),
          type: trip.type,
          status: "Not Started",
        };
      });

      // 3. Gửi yêu cầu API
      const promise = Promise.all(payloads.map((p) => tripAPI.createTrip(p)));
      await toast.promise(promise, {
        loading: `Đang nhân bản ${payloads.length} chuyến...`,
        success: () => {
          onSuccess();
          onClose();
          return `Đã nhân bản thành công ${
            payloads.length
          } chuyến từ ngày ${format(sourceDate, "dd/MM")} sang ngày ${format(
            targetDate,
            "dd/MM"
          )}.`;
        },
        error: (err: any) => `Có lỗi xảy ra: ${err.message || "Thất bại"}`,
      });
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu ngày nguồn.", {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhân bản toàn bộ ngày</DialogTitle>
          <DialogDescription>
            Sao chép tất cả chuyến đi từ ngày{" "}
            <b>{format(sourceDate, "PPP", { locale: vi })}</b> sang một ngày
            mới.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-2">
          <Label>Chọn ngày đích</Label>
          <Calendar
            mode="single"
            selected={targetDate}
            onSelect={setTargetDate}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !targetDate}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
