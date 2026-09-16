import { Card, Checkbox, HTMLTable } from "@blueprintjs/core";
import { NOTIFICATION_EVENTS } from "../data/notificationPrefs";
import type { NotificationChannel, NotificationEventKey, NotificationPrefMatrix } from "../types";
import { PageHeader } from "../components/PageHeader";

interface NotificationPreferencesPageProps {
  matrix: NotificationPrefMatrix;
  onToggle: (eventKey: NotificationEventKey, channel: NotificationChannel, enabled: boolean) => void;
}

export function NotificationPreferencesPage({ matrix, onToggle }: NotificationPreferencesPageProps) {
  return (
    <div className="notif-prefs-page">
      <PageHeader section="Govern" title="Notification Preferences" description="Choose how you want to hear about each type of event. Changes save automatically." />

      <Card className="page-card">
      <div className="table-scroll-wrap">
        <HTMLTable className="notif-prefs-page__table">
        <thead>
          <tr>
            <th>Event</th>
            <th>In-app</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {NOTIFICATION_EVENTS.map((event) => (
            <tr key={event.key}>
              <td>
                <div className="notif-prefs-page__event-cell">
                  <div className="notif-prefs-page__event-label">{event.label}</div>
                  {event.description && <div className="notif-prefs-page__event-desc">{event.description}</div>}
                </div>
              </td>
              <td className="notif-prefs-page__cell">
                <Checkbox
                  checked={matrix[event.key]?.inApp ?? false}
                  onChange={() => onToggle(event.key, "inApp", !(matrix[event.key]?.inApp ?? false))}
                />
              </td>
              <td className="notif-prefs-page__cell">
                <Checkbox
                  checked={matrix[event.key]?.email ?? false}
                  onChange={() => onToggle(event.key, "email", !(matrix[event.key]?.email ?? false))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      </div>
      </Card>
    </div>
  );
}
