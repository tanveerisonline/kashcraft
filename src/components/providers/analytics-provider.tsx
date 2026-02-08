"use client";

import { useEffect } from "react";
import { initializeAnalytics, usePageView } from "@/lib/analytics";
import { usePathname } from "next/navigation";

/**
 * Analytics Provider Component
 * Initializes analytics services and tracks page views
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics on mount
    initializeAnalytics();
  }, []);

  // Track page views on route change
  usePageView(pathname);

  return <>{children}</>;
}
