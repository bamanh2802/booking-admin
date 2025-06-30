import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AtSign, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores";

// Schema validation cho email và password
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vui lòng nhập email." })
    .email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();

  // Xác định đường dẫn sẽ chuyển hướng đến sau khi đăng nhập thành công
  const from = location.state?.from?.pathname || "/";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Hiển thị toast lỗi
  useEffect(() => {
    if (error) {
      toast.error("Đăng nhập thất bại", {
        description: error,
      });
      clearError();
    }
  }, [error, clearError]);

  async function onSubmit(values: FormData) {
    try {
      await login(values);
      // Logic chuyển trang đã được xử lý bởi useEffect ở trên
      toast.success("Đăng nhập thành công!", {
        description: `Đang chuyển hướng đến trang ${
          from === "/" ? "chủ" : from
        }.`,
      });
    } catch (err) {
      // Lỗi đã được xử lý bởi useEffect, không cần làm gì thêm ở đây
      console.error("Login failed on submit:", err);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để vào hệ thống quản trị.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="admin@bookingcar.com"
                          className="pl-8"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Nhập mật khẩu"
                          className="pl-8"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </Form>

          {/* Thông tin demo cho việc test */}
          <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
            <p className="font-medium mb-1">Tài khoản demo:</p>
            <p>Email: admin@bookingcar.com</p>
            <p>Mật khẩu: Admin@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
