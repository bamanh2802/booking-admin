import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/stores";
import { useErrorHandler, useSuccessHandler } from "@/hooks/useErrorHandler";
import { getRoleDisplayName } from "@/constants/roles";
import type { User } from "@/types/user";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Vui lòng nhập tên đầy đủ." }),
});

type FormData = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const { updateUser, isUpdating, error, clearError } = useUserStore();
  const { showSuccess } = useSuccessHandler();

  // Error handling
  useErrorHandler({
    error,
    clearError,
    title: "Lỗi cập nhật người dùng",
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
      });
    }
  }, [user, form]);

  const onSubmit = async (values: FormData) => {
    if (!user) return;

    try {
      await updateUser(user._id, values);

      showSuccess("Thành công", "Đã cập nhật thông tin người dùng");

      onOpenChange(false);
    } catch (error) {
      // Error will be handled by useErrorHandler
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isUpdating) {
      clearError();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin của người dùng {user?.fullName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đầy đủ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên đầy đủ"
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <div className="text-sm bg-muted p-2 rounded-md">
                {user?.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Số điện thoại
              </label>
              <div className="text-sm bg-muted p-2 rounded-md">
                {user?.phone}
              </div>
              <p className="text-xs text-muted-foreground">
                Số điện thoại không thể thay đổi
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Vai trò
              </label>
              <div className="text-sm bg-muted p-2 rounded-md">
                {getRoleDisplayName(user?.roleName)}
              </div>
              <p className="text-xs text-muted-foreground">
                Vai trò không thể thay đổi
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
