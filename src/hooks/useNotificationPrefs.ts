import { useState } from "react";
import { INITIAL_NOTIFICATION_PREFS } from "../data/notificationPrefs";
import type { NotificationChannel, NotificationPrefMatrix } from "../types";
import { AppToaster } from "../lib/toaster";

/** Owns per-event notification channel preferences and their toggle handler for the Notification Preferences page. */
export function useNotificationPrefs() {
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefMatrix>(INITIAL_NOTIFICATION_PREFS);

  function handleToggleNotificationPref(eventKey: string, channel: NotificationChannel, enabled: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [eventKey]: { ...prev[eventKey], [channel]: enabled } }));
    AppToaster.show({
      icon: enabled ? "tick-circle" : "small-cross",
      intent: enabled ? "success" : "none",
      message: `${enabled ? "Enabled" : "Disabled"} ${channel === "inApp" ? "in-app" : "email"} notifications for this event.`,
      timeout: 2000,
    });
  }

  return { notifPrefs, handleToggleNotificationPref };
}
