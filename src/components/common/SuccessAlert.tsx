"use client";

import { CheckCircle } from "lucide-react";

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div className="alert alert-success mb-4 shadow-lg">
      <div className="flex items-center gap-3">
        <CheckCircle size={24} />
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
