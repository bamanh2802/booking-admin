"use client";

import { useEffect, useState } from "react";
import { DollarSign, Ticket, HandCoins, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopAgentsReport } from "@/components/dashboard/TopAgentsReport";
import { TicketTypePieChart } from "@/components/dashboard/TicketTypePieChart";
import type { TicketTypeStat } from "@/components/dashboard/TicketTypePieChart";
import dashboardAPI from "@/services/api/dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueData {
  totalRevenue: number;
  totalTickets: number;
  chartData?: any[];
}

export default function DashboardPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [ticketTypeData, setTicketTypeData] = useState<TicketTypeStat[] | null>(
    null
  );
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [revenuePeriod, _] = useState<"7days" | "1month" | "12months">(
    "1month"
  );

  // --- Logic gọi API ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [revenueRes, commissionsRes, ticketTypeRes] = await Promise.all([
          dashboardAPI.getRevenue({ period: revenuePeriod }),
          dashboardAPI.getCommissions(),
          dashboardAPI.getRevenueTicketType(),
        ]);

        if (revenueRes?.success) setRevenueData(revenueRes.data);
        if (commissionsRes?.success)
          setTotalCommissions(commissionsRes.data.totalCalculated);
        if (ticketTypeRes?.success) setTicketTypeData(ticketTypeRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Lỗi: Không thể tải dữ liệu cho dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [revenuePeriod]); // Chỉ gọi lại khi period của biểu đồ doanh thu thay đổi

  // Xây dựng mảng `stats` sau khi có dữ liệu
  const stats = [
    {
      title: "Tổng Doanh thu",
      value: `${revenueData?.totalRevenue.toLocaleString() || 0}đ`,
      description: "+20.1% so với tháng trước",
      icon: DollarSign,
    },
    {
      title: "Vé đã bán",
      value: `+${revenueData?.totalTickets.toLocaleString() || 0}`,
      description: "+180 vé so với tháng trước",
      icon: Ticket,
    },
    {
      title: "Tổng Hoa hồng",
      value: `${totalCommissions.toLocaleString()}đ`,
      description: "Hoa hồng đã tính cho các đại lý",
      icon: HandCoins,
    },
    {
      title: "Tổng tiền đã hoàn",
      value: "4.560.000đ",
      description: "Chiếm 3.6% tổng doanh thu",
      icon: Wallet,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Skeleton className="h-96 rounded-lg lg:col-span-4" />
          <Skeleton className="h-96 rounded-lg lg:col-span-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TicketTypePieChart data={ticketTypeData} isLoading={isLoading} />
        <TopAgentsReport />
      </div>
    </div>
  );
}
