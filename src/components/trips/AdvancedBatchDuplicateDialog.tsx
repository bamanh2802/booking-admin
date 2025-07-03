"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import type { CreateNewTripProps } from "@/types/trip";
import tripAPI from "@/services/api/trip-api";
import type { Trip } from "@/types/trip";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdvancedBatchDuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedTrips: Trip[];
}

export function AdvancedBatchDuplicateDialog({
  isOpen,
  onClose,
  onSuccess,
  selectedTrips,
}: AdvancedBatchDuplicateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [globalTargetDate, setGlobalTargetDate] = useState<Date | undefined>();
  const [individualTargetDates, setIndividualTargetDates] = useState<
    Record<string, Date | undefined>
  >({});

  // Khi chế độ "Áp dụng cho tất cả" thay đổi ngày, cập nhật cho tất cả các chuyến
  useEffect(() => {
    if (!isCustomizeMode && globalTargetDate) {
      const newDates: Record<string, Date> = {};
      selectedTrips.forEach((trip) => {
        newDates[trip._id] = globalTargetDate;
      });
      setIndividualTargetDates(newDates);
    }
  }, [globalTargetDate, isCustomizeMode, selectedTrips]);

  // Reset state khi mở/đóng dialog
  useEffect(() => {
    if (isOpen) {
      setIsCustomizeMode(false);
      setGlobalTargetDate(undefined);
      setIndividualTargetDates({});
    }
  }, [isOpen]);

  const handleDateChangeForTrip = (tripId: string, date?: Date) => {
    setIndividualTargetDates((prev) => ({ ...prev, [tripId]: date }));
  };

  const handleSubmit = async () => {
    // Kiểm tra xem tất cả các chuyến đã chọn ngày chưa
    const allDatesSet = selectedTrips.every(
      (trip) => !!individualTargetDates[trip._id]
    );
    if (!allDatesSet) {
      toast.error("Vui lòng chọn ngày đích cho tất cả các chuyến đi đã chọn.");
      return;
    }

    setIsLoading(true);

    const payloads: CreateNewTripProps[] = selectedTrips.map((trip) => {
      const targetDate = individualTargetDates[trip._id]!;
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

    const promise = Promise.all(payloads.map((p) => tripAPI.createTrip(p)));

    await toast.promise(promise, {
      loading: `Đang nhân bản ${payloads.length} chuyến...`,
      success: () => {
        onSuccess();
        onClose();
        return `Đã nhân bản thành công ${payloads.length} chuyến.`;
      },
      error: (err: any) => `Có lỗi xảy ra: ${err.message || "Thất bại"}`,
      finally: () => setIsLoading(false),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Nhân bản {selectedTrips.length} chuyến đi đã chọn
          </DialogTitle>
          <DialogDescription>
            Chọn ngày đích cho các chuyến đi. Bạn có thể áp dụng một ngày cho
            tất cả hoặc tùy chỉnh riêng lẻ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="customize-mode"
                checked={isCustomizeMode}
                onCheckedChange={setIsCustomizeMode}
              />
              <Label htmlFor="customize-mode">Tùy chỉnh từng chuyến</Label>
            </div>
            {!isCustomizeMode && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(!globalTargetDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {globalTargetDate ? (
                      format(globalTargetDate, "PPP", { locale: vi })
                    ) : (
                      <span>Áp dụng cho tất cả</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={globalTargetDate}
                    onSelect={setGlobalTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <ScrollArea className="h-72 border rounded-md p-2">
            <div className="space-y-4">
              {selectedTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div>
                    <p className="font-semibold">
                      {trip.startLocation} → {trip.endLocation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Gốc:{" "}
                      {format(new Date(trip.startTime), "HH:mm, dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !individualTargetDates[trip._id] &&
                            "text-muted-foreground"
                        )}
                        disabled={!isCustomizeMode}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {individualTargetDates[trip._id] ? (
                          format(individualTargetDates[trip._id]!, "PPP", {
                            locale: vi,
                          })
                        ) : (
                          <span>Chọn ngày đích</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={individualTargetDates[trip._id]}
                        onSelect={(date) =>
                          handleDateChangeForTrip(trip._id, date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận nhân bản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
