import { Socket as SocketIoSocket } from 'socket.io-client';
import { Notification } from '.';

// Định nghĩa các sự kiện mà server gửi cho client
export interface ServerToClientEvents {
  // `no-op` là một sự kiện mặc định của thư viện, có thể bỏ qua
  'no-op': () => void;
  
  // Ví dụ: server gửi một tin nhắn mới cho client
  receive_message: (data: { content: string; sender: string }) => void;

  // Ví dụ: server thông báo có người dùng mới kết nối
  user_connected: (data: { userId: string; socketId: string }) => void;

  notification: (data: Notification) => void;
}

// Định nghĩa các sự kiện mà client gửi cho server
export interface ClientToServerEvents {
  // Ví dụ: client gửi một tin nhắn lên server
  send_message: (data: { content: string }) => void;
}

// Gộp tất cả lại thành một type duy nhất cho Socket
export type Socket = SocketIoSocket<ServerToClientEvents, ClientToServerEvents>;