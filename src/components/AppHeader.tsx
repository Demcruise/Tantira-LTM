import { useState } from "react";
import { Icon, Popover } from "@blueprintjs/core";
import type { AppNotification, Lead } from "../types";
import { NotificationsPanel } from "./notifications/NotificationsPanel";

interface AppHeaderProps {
  notifications: AppNotification[];
  leads: Lead[];
  onMarkAllRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export function AppHeader({ notifications, leads, onMarkAllRead, onSelectNotification }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="app-header">
      <Popover
        isOpen={isOpen}
        onInteraction={(next) => setIsOpen(next)}
        placement="bottom-end"
        minimal
        content={
          <NotificationsPanel
            notifications={notifications}
            leads={leads}
            onMarkAllRead={onMarkAllRead}
            onSelect={(n) => {
              onSelectNotification(n);
              setIsOpen(false);
            }}
          />
        }
      >
        <button type="button" className="app-header__bell" aria-label="Notifications">
          <Icon icon="notifications" size={18} />
          {unreadCount > 0 && <span className="app-header__badge">{unreadCount}</span>}
        </button>
      </Popover>
    </header>
  );
}
