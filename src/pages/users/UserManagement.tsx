import { useEffect, useState } from "react";
import { Plus, Search, RefreshCw, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { UserDetailDialog } from "@/components/users/UserDetailDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { useErrorHandler, useSuccessHandler } from "@/hooks/useErrorHandler";
import {
  getRoleBadgeVariant,
  getRoleDisplayName,
  ALL_ROLE_OPTIONS,
  getRoleBadgeStyle,
} from "@/constants/roles";
import type { User } from "@/types/user";

export default function UserManagement() {
  const {
    users,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalUsers,
    limit,
    fetchUsers,
    deleteUser,
    setPage,
    setLimit,
    clearError,
  } = useUserStore();

  const { showSuccess } = useSuccessHandler();

  // Error handling
  useErrorHandler({
    error,
    clearError,
    title: "Lỗi quản lý người dùng",
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Remove auto search when filters change - we'll filter on client now
  // useEffect(() => {
  //   handleSearch();
  // }, [roleFilter]);

  // Handle search button click - now just for manual refresh if needed
  const handleSearch = () => {
    fetchUsers(); // Refresh data from server without filters
  };

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  // Filter users locally by both search term and role
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch = searchTerm.trim()
      ? user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      : true;

    // Role filter
    const matchesRole = roleFilter ? user.roleName === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  // Handle user actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  // Tạm thời ẩn chức năng xóa user
  // const handleDeleteUser = (user: User) => {
  //   setSelectedUser(user);
  //   setDeleteDialogOpen(true);
  // };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser._id);
      showSuccess("Thành công", "Đã xóa người dùng thành công");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error will be handled by useErrorHandler
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản người dùng và phân quyền hệ thống
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo email, tên..."
                  value={searchTerm}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full h-10 px-3 border border-input bg-background rounded-md"
              >
                <option value="">Tất cả vai trò</option>
                {ALL_ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
          <CardDescription>
            {searchTerm.trim() || roleFilter 
              ? `Hiển thị ${filteredUsers.length} kết quả ${searchTerm.trim() ? 'tìm kiếm' : ''}${searchTerm.trim() && roleFilter ? ' và ' : ''}${roleFilter ? 'lọc theo vai trò' : ''} từ tổng ${users.length} người dùng`
              : `Trang ${currentPage} / ${totalPages} - Tổng ${totalUsers} người dùng`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getRoleBadgeVariant(user.roleName)}
                          style={getRoleBadgeStyle(user.roleName)}
                        >
                          {getRoleDisplayName(user.roleName)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Tạm thời ẩn nút xóa user */}
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm.trim() || roleFilter
                    ? "Không tìm thấy người dùng nào phù hợp với điều kiện lọc"
                    : "Không có người dùng nào"
                  }
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
      />

      <UserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.fullName}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
