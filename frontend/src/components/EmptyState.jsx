import React from "react";

export default function EmptyState({ icon, title, action }) {
  return (
    <div className="empty-state">
      {icon && <span className="text-ink/25">{icon}</span>}
      <p>{title}</p>
      {action}
    </div>
  );
}
