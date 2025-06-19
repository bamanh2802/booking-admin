import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react"; // Icon vương miện cho top 1

type AgentPerformance = {
  name: string;
  revenue: string;
  fallback: string;
  rank: number;
};

type TopAgentsReportProps = {
  agents: AgentPerformance[];
};

export function TopAgentsReport({ agents }: TopAgentsReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đại lý xuất sắc nhất tháng</CardTitle>
        <CardDescription>Top 3 đại lý có doanh thu cao nhất.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between">
            {/* Phần thông tin đại lý */}
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{agent.fallback}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground">Đại lý cấp 1</p>
              </div>
            </div>

            {/* Phần doanh thu và huy hiệu */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{agent.revenue}</p>
              {agent.rank === 1 && (
                <Crown className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
