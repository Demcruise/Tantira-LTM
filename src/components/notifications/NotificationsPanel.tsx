import { useState } from "react";
import { Button, Menu, MenuItem, Popover, Tab, Tabs } from "@blueprintjs/core";
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
  onMarkRead: (notificationId: string) => void;
  onMarkUnread: (notificationId: string) => void;
}

export function NotificationsPanel({ notifications, leads, onMarkAllRead, onSelect, onMarkRead, onMarkUnread }: NotificationsPanelProps) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const hasUnread = notifications.some((n) => !n.read);
  const filtered = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="notifications-panel">
      <div className="notifications-panel__header">
        <span className="notifications-panel__title">Notifications</span>
        <Button minimal small text="Mark all read" disabled={!hasUnread} onClick={onMarkAllRead} />
      </div>

      <Tabs id="notif-tabs" onChange={(t) => setTab(t as "all" | "unread")} selectedTabId={tab} className="notifications-panel__tabs">
        <Tab id="all" title={`All (${notifications.length})`} />
        <Tab id="unread" title={`Unread (${notifications.filter((n) => !n.read).length})`} />
      </Tabs>

      <div className="notifications-panel__list">
        {filtered.length === 0 ? (
          <p className="notifications-panel__empty">{tab === "unread" ? "No unread notifications." : "You're all caught up."}</p>
        ) : (
          filtered.map((n) => {
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
                    <div className="notifications-panel__footer-actions">
                      {actionLabel && <Button small intent={n.read ? "none" : "primary"} minimal={n.read} rightIcon="arrow-right" text={actionLabel} onClick={() => onSelect(n)} />}
                      <Popover
                        placement="bottom-end"
                        minimal
                        content={
                          <Menu>
                            {n.read ? (
                              <MenuItem icon="circle" text="Mark as unread" onClick={() => onMarkUnread(n.id)} />
                            ) : (
                              <MenuItem icon="tick" text="Mark as read" onClick={() => onMarkRead(n.id)} />
                            )}
                          </Menu>
                        }
                      >
                        <Button small minimal icon="more" aria-label="More actions" />
                      </Popover>
                    </div>
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
