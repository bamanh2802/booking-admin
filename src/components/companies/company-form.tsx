"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Armchair, Loader2, Trash2, Wand2, X } from "lucide-react";

import companiesAPI from "@/services/api/car-company";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CarCompany, CarCompanyProps } from "@/types/car-company";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const companyFormSchema = z.object({
  name: z.string().min(1, "Tên không được trống"),
  description: z.string().min(1, "Mô tả không được trống"),
  hotline: z.string().min(1, "Hotline không được trống"),
  type: z.enum(["Regular", "VIP"]),
  seatMap: z
    .array(
      z.object({
        code: z.string().min(1, "Mã ghế không trống"),
        floor: z.coerce.number().min(1).max(2),
      })
    )
    .min(1, "Phải có ít nhất một ghế"),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  initialData: CarCompany | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompanyForm({
  initialData,
  onSuccess,
  onCancel,
}: CompanyFormProps) {
  const [numFloors, setNumFloors] = useState(
    initialData?.seatMap.some((s) => s.floor === 2) ? 2 : 1
  );
  const [rowsF1, setRowsF1] = useState("10");
  const [colsF1, setColsF1] = useState("A,B,C,D");
  const [rowsF2, setRowsF2] = useState("6");
  const [colsF2, setColsF2] = useState("A,B,C,D");

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      hotline: "",
      type: "Regular",
      seatMap: [],
    },
  });

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: "seatMap",
  });

  const handleGenerateSeats = () => {
    const newSeatMap: { code: string; floor: number }[] = [];
    const parsedColsF1 = colsF1
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    for (let row = 1; row <= parseInt(rowsF1); row++) {
      for (const col of parsedColsF1) {
        newSeatMap.push({ code: `${col}${row}`, floor: 1 });
      }
    }

    if (numFloors === 2) {
      const parsedColsF2 = colsF2
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      for (let row = 1; row <= parseInt(rowsF2); row++) {
        for (const col of parsedColsF2) {
          newSeatMap.push({ code: `${col}${row}`, floor: 2 });
        }
      }
    }

    replace(newSeatMap);
    toast.success(`Đã tạo thành công ${newSeatMap.length} ghế!`);
  };

  const onSubmit = async (data: CompanyFormValues) => {
    const payload = { ...data };

    const promise = async () => {
      if (!initialData) {
        await companiesAPI.createTrip(payload as CarCompanyProps);
      } else {
        await companiesAPI.updateTrip(
          initialData._id,
          payload as CarCompanyProps
        );
      }
    };

    toast.promise(promise(), {
      loading: "Đang lưu...",
      success: () => {
        onSuccess(); // đóng form, reload...
        return "Lưu thông tin nhà xe thành công!";
      },
      error: (err: any) => {
        // Lấy message chi tiết nếu có
        const msg =
          err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
        return msg;
      },
    });
  };

  const isEditMode = !!initialData;
  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pb-6 px-9"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhà xe</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hotline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotline</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại hình</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Regular">Thường</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* 1. Trình tạo sơ đồ ghế nhanh */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold text-lg flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-primary" />
            Trình tạo sơ đồ ghế nhanh
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <Label>Số tầng</Label>
              <Select
                value={String(numFloors)}
                onValueChange={(v) => setNumFloors(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Tầng</SelectItem>
                  <SelectItem value="2">2 Tầng</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          {/* Tầng 1 */}
          <div className="space-y-2">
            <h4 className="font-medium">Tầng 1</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <Label>Số hàng</Label>
                <Input
                  value={rowsF1}
                  onChange={(e) => setRowsF1(e.target.value)}
                  type="number"
                />
              </FormItem>
              <FormItem>
                <Label>Các cột (A,B,C...)</Label>
                <Input
                  value={colsF1}
                  onChange={(e) => setColsF1(e.target.value)}
                  placeholder="A,B,C,D"
                />
              </FormItem>
            </div>
          </div>

          {/* Tầng 2 */}
          {numFloors === 2 && (
            <div className="space-y-2">
              <h4 className="font-medium">Tầng 2</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <Label>Số hàng</Label>
                  <Input
                    value={rowsF2}
                    onChange={(e) => setRowsF2(e.target.value)}
                    type="number"
                  />
                </FormItem>
                <FormItem>
                  <Label>Các cột (A,B,C...)</Label>
                  <Input
                    value={colsF2}
                    onChange={(e) => setColsF2(e.target.value)}
                    placeholder="A,B,C,D"
                  />
                </FormItem>
              </div>
            </div>
          )}

          <Button type="button" onClick={handleGenerateSeats}>
            Tạo ghế hàng loạt
          </Button>
        </div>

        <Separator />

        {/* 2. Trình chỉnh sửa chi tiết */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center">
              <Armchair className="mr-2 h-5 w-5 text-primary" />
              Chi tiết sơ đồ ghế{" "}
              <span className="text-muted-foreground font-normal ml-2">
                ({fields.length} ghế)
              </span>
            </h3>
            {fields.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => replace([])}
              >
                <X className="mr-2 h-4 w-4" /> Xóa tất cả
              </Button>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Sơ đồ ghế trống. Hãy sử dụng trình tạo ở trên.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 rounded-md border p-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name={`seatMap.${index}.code`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Mã ghế" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`seatMap.${index}.floor`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Tầng 1</SelectItem>
                            <SelectItem value="2">Tầng 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {form.formState.errors.seatMap?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.seatMap.root.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Lưu thay đổi" : "Tạo nhà xe"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
