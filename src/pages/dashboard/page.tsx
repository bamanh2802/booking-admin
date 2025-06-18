import { DollarSign, Ticket, Users, Wallet } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { BusCompanyRatings } from "@/components/dashboard/UserRatingChart";
import { RefundReport } from "@/components/dashboard/RefundReport";
import { TopAgentsReport } from "@/components/dashboard/TopAgentsReport";

const statsData = [
  {
    title: "Doanh thu tháng này",
    value: "125.000.000đ",
    description: "+20.1% so với tháng trước",
    icon: DollarSign,
  },
  {
    title: "Vé bán trong tháng",
    value: "+1,250",
    description: "+180 vé so với tháng trước",
    icon: Ticket,
  },
  {
    title: "Người dùng mới (Tháng)",
    value: "+573",
    description: "Tổng số người dùng hoạt động: 3,450",
    icon: Users,
  },
  {
    title: "Tổng tiền đã hoàn (Tháng)",
    value: "4.560.000đ",
    description: "Chiếm 3.6% tổng doanh thu",
    icon: Wallet,
  },
];
const refundReportData = {
  totalAmount: "4.560.000đ",
  comparisonText: "-15% so với tháng trước",
  regularTickets: { count: 320, amount: "2.560.000đ" },
  vipTickets: { count: 80, amount: "2.000.000đ" },
};
const topAgentsData = [
  { rank: 1, name: "Đại lý An Thịnh", revenue: "45.200.000đ", fallback: "AT" },
  {
    rank: 2,
    name: "Đại lý Vận Tải Sao Việt",
    revenue: "38.750.000đ",
    fallback: "SV",
  },
  {
    rank: 3,
    name: "Đại lý Toàn Thắng",
    revenue: "31.100.000đ",
    fallback: "TT",
  },
];

// DỮ LIỆU GIẢ LẬP MỚI CHO XẾP HẠNG NHÀ XE
const topRatedCompanies = [
  {
    name: "Nhà xe Phương Trang",
    avatarFallback: "PT",
    averageRating: 4.9,
    totalReviews: 1850,
  },
  {
    name: "Nhà xe Thành Bưởi",
    avatarFallback: "TB",
    averageRating: 4.8,
    totalReviews: 1230,
  },
  {
    name: "Nhà xe Kumho Samco",
    avatarFallback: "KS",
    averageRating: 4.7,
    totalReviews: 980,
  },
];

const bottomRatedCompanies = [
  {
    name: "Nhà xe Hoàng Long",
    avatarFallback: "HL",
    averageRating: 3.5,
    totalReviews: 450,
  },
  {
    name: "Nhà xe Mai Linh Express",
    avatarFallback: "ML",
    averageRating: 3.8,
    totalReviews: 670,
  },
  {
    name: "Nhà xe Thuận Thảo",
    avatarFallback: "TT",
    averageRating: 4.1,
    totalReviews: 320,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Báo cáo tháng này</h1>

      {/* Lưới các thẻ thống kê nhanh (không đổi) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Layout lưới 2x2 cân đối */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <BusCompanyRatings
          top={topRatedCompanies}
          bottom={bottomRatedCompanies}
        />
        <RefundReport data={refundReportData} />
        <TopAgentsReport agents={topAgentsData} />
      </div>
    </div>
  );
}
