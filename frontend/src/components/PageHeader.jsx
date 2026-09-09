import React from "react";

export default function PageHeader({ icon, eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {icon && <span className="page-icon-badge mt-0.5">{icon}</span>}
        <div>
          {eyebrow && <p className="text-brass text-xs tracking-wide uppercase mb-1">{eyebrow}</p>}
          <h1 className="text-2xl">{title}</h1>
          {subtitle && <p className="text-ink/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
