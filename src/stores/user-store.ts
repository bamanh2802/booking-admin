import { create } from "zustand";
import { userAPI } from "@/services/api/user-api";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
} from "@/types/user";
import type { ApiError } from "@/types/api";
import { DEFAULT_PAGINATION } from "@/constants/pagination";

interface UserState {
  // State
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;

  // Filters
  filters: UserListParams;
}

interface UserActions {
  // List users
  fetchUsers: (params?: UserListParams) => Promise<void>;
  setFilters: (filters: Partial<UserListParams>) => void;
  resetFilters: () => void;

  // User operations
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserRequest) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;

  // UI state
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  selectedUser: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Pagination
  currentPage: DEFAULT_PAGINATION.page,
  totalPages: 0,
  totalUsers: 0,
  limit: DEFAULT_PAGINATION.limit,

  // Filters
  filters: DEFAULT_PAGINATION,

  // Actions
  fetchUsers: async (params?: UserListParams) => {
    set({ isLoading: true, error: null });

    try {
      const currentState = get();
      const requestParams = {
        ...currentState.filters,
        ...params,
      };

      const response = await userAPI.getUserList(requestParams);

      if (response.success) {
        set({
          users: response.data.results,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalUsers: response.data.pagination.total,
          limit: response.data.pagination.limit,
          filters: requestParams,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || "Không thể tải danh sách người dùng",
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters: Partial<UserListParams>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };

    set({ filters: updatedFilters });
    get().fetchUsers(updatedFilters);
  },

  resetFilters: () => {
    set({ filters: DEFAULT_PAGINATION });
    get().fetchUsers(DEFAULT_PAGINATION);
  },

  createUser: async (userData: CreateUserRequest) => {
    set({ isCreating: true, error: null });

    try {
      const response = await userAPI.createUser(userData);

      if (response.success) {
        // Refresh user list after creating
        await get().fetchUsers();

        set({
          isCreating: false,
          error: null,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || "Không thể tạo người dùng",
        isCreating: false,
      });
      throw error;
    }
  },

  updateUser: async (userId: string, userData: UpdateUserRequest) => {
    set({ isUpdating: true, error: null });

    try {
      const response = await userAPI.updateUser(userId, userData);

      if (response.success) {
        // Update user in local state
        const currentUsers = get().users;
        const updatedUsers = currentUsers.map((user) =>
          user._id === userId ? { ...user, ...response.data } : user,
        );

        // Update selected user if it's the one being updated
        const selectedUser = get().selectedUser;
        const updatedSelectedUser =
          selectedUser?._id === userId
            ? { ...selectedUser, ...response.data }
            : selectedUser;

        set({
          users: updatedUsers,
          selectedUser: updatedSelectedUser,
          isUpdating: false,
          error: null,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || "Không thể cập nhật người dùng",
        isUpdating: false,
      });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    set({ isDeleting: true, error: null });

    try {
      await userAPI.deleteUser(userId);

      // Remove user from local state
      const currentUsers = get().users;
      const updatedUsers = currentUsers.filter((user) => user._id !== userId);

      // Clear selected user if it's the one being deleted
      const selectedUser = get().selectedUser;
      const updatedSelectedUser =
        selectedUser?._id === userId ? null : selectedUser;

      set({
        users: updatedUsers,
        selectedUser: updatedSelectedUser,
        totalUsers: get().totalUsers - 1,
        isDeleting: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || "Không thể xóa người dùng",
        isDeleting: false,
      });
      throw error;
    }
  },

  fetchUserById: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await userAPI.getUserById(userId);

      if (response.success) {
        set({
          selectedUser: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || "Không thể tải thông tin người dùng",
        isLoading: false,
      });
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setPage: (page: number) => {
    get().setFilters({ page });
  },

  setLimit: (limit: number) => {
    get().setFilters({ limit, page: 1 }); // Reset to first page when changing limit
  },
}));
