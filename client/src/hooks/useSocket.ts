// React hook for connecting to Socket.IO and handling notifications
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useSocket(userId: string, onNotification: (notification: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.emit("register", userId);
    socket.on("notification", onNotification);
    socketRef.current = socket;
    return () => {
      socket.off("notification", onNotification);
      socket.disconnect();
    };
  }, [userId, onNotification]);

  return socketRef.current;
}
