import { Outlet, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // --- Logic xác thực không thay đổi ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Đang xác thực...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Cấu trúc layout mới, chuyên nghiệp hơn ---
  return (
    // 1. Container chính: Chiếm toàn bộ màn hình và không cho phép tự cuộn.
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[256px_1fr]">
      {/* 2. Sidebar: Sẽ cố định ở cột đầu tiên. Việc cuộn sẽ được xử lý bên trong component này. */}
      <Sidebar />

      {/* 3. Vùng bên phải (Header + Main Content) */}
      <div className="flex flex-col overflow-hidden">
        {" "}
        {/* Ngăn vùng này tự cuộn */}
        {/* 4. Header cố định */}
        <header className="flex-shrink-0">
          {" "}
          {/* Ngăn Header bị co lại */}
          <Header />
        </header>
        {/* 5. Vùng nội dung chính có thể cuộn độc lập */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {" "}
            {/* Thêm container để giới hạn chiều rộng nội dung nếu cần */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
