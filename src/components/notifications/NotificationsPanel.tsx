import { Button } from "@blueprintjs/core";
import type { AppNotification, Lead } from "../../types";
import { ReasonBadge } from "../needs-attention/ReasonBadge";
import { PriorityTag } from "../Tags";
import { SlaBadge } from "../SlaBadge";
import { relativeTime } from "../../lib/relativeTime";

interface NotificationsPanelProps {
  notifications: AppNotification[];
  leads: Lead[];
  onMarkAllRead: () => void;
  onSelect: (notification: AppNotification) => void;
}

export function NotificationsPanel({ notifications, leads, onMarkAllRead, onSelect }: NotificationsPanelProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="notifications-panel">
      <div className="notifications-panel__header">
        <span className="notifications-panel__title">Notifications</span>
        <Button minimal small text="Mark all read" disabled={!hasUnread} onClick={onMarkAllRead} />
      </div>

      <div className="notifications-panel__list">
        {notifications.length === 0 ? (
          <p className="notifications-panel__empty">You're all caught up.</p>
        ) : (
          notifications.map((n) => {
            const lead = n.leadId ? leads.find((l) => l.id === n.leadId) : undefined;
            const actionLabel = lead ? "Open lead" : n.auditSearch ? "View in audit log" : null;
            return (
              <div key={n.id} className={`notifications-panel__item${n.read ? "" : " notifications-panel__item--unread"}`}>
                <span className={`notifications-panel__dot${n.read ? " notifications-panel__dot--read" : ""}`} aria-hidden="true" />
                <div className="notifications-panel__body">
                  <div className="notifications-panel__item-title-row">
                    <div className="notifications-panel__item-title">{n.title}</div>
                    {n.reason && <ReasonBadge reason={n.reason} />}
                  </div>
                  {lead ? (
                    <div className="notifications-panel__lead">
                      <span className="notifications-panel__lead-name">{lead.name}</span>
                      <span className="notifications-panel__lead-company">{lead.company}</span>
                      <PriorityTag priority={lead.priority} />
                      <span className="notifications-panel__lead-score">{lead.score}</span>
                      {lead.status !== "Lost" && <SlaBadge lead={lead} />}
                    </div>
                  ) : (
                    <div className="notifications-panel__item-subtitle">{n.subtitle}</div>
                  )}
                  <div className="notifications-panel__item-footer">
                    <span className="notifications-panel__time">{relativeTime(n.time)}</span>
                    {actionLabel && <Button small intent={n.read ? "none" : "primary"} minimal={n.read} rightIcon="arrow-right" text={actionLabel} onClick={() => onSelect(n)} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
