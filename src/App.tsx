import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import LoginPage from "./components/login/LoginForm";
import AdminLayout from "./Layout";
import DashboardPage from "./pages/dashboard/page";
import UserManagement from "./pages/users/UserManagement";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-muted-foreground">Đang tải...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Route cho trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* Nhóm các route của trang quản trị */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* 
              Route 'index' sẽ được render khi người dùng truy cập vào path cha ("/admin").
              Đây chính là trang dashboard của chúng ta.
            */}
            <Route index element={<DashboardPage />} />

            {/* Route cho quản lý người dùng */}
            <Route path="users" element={<UserManagement />} />

            {/* 
              TODO: Thêm các route con khác ở đây sau này. Ví dụ:
              <Route path="routes" element={<ManageRoutesPage />} />
              <Route path="tickets" element={<ManageTicketsPage />} /> 
            */}
          </Route>

          {/* Có thể thêm một route mặc định để redirect về login */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
