"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import type { Notification } from "@/types/notification";
import "./WebSocketNotifier.css";

// Định nghĩa một kiểu mới cho thông báo ở client, có thêm ID
interface ClientNotification extends Notification {
  id: string; // ID duy nhất ở phía client
}

// Component con để hiển thị một thông báo đơn lẻ
// Props của nó giờ sẽ là ClientNotification
const NotificationToast = ({
  notification,
  onDismiss,
}: {
  notification: ClientNotification;
  onDismiss: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // 5 giây

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    // Sử dụng title thay cho type để hiển thị tiêu đề
    <div className={`notification-toast ${notification.type}`}>
      <div className="notification-content">
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
      </div>
      <button
        className="dismiss-btn"
        onClick={() => onDismiss(notification.id)}
      >
        ×
      </button>
    </div>
  );
};

// Component chính quản lý tất cả các thông báo
export const WebSocketNotifier = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Hàm xử lý khi nhận được thông báo
    const handleReceiveNotification = (data: Notification) => {
      console.log("Received notification from server:", data);

      // Tạo một thông báo mới cho client với một ID duy nhất
      // Kết hợp targetId và timestamp để đảm bảo tính duy nhất
      const newNotification: ClientNotification = {
        ...data,
        id: `${data.targetId}-${Date.now()}`,
      };

      setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
      ]);
    };

    // LẮNG NGHE ĐÚNG SỰ KIỆN 'notification'
    socket.on("notification", handleReceiveNotification);

    // Cleanup listener
    return () => {
      socket.off("notification", handleReceiveNotification);
    };
  }, [socket]);

  // Hàm để xóa một thông báo khỏi danh sách
  const dismissNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id} // Sử dụng ID duy nhất đã tạo
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};
