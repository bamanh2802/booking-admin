"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Check, X } from "lucide-react";

import commissionAPI from "@/services/api/commission-api";
import type { Commission } from "@/types/commission";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleDisplayName } from "@/constants/roles"; // Giả sử bạn có hàm này

// Component con để render một hàng của bảng
const CommissionRow = ({
  commission,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  commission: Commission;
  isEditing: boolean;
  onEdit: (commission: Commission) => void;
  onCancel: () => void;
  onSave: (id: string, newPercent: number) => Promise<void>;
}) => {
  const [percent, setPercent] = useState(commission.percent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(commission.roleId, percent);
    setIsSaving(false);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {getRoleDisplayName(commission.roleName) || commission.roleName}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-24 h-9"
              min={0}
              max={100}
            />
            <span className="text-muted-foreground">%</span>
          </div>
        ) : (
          <span>{commission.percent} %</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              className="h-8 w-8 bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(commission)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default function CommissionManagementPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const response = await commissionAPI.getAllCommissions();
      if (response.success) {
        setCommissions(response.data);
      } else {
        toast.error("Lỗi khi tải danh sách hoa hồng.", {
          description: response.message,
        });
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleSaveCommission = async (id: string, newPercent: number) => {
    const originalCommissions = [...commissions];
    setCommissions((prev) =>
      prev.map((c) => (c._id === id ? { ...c, percent: newPercent } : c))
    );
    setEditingId(null);

    try {
      await commissionAPI.updateCommission(id, newPercent);
      toast.success("Cập nhật hoa hồng thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại. Đang hoàn tác thay đổi.");
      setCommissions(originalCommissions);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Hoa hồng</h1>
        <p className="text-muted-foreground">
          Thiết lập tỷ lệ phần trăm hoa hồng cho từng vai trò trong hệ thống.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng tỷ lệ hoa hồng</CardTitle>
          <CardDescription>
            Click vào "Chỉnh sửa" để thay đổi tỷ lệ phần trăm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vai trò</TableHead>
                <TableHead>Tỷ lệ (%)</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-9 w-28 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : commissions.length > 0 ? (
                commissions.map((commission) => (
                  <CommissionRow
                    key={commission._id}
                    commission={commission}
                    isEditing={editingId === commission._id}
                    onEdit={(c) => setEditingId(c._id)}
                    onCancel={() => setEditingId(null)}
                    onSave={handleSaveCommission}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Không có dữ liệu hoa hồng.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
