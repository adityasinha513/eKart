import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as notificationsApi from "../services/api/notifications";
import type { Notification } from "../services/api/notifications";
import EmptyState from "../components/ui/EmptyState";
import SectionHeading from "../shared/components/SectionHeading";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    notificationsApi
      .getNotifications(user.emailId)
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading title="Notifications" subtitle="Order updates and offers will show up here" />

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-[24px] bg-mithai-100" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="No notifications yet"
          description="Notifications are coming soon — order updates, offers, and reminders will appear here once this feature launches."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.notificationId} className="rounded-2xl border border-mithai-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-maroon-900">{notification.title}</p>
              <p className="mt-1 text-sm text-stone-600">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
