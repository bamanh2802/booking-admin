import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import LoginPage from "./components/login/LoginForm";
import AdminLayout from "./Layout";
import DashboardPage from "./pages/dashboard/page";
import UserManagement from "./pages/users/UserManagement";
import TripsManagement from "./pages/trips/page";
import CompanyManagementPage from "./pages/companies/page";
import TicketManagementPage from "./pages/tickets/page";
import RequestManagementPage from "./pages/requests/page";
import CommissionManagementPage from "./pages/commission/page";

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
            <Route path="trips" element={<TripsManagement />} />
            <Route path="companies" element={<CompanyManagementPage />} />
            <Route path="tickets" element={<TicketManagementPage />} />
            <Route path="requests" element={<RequestManagementPage />} />
            <Route path="commission" element={<CommissionManagementPage />} />
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
