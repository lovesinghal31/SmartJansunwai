import { Server } from "socket.io";

let io: Server | undefined;

function initSocket(server: any): void {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Listen for user registration
    socket.on("register", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    });
  });
}

function sendNotificationToUser(userId: string, notification: any): void {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
    console.log(`Notification sent to user:${userId}`);
  } else {
    console.warn("Socket.io not initialized.");
  }
}

export default {
  initSocket,
  sendNotificationToUser,
};
