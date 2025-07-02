export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  user: string;
  action: string;
  isRead: boolean;
  targetType: string;
  targetId: string | null;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  results: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}