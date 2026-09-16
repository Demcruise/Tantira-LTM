import { useState } from "react";
import { SEED_NOTIFICATIONS } from "../data/notifications";
import type { AppNotification } from "../types";

/** Owns the notification bell list; opening a notification defers to the callbacks the caller provides
 * since "open a lead" / "open an audit search" are App-level navigation concerns. */
export function useNotifications(onOpenLead: (leadId: string) => void, onOpenAuditSearch: (search: string) => void) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);

  function addNotification(notification: AppNotification) {
    setNotifications((prev) => [notification, ...prev]);
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleSelectNotification(notification: AppNotification) {
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    if (notification.leadId) {
      onOpenLead(notification.leadId);
    } else if (notification.auditSearch) {
      onOpenAuditSearch(notification.auditSearch);
    }
  }

  return { notifications, addNotification, handleMarkAllNotificationsRead, handleSelectNotification };
}
