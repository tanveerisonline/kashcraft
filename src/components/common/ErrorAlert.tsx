"use client";

import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="alert alert-error mb-4 shadow-lg">
      <div className="flex items-center gap-3">
        <AlertCircle size={24} />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button className="btn btn-sm btn-ghost" onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  );
}
