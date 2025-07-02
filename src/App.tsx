// src/App.tsx

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
import { WebSocketNotifier } from "./hooks/WebSocketNotifier";
import QuickActionsPage from "./pages/quickaction/page";

// --- BƯỚC 1: IMPORT COMPONENT NOT FOUND ---
import NotFoundPage from "./pages/error/NotFoundPage";

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

          {/* Các route được bảo vệ bên trong AdminLayout */}
          <Route path="" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="trips" element={<TripsManagement />} />
            <Route path="companies" element={<CompanyManagementPage />} />
            <Route path="tickets" element={<TicketManagementPage />} />
            <Route path="requests" element={<RequestManagementPage />} />
            <Route path="commission" element={<CommissionManagementPage />} />
            <Route path="quick-actions" element={<QuickActionsPage />} />
          </Route>

          {/* --- BƯỚC 2: SỬA LẠI ROUTE WILDCARD --- */}
          {/* Route này sẽ khớp với bất kỳ đường dẫn nào không khớp ở trên */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <WebSocketNotifier />
        <Toaster richColors position="top-right" />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
