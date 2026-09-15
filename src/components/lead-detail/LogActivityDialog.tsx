import { useState } from "react";
import { Button, Classes, Dialog, FormGroup, Radio, RadioGroup, TextArea } from "@blueprintjs/core";
import type { ActivityChannel } from "../../types";

interface LogActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { channel: ActivityChannel; note: string; followUpDueAt: string | null }) => void;
}

function tomorrowDateInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function LogActivityDialog({ isOpen, onClose, onSubmit }: LogActivityDialogProps) {
  const [channel, setChannel] = useState<ActivityChannel>("call");
  const [note, setNote] = useState("");
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(tomorrowDateInput());

  function reset() {
    setChannel("call");
    setNote("");
    setScheduleFollowUp(false);
    setFollowUpDate(tomorrowDateInput());
  }

  function handleSubmit() {
    onSubmit({ channel, note: note.trim(), followUpDueAt: scheduleFollowUp ? new Date(followUpDate).toISOString() : null });
    reset();
    onClose();
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log activity" icon="phone">
      <div className={Classes.DIALOG_BODY}>
        <RadioGroup label="How did you reach out?" selectedValue={channel} onChange={(e) => setChannel(e.currentTarget.value as ActivityChannel)} inline>
          <Radio label="Call" value="call" />
          <Radio label="Email" value="email" />
          <Radio label="Meeting" value="meeting" />
        </RadioGroup>

        <FormGroup label="Notes" labelInfo="(optional)" helperText="What happened, and what's the next step.">
          <TextArea fill rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Discussed budget, needs VP sign-off. Next: send pricing doc." />
        </FormGroup>

        <label className="log-activity-dialog__followup-toggle">
          <input type="checkbox" checked={scheduleFollowUp} onChange={(e) => setScheduleFollowUp(e.target.checked)} />
          Schedule a follow-up
        </label>

        {scheduleFollowUp && (
          <FormGroup label="Follow-up due" className="log-activity-dialog__date-field">
            <input type="date" className="bp5-input" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </FormGroup>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text="Cancel" onClick={onClose} />
          <Button intent="primary" text="Log activity" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
}
