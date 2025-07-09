// src/components/requests/request-details.tsx

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Ticket, MapPin, Bus, Banknote, Calendar, Info } from "lucide-react";

// Giả sử bạn có một API service để lấy user
import userAPI from "@/services/api/user-api"; 

// Import đúng các kiểu Discriminated Union
import type { 
  TicketRequest,
  BookTicketRequest,
  CancelTicketRequest,
  RefundTicketRequest,
} from "@/types/request";
import type { User as UserInfo} from "@/types/user"; 


// --- Component con cho từng loại yêu cầu ---

// Helper component
const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div className="flex flex-col w-full">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
};

// Component cho Yêu cầu Đặt vé
const BookTicketDetails = ({ request }: { request: BookTicketRequest }) => (
  <>
    <h3 className="font-semibold text-base mb-2">Chi tiết Đặt vé</h3>
    <div className="space-y-1">
      <DetailRow icon={User} label="Hành khách" value={`${request.passengerName} - ${request.passengerPhone}`} />
      <DetailRow icon={Ticket} label="Ghế" value={<Badge variant="secondary">{request.seats.map(s => s.code).join(', ')}</Badge>} />
      <DetailRow icon={MapPin} label="Hành trình" value={request.tripInfo?.location} />
      <DetailRow icon={Bus} label="Nhà xe" value={request.carCompanyInfo?.name} />
      <DetailRow icon={Calendar} label="Khởi hành" value={request.tripInfo?.startTime ? new Date(request.tripInfo.startTime).toLocaleString('vi-VN') : 'N/A'} />
      <DetailRow icon={Banknote} label="Giá vé" value={<span className="font-bold text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(request.price)}</span>} />
    </div>
  </>
);

// Component cho Yêu cầu Hủy vé
const CancelTicketDetails = ({ request }: { request: CancelTicketRequest }) => (
  <>
    <h3 className="font-semibold text-base mb-2">Chi tiết Hủy vé</h3>
    <div className="space-y-1">
      <DetailRow icon={Ticket} label="Mã vé cần hủy" value={<Badge variant="destructive">{request.ticketId}</Badge>} />
      <DetailRow icon={User} label="Hành khách" value={`${request.passengerName} - ${request.passengerPhone}`} />
      <DetailRow icon={Banknote} label="Giá vé gốc" value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(request.price)} />
    </div>
  </>
);

// Component cho Yêu cầu Hoàn tiền
const RefundTicketDetails = ({ request }: { request: RefundTicketRequest }) => (
  <>
    <h3 className="font-semibold text-base mb-2">Chi tiết Hoàn tiền</h3>
    <div className="space-y-1">
      <DetailRow 
        icon={Banknote} 
        label="Số tiền yêu cầu" 
        value={<span className="font-bold text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(request.amount)}</span>}
      />
      {request.ticketId && <DetailRow icon={Ticket} label="Mã vé liên quan" value={<Badge variant="outline">{request.ticketId}</Badge>} />}
      <DetailRow icon={Info} label="Lý do" value={<p className="text-sm italic bg-muted p-3 rounded-md">{request.reason}</p>} />
    </div>
  </>
);

// --- Component chính để điều phối ---
export function RequestDetails({ request }: { request: TicketRequest | null }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    // Tự động fetch thông tin người dùng khi có request mới
    if (request?.userId) {
      setIsUserLoading(true);
      userAPI.getUserById(request.userId)
        .then(response => {
          if (response.success) {
            setUserInfo(response.data);
          }
        })
        .catch(() => setUserInfo(null)) // Xử lý lỗi
        .finally(() => setIsUserLoading(false));
    } else {
        setUserInfo(null); // Reset user info nếu không có userId
    }
  }, [request]);

  if (!request) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Chọn một yêu cầu để xem chi tiết</p>
      </div>
    );
  }

  const renderRequestSpecificDetails = () => {
    switch (request.titleRequest) {
      case "Book Ticket":
        return <BookTicketDetails request={request as BookTicketRequest} />;
      case "Cancel Ticket":
        return <CancelTicketDetails request={request as CancelTicketRequest} />;
      case "Refund Ticket":
        return <RefundTicketDetails request={request as RefundTicketRequest} />;
      default:
        return <Alert variant="destructive"><AlertTitle>Lỗi</AlertTitle><AlertDescription>Loại yêu cầu không xác định.</AlertDescription></Alert>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Phần render chi tiết theo từng loại */}
      {renderRequestSpecificDetails()}

      <Separator />

      {/* Phần thông tin chung, bao gồm cả User Info được fetch */}
      <h3 className="font-semibold text-base">Thông tin Người dùng & Hệ thống</h3>
      <div className="space-y-1">
        {isUserLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ) : userInfo ? (
            <>
                <DetailRow icon={User} label="Tên người dùng" value={userInfo.fullName} />
                <DetailRow icon={User} label="Email" value={userInfo.email} />
            </>
        ) : (
            <DetailRow icon={User} label="Người dùng" value="Không có thông tin." />
        )}
         <DetailRow icon={Info} label="Người tạo yêu cầu" value={request.creatorInfo?.fullName || "Khách hàng"} />
      </div>
    </div>
  );
}