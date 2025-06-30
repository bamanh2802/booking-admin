"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Medal } from "lucide-react"; // Sử dụng icon Medal cho rõ ràng
import dashboardAPI from "@/services/api/dashboard-api";
import type { TopAgentStat } from "@/types/dashboard";
import { cn } from "@/lib/utils";

// Component con để hiển thị huy hiệu xếp hạng
const RankBadge = ({ rank }: { rank: number }) => {
  const styles = {
    1: "text-yellow-500", // Vàng
    2: "text-slate-400", // Bạc
    3: "text-orange-600", // Đồng
  };

  if (rank > 3) return null;

  return (
    <Medal className={cn("h-5 w-5", styles[rank as keyof typeof styles])} />
  );
};

// Component con để hiển thị một agent
const AgentRow = ({ agent, rank }: { agent: TopAgentStat; rank: number }) => {
  const getFallback = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg text-muted-foreground w-4">
          {rank}
        </span>
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getFallback(agent.agentName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{agent.agentName}</p>
          <p className="text-xs text-muted-foreground">{agent.agentEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("vi-VN").format(agent.totalRevenue)}đ
          </p>
          <p className="text-xs text-muted-foreground">{agent.ticketSold} vé</p>
        </div>
        <RankBadge rank={rank} />
      </div>
    </div>
  );
};

export function TopAgentsReport() {
  const [agents, setAgents] = useState<TopAgentStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopAgents = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardAPI.getTopAgentRevenue();
        if (response.success) {
          setAgents(response.data);
        } else {
          toast.error("Lỗi tải Top Đại Lý", { description: response.message });
        }
      } catch (error) {
        toast.error("Không thể kết nối đến máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopAgents();
  }, []); // Chỉ gọi 1 lần khi component mount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đại lý xuất sắc nhất</CardTitle>
        <CardDescription>Top các đại lý có doanh thu cao nhất.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          // Skeleton loader
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))
        ) : agents.length > 0 ? (
          // Hiển thị danh sách
          agents.map((agent, index) => (
            <AgentRow key={agent.agentId} agent={agent} rank={index + 1} />
          ))
        ) : (
          // Trường hợp không có dữ liệu
          <p className="text-center text-sm text-muted-foreground py-8">
            Chưa có dữ liệu về đại lý.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
