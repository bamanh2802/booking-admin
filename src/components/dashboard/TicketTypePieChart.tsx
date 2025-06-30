"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Ticket, DollarSign } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export interface TicketTypeStat {
  totalRevenue: number;
  ticketSold: number;
  ticketType: "Regular" | "VIP" | string;
}
interface TicketTypePieChartProps {
  data: TicketTypeStat[] | null;
  isLoading?: boolean;
}

const COLORS: { [key: string]: string } = {
  Regular: "#0ea5e9", // sky-500
  VIP: "#f97316", // orange-500
  Default: "#64748b", // slate-500
};

const getTicketTypeName = (type: string) => {
  if (type === "Regular") return "Vé thường";
  if (type === "VIP") return "Vé VIP";
  return type;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const unit = data.payload.unit; // Lấy đơn vị từ payload
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-lg">
        <p className="font-semibold">
          {`${data.name}: ${data.value.toLocaleString()} ${unit}`}
        </p>
      </div>
    );
  }
  return null;
};

export function TicketTypePieChart({
  data,
  isLoading = false,
}: TicketTypePieChartProps) {
  const [viewBy, setViewBy] = useState<"count" | "revenue">("count");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ các loại vé</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  // Xử lý trường hợp không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ các loại vé</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  // Xử lý và chuyển đổi dữ liệu để recharts có thể sử dụng
  const chartData = data.map((item) => {
    if (viewBy === "count") {
      return {
        name: getTicketTypeName(item.ticketType),
        value: item.ticketSold,
        unit: "vé", // Thêm đơn vị để tooltip hiển thị
        fill: COLORS[item.ticketType] || COLORS.Default,
      };
    }
    // else, view by revenue
    return {
      name: getTicketTypeName(item.ticketType),
      value: item.totalRevenue,
      unit: "₫", // Thêm đơn vị để tooltip hiển thị
      fill: COLORS[item.ticketType] || COLORS.Default,
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Tỷ lệ các loại vé
        </CardTitle>
        <div className="flex items-center gap-1 border p-1 rounded-md bg-muted">
          <Button
            size="sm"
            variant={viewBy === "count" ? "secondary" : "ghost"}
            onClick={() => setViewBy("count")}
            className="h-7"
          >
            <Ticket className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Số lượng</span>
          </Button>
          <Button
            size="sm"
            variant={viewBy === "revenue" ? "secondary" : "ghost"}
            onClick={() => setViewBy("revenue")}
            className="h-7"
          >
            <DollarSign className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Doanh thu</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: "14px", paddingBottom: "10px" }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={50}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
