"use client"; // Chú thích này không có tác dụng trong Vite nhưng có thể giữ lại

import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom"; // Import Link từ React Router DOM
import { useSocket } from "@/contexts/SocketContext"; // Đường dẫn tới hook socket của bạn
import { notificationAPI } from "@/services/api/notification-api"; // Đường dẫn tới API service của bạn
import type { Notification } from "@/types/notification"; // Đường dẫn tới type definition của bạn
import { Menu, Transition } from "@headlessui/react";
import { BellIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import clsx from "clsx";
import { Button } from "@/components/ui/button"; // Import Button từ Shadcn/UI
import { Separator } from "@/components/ui/separator"; // Import Separator từ Shadcn/UI

// ===================================================================
// Component con hiển thị một dòng thông báo
// ===================================================================
const NotificationItem = ({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) => {
  const handleItemClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification._id);
    }
    // Tùy chọn: Thêm logic điều hướng tại đây nếu cần
    // Ví dụ: navigate(`/requests/${notification.targetId}`);
  };

  return (
    <div
      onClick={handleItemClick}
      className={clsx(
        "flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150",
        !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        <EnvelopeIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p
          className={clsx(
            "text-sm font-medium text-gray-900 dark:text-gray-100",
            !notification.isRead && "font-bold"
          )}
        >
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {notification.message}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          {notification.createdAt
            ? formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: vi,
              })
            : "Vừa xong"}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 ml-2 mt-1 self-center">
          <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
        </div>
      )}
    </div>
  );
};

export const NotificationBell = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationAPI.getAllNotifications();
        const results = response.data.results;
        setNotifications(results);
        const initialUnread = results.filter(
          (n: Notification) => !n.isRead
        ).length;
        setUnreadCount(initialUnread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifications();
  }, []);

  // Lắng nghe sự kiện real-time từ socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: Notification) => {
      // Thêm thông báo mới vào đầu danh sách
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Giới hạn 10 thông báo trong dropdown
      if (!newNotification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNewNotification);

    // Cleanup listener
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  // Xử lý khi người dùng click vào một thông báo để đánh dấu đã đọc
  const handleMarkAsRead = async (id: string) => {
    const notification = notifications.find((n) => n._id === id);
    if (!notification || notification.isRead) return;

    // Cập nhật UI ngay lập tức để có trải nghiệm mượt mà
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Gửi request lên server trong nền
    try {
      await notificationAPI.markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Nếu có lỗi, rollback lại trạng thái UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          as={Button}
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <span className="sr-only">Open notifications</span>
          <BellIcon className="h-8 w-8" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <p className="text-sm font-medium text-foreground">Thông báo</p>
          </div>
          <Separator />
          <div className="py-1 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                Đang tải...
              </p>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <Menu.Item key={notification._id || `notif-${Math.random()}`}>
                  {() => (
                    <NotificationItem
                      notification={notification}
                      onMarkRead={handleMarkAsRead}
                    />
                  )}
                </Menu.Item>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">
                Không có thông báo mới.
              </p>
            )}
          </div>
          <Separator />
          <div className="p-2">
            <Menu.Item>
              {({ close }) => (
                <Button
                  asChild
                  variant="link"
                  className="w-full"
                  onClick={close}
                >
                  <Link to="/notifications">Xem tất cả</Link>
                </Button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
