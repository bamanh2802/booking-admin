import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"; // Import toast từ sonner

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

// Schema validation không thay đổi
const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Vui lòng nhập email hoặc số điện thoại." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      console.log("Đang gửi thông tin:", values);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (
        values.identifier !== "admin@example.com" ||
        values.password !== "password"
      ) {
        throw new Error("Email hoặc mật khẩu không chính xác.");
      }

      localStorage.setItem("accessToken", "your_mock_jwt_token");

      // SỬ DỤNG SONNER
      toast.success("Đăng nhập thành công!", {
        description: "Đang chuyển hướng đến trang quản trị.",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error: any) {
      // SỬ DỤNG SONNER
      toast.error("Đăng nhập thất bại", {
        description: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để vào trang quản trị.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / Số điện thoại</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="admin@example.com"
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
                          placeholder="password"
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

              {/* Chúng ta không cần hiển thị lỗi API riêng biệt nữa vì toast đã làm rất tốt */}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
