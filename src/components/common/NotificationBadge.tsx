"use client";

import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationBadge({ count = 0, onClick }: NotificationBadgeProps) {
  return (
    <div className="indicator">
      {count > 0 && <span className="indicator-item badge badge-error">{count}</span>}
      <button className="btn btn-ghost btn-circle" onClick={onClick}>
        <Bell size={24} />
      </button>
    </div>
  );
}
