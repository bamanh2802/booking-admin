import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const { login, isLoading, error, isAuthenticated, user, clearError } =
    useAuthStore();
  const justLoggedIn = useRef(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated - chỉ redirect, không show toast
  useEffect(() => {
    if (isAuthenticated && user) {
      // Chỉ show toast nếu vừa mới login thành công
      if (justLoggedIn.current) {
        toast.success("Đăng nhập thành công!", {
          description: "Đang chuyển hướng đến trang quản trị.",
        });
        justLoggedIn.current = false;
      }
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show error toast when error occurs
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
      justLoggedIn.current = true; // Mark that we just attempted login
      await login(values);
      // Success toast will be shown by useEffect when isAuthenticated changes
    } catch (error) {
      justLoggedIn.current = false; // Reset flag on error
      // Error will be handled by useEffect
      console.error("Login failed:", error);
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
