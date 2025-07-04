"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Trip, TripStatus } from "@/types/trip";
import companiesAPI from "@/services/api/car-company";
import tripAPI from "@/services/api/trip-api";
import type { CarCompany } from "@/types/car-company";
import { DateTimePicker } from "@/components/shared/DateTimePicker";
import { Separator } from "@/components/ui/separator";

// 1. Zod Schema (Không thay đổi)
const tripFormSchema = z
  .object({
    startLocation: z.string().min(1, "Điểm đi không được để trống."),
    endLocation: z.string().min(1, "Điểm đến không được để trống."),
    startStation: z.string().min(1, "Bến đi không được để trống."),
    endStation: z.string().min(1, "Bến đến không được để trống."),
    startTime: z.date({ required_error: "Thời gian đi là bắt buộc." }),
    endTime: z.date({ required_error: "Thời gian đến là bắt buộc." }),
    price: z.coerce.number().min(0, "Giá vé phải là số dương."),
    type: z.enum(["Regular", "VIP"]),
    carCompanyId: z.string({ required_error: "Vui lòng chọn nhà xe." }),
    status: z.enum(["Not Started", "Completed", "Delayed"]).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Thời gian đến phải sau thời gian đi.",
    path: ["endTime"],
  });

type TripFormValues = z.infer<typeof tripFormSchema>;

interface TripFormProps {
  initialData: Trip | null;
  onSuccess: () => void;
  onCancel: () => void;
  defaultDate?: Date;
}

// 3. Component chính (Đã được thiết kế lại)
export function TripForm({
  initialData,
  onSuccess,
  onCancel,
  defaultDate,
}: TripFormProps) {
  const [companies, setCompanies] = useState<CarCompany[]>([]);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);

  const isEditMode = !!initialData;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startTime: new Date(initialData.startTime),
          endTime: new Date(initialData.endTime),
          status: initialData.status as TripStatus,
        }
      : {
          startLocation: "",
          endLocation: "",
          startStation: "",
          endStation: "",
          price: 0,
          type: "Regular",
          status: "Not Started",
          startTime: defaultDate ? new Date(defaultDate) : undefined,
          endTime: defaultDate ? new Date(defaultDate) : undefined,
        },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    // ... (logic fetch companies không đổi)
    const fetchCompanies = async () => {
      setIsFetchingCompanies(true);
      try {
        const response = await companiesAPI.getAllCompanies();
        if (response.success) setCompanies(response.data.results);
        else toast.error("Không thể tải danh sách nhà xe.");
      } catch (error) {
        toast.error("Lỗi khi tải danh sách nhà xe.");
      } finally {
        setIsFetchingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (companyId: string) => {
    // ... (logic không đổi)
    const selectedCompany = companies.find((c) => c._id === companyId);
    if (selectedCompany) {
      form.setValue("carCompanyId", companyId, { shouldDirty: true });
      form.setValue("type", selectedCompany.type, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // =================================================================
  // === ✨ CÁC HÀM XỬ LÝ CHO THAO TÁC NHANH ✨ ===
  // =================================================================

  /**
   * Hoán đổi điểm đi/đến và bến đi/đến để tạo chuyến về
   */
  const handleCreateReturnTrip = () => {
    const { startLocation, endLocation, startStation, endStation } =
      form.getValues();
    form.setValue("startLocation", endLocation, { shouldDirty: true });
    form.setValue("endLocation", startLocation, { shouldDirty: true });
    form.setValue("startStation", endStation, { shouldDirty: true });
    form.setValue("endStation", startStation, { shouldDirty: true });
    toast.info("Đã hoán đổi điểm đi và điểm đến.");
  };

  /**
   * Thay đổi thời gian khởi hành và thời gian đến một khoảng nhất định
   * @param days - Số ngày để cộng/trừ
   * @param hours - Số giờ để cộng/trừ
   */
  const handleTimeShift = (days: number, hours: number) => {
    const currentStartTime = form.getValues("startTime");
    const currentEndTime = form.getValues("endTime");

    if (!currentStartTime || !currentEndTime) {
      toast.error("Vui lòng chọn thời gian đi và đến trước.");
      return;
    }

    const newStartTime = new Date(currentStartTime);
    newStartTime.setDate(newStartTime.getDate() + days);
    newStartTime.setHours(newStartTime.getHours() + hours);

    const newEndTime = new Date(currentEndTime);
    newEndTime.setDate(newEndTime.getDate() + days);
    newEndTime.setHours(newEndTime.getHours() + hours);

    form.setValue("startTime", newStartTime, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("endTime", newEndTime, {
      shouldDirty: true,
      shouldValidate: true,
    });

    toast.info(
      `Đã điều chỉnh thời gian: ${days > 0 ? `+${days}` : days} ngày, ${
        hours > 0 ? `+${hours}` : hours
      } giờ.`
    );
  };

  const onSubmit = async (data: TripFormValues) => {
    // ... (logic submit không đổi)
    if (isEditMode && !isDirty) {
      toast.info("Không có thay đổi để lưu.");
      return;
    }

    const payload: any = {
      ...data,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      price: data.price.toString(),
    };

    if (isEditMode) {
      payload.status = data.status;
    } else {
      payload.status = "Not Started";
    }

    const promise = isEditMode
      ? tripAPI.updateTrip(initialData._id, payload)
      : tripAPI.createTrip(payload);

    await toast.promise(promise, {
      loading: "Đang xử lý...",
      success: () => {
        onSuccess();
        return isEditMode
          ? "Đã cập nhật chuyến đi thành công."
          : "Đã tạo chuyến đi mới thành công.";
      },
      error: (err: any) =>
        `Có lỗi xảy ra: ${err.message || "Vui lòng thử lại."}`,
    });
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-4 md:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* === ✨ KHU VỰC THAO TÁC NHANH ✨ === */}
          <div className="md:col-span-2 space-y-3 p-4 bg-muted/50 rounded-lg border">
            <FormLabel className="text-base font-semibold">
              Thao tác nhanh
            </FormLabel>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateReturnTrip}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Tạo chuyến về
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTimeShift(1, 0)}
              >
                + 1 ngày
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTimeShift(-1, 0)}
              >
                - 1 ngày
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTimeShift(0, 1)}
              >
                + 1 giờ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTimeShift(0, -1)}
              >
                - 1 giờ
              </Button>
            </div>
          </div>

          {isEditMode && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái chuyến đi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Not Started">Chưa bắt đầu</SelectItem>
                      <SelectItem value="Completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="Delayed">Bị hoãn</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="startLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điểm đi</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Hà Nội" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điểm đến</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Sài Gòn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bến đi</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Bến xe Mỹ Đình" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bến đến</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Bến xe Miền Đông" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carCompanyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhà xe</FormLabel>
                <Select
                  onValueChange={handleCompanyChange}
                  defaultValue={field.value}
                  disabled={isFetchingCompanies}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isFetchingCompanies ? "Đang tải..." : "Chọn nhà xe"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name} ({c.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại xe</FormLabel>
                <Select value={field.value} disabled>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn từ nhà xe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Regular">Thường (Regular)</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Thời gian khởi hành</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Thời gian đến (dự kiến)</FormLabel>
                <DateTimePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá vé (VND)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="VD: 100000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading || isFetchingCompanies || (isEditMode && !isDirty)
            }
          >
            {(isLoading || isFetchingCompanies) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Tạo chuyến đi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
