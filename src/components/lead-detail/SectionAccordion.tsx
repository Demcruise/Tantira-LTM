import { useEffect, useState } from "react";
import { Collapse, Icon } from "@blueprintjs/core";

interface SectionAccordionProps {
  flagged: boolean;
  title: string;
  summary: string;
  children: React.ReactNode;
}

export function SectionAccordion({ flagged, title, summary, children }: SectionAccordionProps) {
  const [open, setOpen] = useState(flagged);

  // Auto-collapse the moment a section resolves (flagged -> passed), and expand
  // if it becomes newly flagged — the whole point of management-by-exception.
  useEffect(() => {
    setOpen(flagged);
  }, [flagged]);

  return (
    <div className={`section-accordion${flagged ? " section-accordion--flagged" : " section-accordion--passed"}`}>
      <button type="button" className="section-accordion__header" onClick={() => setOpen(!open)}>
        <Icon icon={flagged ? "warning-sign" : "tick-circle"} size={14} className="section-accordion__glyph" />
        <span className="section-accordion__title">{title}</span>
        <span className="section-accordion__summary">{summary}</span>
        <Icon icon={open ? "chevron-up" : "chevron-down"} size={13} />
      </button>
      <Collapse isOpen={open}>
        <div className="section-accordion__body">{children}</div>
      </Collapse>
    </div>
  );
}
