"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import các types cần thiết
import type { Trip, Seat, TripDetails as TripDetailsType } from "@/types/trip";
import type { User } from "@/types/user"; 
import { userAPI } from "@/services/api/user-api"; 
import tripAPI from "@/services/api/trip-api";
import requestAPI from "@/services/api/request-api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Phone, Mail } from "lucide-react";
import { InteractiveSeatMap } from "./InteractiveSeatMap";

interface CreateTicketSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
  userId: string | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  passengerName: z.string().min(2, { message: "Tên hành khách là bắt buộc." }),
  passengerPhone: z.string().regex(/^[0-9]{10}$/, { message: "SĐT không hợp lệ." }),
  seats: z.array(z.object({ code: z.string(), floor: z.number() }))
    .min(1, { message: "Vui lòng chọn ít nhất một ghế." }),
  price: z.number(),
});

export function CreateTicketSheet({
  isOpen,
  onOpenChange,
  trip: initialTrip,
  userId,
  onSuccess,
}: CreateTicketSheetProps) {
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerName: "",
      passengerPhone: "",
      seats: [],
      price: 0,
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (isOpen && userId && initialTrip) {
        setIsLoading(true);
        form.reset();
        try {
          const [userResponse, tripDetailsResponse] = await Promise.all([
            userAPI.getUserById(userId),
            tripAPI.getTripById(initialTrip._id),
          ]);
          if (userResponse.success) setTargetUser(userResponse.data);
          else throw new Error("Không tìm thấy người dùng.");
          if (tripDetailsResponse) setTripDetails(tripDetailsResponse.data);
          else throw new Error("Không thể lấy chi tiết chuyến đi.");
        } catch (error) {
          toast.error("Lỗi tải dữ liệu", { description: (error as Error).message });
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [isOpen, userId, initialTrip, form, onOpenChange]);
  
  const handleSeatToggle = (seat: Seat) => {
    if (!initialTrip) return;
    const currentSeats = form.getValues('seats');
    const isSelected = currentSeats.some(s => s.code === seat.code);
    const newSeats = isSelected
      ? currentSeats.filter(s => s.code !== seat.code)
      : [...currentSeats, seat];
    const newPrice = newSeats.length * initialTrip.price;
    form.setValue('seats', newSeats, { shouldValidate: true });
    form.setValue('price', newPrice);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!tripDetails || !targetUser) return;
    const promise = requestAPI.createNewRequest(
      targetUser._id, tripDetails._id, "Pending", "Book Ticket",
      values.seats, values.passengerName, values.passengerPhone, tripDetails.type, values.price.toString()
    );
    toast.promise(promise, {
      loading: "Đang gửi yêu cầu...",
      success: (res) => {
        if (res.success) { onSuccess(); return "Yêu cầu đã được gửi thành công."; }
        throw new Error(res.message);
      },
      error: (err) => `Gửi yêu cầu thất bại: ${(err as Error).message}`,
    });
  }

  const priceValue = form.watch('price');
  const selectedSeats = form.watch('seats');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-4xl w-full flex flex-col p-4">
        <SheetHeader>
          <SheetTitle>Tạo vé nhanh</SheetTitle>
          <SheetDescription>
            Tạo vé cho chuyến <strong>{initialTrip?.startLocation} → {initialTrip?.endLocation}</strong>.
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Tài khoản đặt vé</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center"><UserIcon className="mr-3 h-4 w-4 text-muted-foreground" /> <strong>{targetUser?.fullName}</strong></div>
                      <div className="flex items-center"><Mail className="mr-3 h-4 w-4 text-muted-foreground" /> {targetUser?.email}</div>
                      <div className="flex items-center"><Phone className="mr-3 h-4 w-4 text-muted-foreground" /> {targetUser?.phone}</div>
                      <div className="flex items-center"><Badge variant="outline">{targetUser?.roleName}</Badge></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Thông tin hành khách</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <FormField name="passengerName" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên hành khách</FormLabel>
                          <FormControl><Input placeholder="Nhập tên người đi" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="passengerPhone" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>SĐT liên hệ</FormLabel>
                          <FormControl><Input placeholder="Nhập SĐT người đi" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </div>
                {/* Cột sơ đồ ghế (3/5) */}
                <div className="md:col-span-3">
                  <Card>
                      <CardHeader><CardTitle className="text-base">Chọn ghế trên xe</CardTitle></CardHeader>
                      <CardContent>
                        {tripDetails && <InteractiveSeatMap allSeats={tripDetails.carCompanyInfo.seatMap} bookedSeats={tripDetails.bookedSeats.seats} selectedSeats={selectedSeats} onSeatToggle={handleSeatToggle} />}
                        <FormField name="seats" control={form.control} render={() => <FormItem><FormMessage className="pt-2"/></FormItem>} />
                      </CardContent>
                  </Card>
                </div>
              </div>

              {/* Footer được tách ra khỏi grid */}
              <SheetFooter className="py-4 border-t bg-background sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="text-lg font-bold text-center sm:text-left w-full sm:w-auto">
                    Tổng tiền: <span className="text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceValue)}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 sm:flex-auto">Hủy</Button>
                    </SheetClose>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1 sm:flex-auto">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo yêu cầu vé
                    </Button>
                </div>
              </SheetFooter>
               {/* --- THAY ĐỔI QUAN TRỌNG KẾT THÚC Ở ĐÂY --- */}
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}