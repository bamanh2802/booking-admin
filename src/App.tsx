import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "./components/login/LoginForm";
import AdminLayout from "./Layout";
import DashboardPage from "./pages/dashboard/page";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
