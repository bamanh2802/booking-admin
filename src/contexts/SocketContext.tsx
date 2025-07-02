// src/components/providers/SocketProvider.tsx

"use client";

import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { io } from "socket.io-client";
import type { Socket } from "@/types/socket";
// Bạn không cần import SOCKET_PATH nữa, vì chúng ta sẽ định nghĩa nó rõ ràng ở đây
// import { SOCKET_PATH } from "@/services/apiPath";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketContextType>(null);

  useEffect(() => {
    const SERVER_URL = "https://vexenay.com";

    const SOCKET_IO_PATH = "/api/socket.io";

    console.log(
      `[Socket.IO] Attempting to connect to: ${SERVER_URL} with path: ${SOCKET_IO_PATH}`
    );

    const newSocket: Socket = io(SERVER_URL, {
      // Chỉ định đường dẫn của Socket.IO
      path: SOCKET_IO_PATH,
      // Tùy chọn này rất quan trọng để client biết gửi request đến đúng /api
      withCredentials: true,
      transports: ["websocket", "polling"], // Tăng độ tin cậy
    });

    newSocket.on("connect", () => {
      console.log(
        `[Socket.IO] ✅ Connected to server with socket ID: ${newSocket.id}`
      );
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] ❌ Disconnected from server. Reason: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      console.error(`[Socket.IO] ❌ Connection error: ${error.message}`);
    });

    setSocket(newSocket);

    // Hàm dọn dẹp khi component bị unmount
    return () => {
      console.log("[Socket.IO] Disconnecting...");
      newSocket.disconnect();
    };
  }, []); // useEffect chỉ chạy một lần

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
