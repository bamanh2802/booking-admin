"use client";

import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

// CẬP NHẬT: Bổ sung thêm các bản dịch mới
const pathTranslations: { [key: string]: string } = {
  admin: "Trang chủ",
  users: "Người dùng",
  trips: "Chuyến đi",
  companies: "Nhà xe",
  tickets: "Vé",
  requests: "Xử lý Yêu cầu", // <-- THÊM MỚI
  refunds: "Hoàn tiền", // <-- THÊM MỚI (từ sidebar)
  feedback: "Phản hồi", // <-- THÊM MỚI (từ sidebar)
  profile: "Hồ sơ",
  create: "Tạo mới",
  edit: "Chỉnh sửa",
};

// Hàm dịch một segment URL (không đổi)
const translatePath = (path: string) => {
  // Nếu là một ID có 24 ký tự hex (MongoDB ObjectId), trả về "Chi tiết"
  if (/^[a-f\d]{24}$/i.test(path)) {
    return "Chi tiết";
  }
  // Trả về bản dịch nếu có, hoặc chính nó nếu không có
  return pathTranslations[path] || path;
};

export function Breadcrumb() {
  const location = useLocation();
  // Lọc ra các segment rỗng, ví dụ từ URL bắt đầu bằng "/"
  const pathnames = location.pathname.split("/").filter((x) => x);

  // CẬP NHẬT: Nếu không có pathname nào (trang gốc "/"), không hiển thị gì cả.
  // Điều này chỉ xảy ra nếu người dùng vào thẳng trang gốc, trước khi được redirect.
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {/* Luôn hiển thị icon Home cho Trang chủ */}
        <li>
          <Link to="/admin" className="hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>

        {/* Lặp qua các pathnames để tạo breadcrumb */}
        {pathnames.map((value, index) => {
          // Bỏ qua segment "admin" vì đã có icon Home đại diện
          if (value === "admin") return null;

          const last = index === pathnames.length - 1;
          // Tạo URL đầy đủ cho mỗi mục, bắt đầu từ /admin
          const to = `/admin/${pathnames.slice(1, index + 1).join("/")}`;
          const translatedValue = translatePath(value);

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              {last ? (
                <span className="font-medium text-foreground">
                  {translatedValue}
                </span>
              ) : (
                <Link to={to} className="hover:text-foreground">
                  {translatedValue}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
