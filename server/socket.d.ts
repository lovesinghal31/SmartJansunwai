declare function initSocket(server: any): void;
declare function sendNotificationToUser(userId: string, notification: any): void;

export default {
  initSocket,
  sendNotificationToUser
};
