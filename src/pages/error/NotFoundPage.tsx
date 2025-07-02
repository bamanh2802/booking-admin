// src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4">
      <div className="max-w-md">
        <h1 className="text-9xl font-black text-primary/80">404</h1>
        <p className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">
          Oops! Trang không tồn tại.
        </p>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể
          nó đã bị xóa hoặc bạn đã gõ sai địa chỉ.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/" // Điều hướng về trang dashboard chính của admin
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="flex items-center gap-2">
              <Home size={16} />
              Về Bảng điều khiển
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
