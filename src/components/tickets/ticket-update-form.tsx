"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Armchair, Loader2 } from "lucide-react";

import type { Seat } from "@/types/trip";

import type { Ticket, TicketUpdatePayload } from "@/types/ticket";
import type { TripDetails } from "@/types/trip";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ticketAPI } from "@/services/api/ticket-api";
import tripAPI from "@/services/api/trip-api";
import { Badge } from "../ui/badge";

// --- Component con: SeatSelector ---
interface SeatSelectorProps {
  tripDetails: TripDetails;
  currentSeat: Seat | undefined; // Nhận vào ghế hiện tại (1 ghế)
  originalSeatCode: string; // Ghế ban đầu của vé này
  onSeatSelect: (seat: Seat) => void;
}

function SeatSelector({
  tripDetails,
  currentSeat,
  originalSeatCode,
  onSeatSelect,
}: SeatSelectorProps) {
  // Tạo một Set để kiểm tra nhanh TẤT CẢ các ghế đã được đặt trong chuyến đi này
  const allBookedSeatCodes = new Set(
    tripDetails.bookedSeats.seats.map((s) => s.code)
  );

  const renderFloor = (floorNumber: number) => {
    const floorSeats = tripDetails.carCompanyInfo.seatMap
      .filter((s) => s.floor === floorNumber)
      .sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true })
      );

    if (floorSeats.length === 0) return null;

    return (
      <div key={floorNumber} className="space-y-3">
        <h4 className="font-semibold text-center text-muted-foreground">
          Tầng {floorNumber}
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {floorSeats.map((seat) => {
            const isCurrentlySelected = currentSeat?.code === seat.code;
            const isOriginalSeat = seat.code === originalSeatCode;
            // Một ghế bị khóa nếu nó đã được người khác đặt VÀ nó không phải là ghế gốc của vé này
            const isBookedByOthers =
              allBookedSeatCodes.has(seat.code) && !isOriginalSeat;

            return (
              <Button
                key={seat.code}
                type="button"
                variant={isCurrentlySelected ? "default" : "outline"}
                disabled={isBookedByOthers}
                onClick={() => onSeatSelect(seat)}
                className={cn(
                  "h-auto flex-col p-2 relative",
                  isBookedByOthers &&
                    "bg-destructive/20 text-destructive line-through",
                  isOriginalSeat &&
                    !isCurrentlySelected &&
                    "border-blue-500 border-2" // Đánh dấu ghế gốc
                )}
                title={
                  isBookedByOthers
                    ? "Đã có người đặt"
                    : isOriginalSeat
                    ? `Ghế gốc: ${seat.code}`
                    : `Ghế trống: ${seat.code}`
                }
              >
                {isOriginalSeat && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                )}
                <Armchair className="h-4 w-4 mb-1" />
                <span className="text-xs">{seat.code}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-lg border p-4">
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary"></div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border-2 border-blue-500"></div>
          <span>Ghế gốc</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-destructive/20 line-through"></div>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border"></div>
          <span>Còn trống</span>
        </div>
      </div>
      <Separator />
      {renderFloor(1)}
      {tripDetails.carCompanyInfo.seatMap.some((s) => s.floor === 2) && (
        <Separator />
      )}
      {renderFloor(2)}
    </div>
  );
}

// --- Form chính ---
// SỬA: Schema giờ yêu cầu seats là một mảng có đúng 1 phần tử
const updateFormSchema = z.object({
  passengerName: z.string().min(1, "Tên hành khách không được trống."),
  passengerPhone: z.string().min(1, "SĐT không được trống."),
  seats: z
    .array(
      z.object({
        code: z.string(),
        floor: z.number(),
      })
    )
    .length(1, "Phải chọn đúng một ghế."),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

interface TicketUpdateFormProps {
  ticket: Ticket;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TicketUpdateForm({
  ticket,
  onSuccess,
  onCancel,
}: TicketUpdateFormProps) {
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [isTripLoading, setIsTripLoading] = useState(true);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      passengerName: ticket.passengerName,
      passengerPhone: ticket.passengerPhone,
      seats: ticket.seats, // Nạp danh sách ghế ban đầu (chỉ có 1 ghế)
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    const fetchTripDetails = async () => {
      setIsTripLoading(true);
      try {
        const response = await tripAPI.getTripById(ticket.tripId);
        setTripDetails(response.data);
      } catch (error) {
        toast.error("Không thể tải thông tin chuyến đi.");
      } finally {
        setIsTripLoading(false);
      }
    };
    fetchTripDetails();
  }, [ticket.tripId]);

  const onSubmit = async (data: UpdateFormValues) => {
    if (!isDirty) {
      toast.info("Không có thay đổi để lưu.");
      return;
    }

    const payload: TicketUpdatePayload = {
      passengerName: data.passengerName,
      passengerPhone: data.passengerPhone,
      seats: data.seats,
    };

    const promise = () => ticketAPI.updateTicket(ticket._id, payload);

    await toast.promise(promise, {
      loading: "Đang cập nhật...",
      success: () => {
        onSuccess();
        return "Cập nhật vé thành công!";
      },
      error: (err: any) => `Cập nhật thất bại: ${err.message}`,
    });
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="passengerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hành khách</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Sơ đồ ghế */}
        <Controller
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Chọn lại ghế</FormLabel>
                {field.value[0] && (
                  <Badge>Đã chọn: {field.value[0].code}</Badge>
                )}
              </div>
              {isTripLoading ? (
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : tripDetails ? (
                <SeatSelector
                  tripDetails={tripDetails}
                  currentSeat={field.value[0]} // Truyền vào ghế đang được chọn
                  originalSeatCode={ticket.seats[0].code} // Truyền vào ghế gốc
                  onSeatSelect={(seat) => {
                    // SỬA: Luôn thay thế mảng bằng một mảng mới chỉ có 1 ghế
                    field.onChange([seat]);
                  }}
                />
              ) : (
                <p className="text-sm text-destructive">
                  Không thể tải sơ đồ ghế.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isTripLoading || !isDirty}
          >
            {(isLoading || isTripLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  );
}
