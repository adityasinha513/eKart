/**
 * NotificationMS is not built yet (/api/notifications/** has no live implementation). Kept as
 * a typed stub so the bell icon / notifications page can call a real-looking API and show an
 * empty state gracefully instead of crashing.
 */

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(_customerEmailId: string): Promise<Notification[]> {
  return [];
}

export async function markNotificationRead(_notificationId: number): Promise<void> {
  return Promise.resolve();
}
