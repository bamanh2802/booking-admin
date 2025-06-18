import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, TrendingDown } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho một nhà xe được xếp hạng
type CompanyRating = {
  name: string;
  avatarFallback: string;
  averageRating: number;
  totalReviews: number;
};

// Định nghĩa props cho component
type BusCompanyRatingsProps = {
  top: CompanyRating[];
  bottom: CompanyRating[];
};

export function BusCompanyRatings({ top, bottom }: BusCompanyRatingsProps) {
  const renderRatingList = (list: CompanyRating[], type: "top" | "bottom") => (
    <div className="space-y-6">
      {list.map((company) => (
        <div key={company.name} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{company.avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{company.name}</p>
              <p className="text-xs text-muted-foreground">
                {company.totalReviews.toLocaleString()} đánh giá
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {type === "top" ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <p
              className={`flex items-center gap-1 font-bold ${
                type === "top" ? "text-green-600" : "text-red-600"
              }`}
            >
              {company.averageRating.toFixed(1)}
              <Star className="h-4 w-4 fill-current" />
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng Nhà xe</CardTitle>
        <CardDescription>
          Hiệu suất đánh giá của các nhà xe trong tháng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top-rated">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="top-rated">Đánh giá tốt nhất</TabsTrigger>
            <TabsTrigger value="needs-improvement">Cần cải thiện</TabsTrigger>
          </TabsList>
          <TabsContent value="top-rated" className="mt-4">
            {renderRatingList(top, "top")}
          </TabsContent>
          <TabsContent value="needs-improvement" className="mt-4">
            {renderRatingList(bottom, "bottom")}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Xem báo cáo chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
}
