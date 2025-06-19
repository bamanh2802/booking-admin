import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RefundData = {
  totalAmount: string;
  comparisonText: string;
  regularTickets: {
    count: number;
    amount: string;
  };
  vipTickets: {
    count: number;
    amount: string;
  };
};

type RefundReportProps = {
  data: RefundData;
};

export function RefundReport({ data }: RefundReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo hoàn tiền (Tháng này)</CardTitle>
        <CardDescription>
          Tổng hợp các giao dịch hoàn tiền trong tháng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tổng số tiền hoàn */}
        <div>
          <p className="text-xs text-muted-foreground">Tổng tiền đã hoàn</p>
          <p className="text-2xl font-bold">{data.totalAmount}</p>
          <p className="text-xs text-muted-foreground">{data.comparisonText}</p>
        </div>

        <Separator />

        {/* Chi tiết theo loại vé */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Vé Thường</p>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {data.regularTickets.amount}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.regularTickets.count} vé
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Vé VIP</p>
            <div className="text-right">
              <p className="text-sm font-semibold">{data.vipTickets.amount}</p>
              <p className="text-xs text-muted-foreground">
                {data.vipTickets.count} vé
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
