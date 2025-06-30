"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import dashboardAPI from "@/services/api/dashboard-api";
import type { ChartDataItem } from "@/types/dashboard";

type Period = "7days" | "1month" | "12months";

const formatLabel = (label: string, period: Period): string => {
  if (period === "12months") {
    const month = parseInt(label.split("-")[1], 10);
    return `T${month}`;
  }
  if (period === "1month") {
    const parts = label.split("-");
    return `${parts[2]}/${parts[1]}`;
  }
  const date = new Date(label);
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return weekdays[date.getDay()];
};

// Tooltip tùy chỉnh, hiển thị cả doanh thu và số vé
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Dữ liệu của điểm đó trên biểu đồ
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[180px]">
        <div className="flex flex-col gap-1">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <div className="flex justify-between items-center">
            <span className="text-sm">Doanh thu:</span>
            <span className="font-bold text-foreground">
              {new Intl.NumberFormat("vi-VN").format(data.totalRevenue)} ₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Số vé:</span>
            <span className="font-bold text-foreground">
              {data.totalTickets} vé
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("1month");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardAPI.getRevenue({ period });
        if (response.success) {
          const formattedData = response.data.chartData.map((item: any) => ({
            ...item,
            name: formatLabel(item.label, period),
          }));
          setChartData(formattedData);
          setTotalRevenue(response.data.totalRevenue);
        } else {
          toast.error("Không thể tải dữ liệu doanh thu", {
            description: response.message,
          });
        }
      } catch (error) {
        toast.error("Lỗi kết nối máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Xu hướng Doanh thu</CardTitle>
            <CardDescription>
              {isLoading
                ? "Đang tải dữ liệu..."
                : `Tổng doanh thu trong kỳ: ${new Intl.NumberFormat(
                    "vi-VN"
                  ).format(totalRevenue)} ₫`}
            </CardDescription>
          </div>
          <Tabs
            defaultValue={period}
            className="w-full sm:w-auto"
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="7days">7 ngày</TabsTrigger>
              <TabsTrigger value="1month">1 tháng</TabsTrigger>
              <TabsTrigger value="12months">12 tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name" // Sử dụng key 'name' đã được format
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000000}Tr`}
              />
              <Tooltip
                cursor={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
