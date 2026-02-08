"use client";

import * as React from "react";
import { ToastProvider as RadixToastProvider } from "@radix-ui/react-toast";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast/toast";
import { useToast } from "@/components/ui/toast/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {toasts.map(function ({ id, title, description, action, type, ...props }) {
        const variant =
          type === "error"
            ? "destructive"
            : type === "info"
              ? "default"
              : type;
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </RadixToastProvider>
  );
}
