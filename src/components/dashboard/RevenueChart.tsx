import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// --- DỮ LIỆU GIẢ LẬP (Không đổi) ---
const randomRevenue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const monthlyData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date();
  month.setMonth(month.getMonth() - (11 - i));
  return {
    name: `T${month.getMonth() + 1}`,
    total: randomRevenue(50_000_000, 200_000_000),
  };
});
const weeklyData = [
  { name: "Tuần 1", total: randomRevenue(15_000_000, 40_000_000) },
  { name: "Tuần 2", total: randomRevenue(15_000_000, 40_000_000) },
  { name: "Tuần 3", total: randomRevenue(15_000_000, 40_000_000) },
  { name: "Tuần 4", total: randomRevenue(15_000_000, 40_000_000) },
];
const dailyData = Array.from({ length: 7 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (6 - i));
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return {
    name: weekdays[day.getDay()],
    total: randomRevenue(3_000_000, 10_000_000),
  };
});

// Tooltip tùy chỉnh (Không đổi)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-foreground">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [activeData, setActiveData] = useState(weeklyData);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setIsLoading(true);
    let newData;
    switch (value) {
      case "7d":
        newData = dailyData;
        break;
      case "12m":
        newData = monthlyData;
        break;
      default:
        newData = weeklyData;
        break;
    }
    setTimeout(() => {
      setActiveData(newData);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Xu hướng Doanh thu</CardTitle>
            <CardDescription>
              Hiển thị doanh thu theo khoảng thời gian đã chọn.
            </CardDescription>
          </div>
          <Tabs
            defaultValue="30d"
            className="w-full sm:w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="7d">7 ngày</TabsTrigger>
              <TabsTrigger value="30d">30 ngày</TabsTrigger>
              <TabsTrigger value="12m">12 tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-30" : "opacity-100"
          }`}
        >
          <ResponsiveContainer width="100%" height={300}>
            {/* THAY ĐỔI TỪ BAR CHART SANG AREA CHART */}
            <AreaChart data={activeData}>
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
                dataKey="name"
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
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
