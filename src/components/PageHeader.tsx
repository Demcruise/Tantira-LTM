import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}

export function PageHeader({ title, description, actions, tabs }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__row">
        <div className="page-header__text">
          <h2 className="page-header__title">{title}</h2>
          {description && <p className="page-header__description">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {tabs && <div className="page-header__tabs">{tabs}</div>}
    </div>
  );
}
