/**
 * Service Worker Configuration for PWA Features
 * Implements: offline support, background sync, push notifications, asset caching
 */

// next-pwa configuration
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  dynamicStartUrl: "/",
  publicExcludes: ["!.htaccess"],
  buildExcludes: [/sentry/, /\.map$/],
  cacheStartUrl: true,
  reloadOnOnline: true,
  fallbacks: {
    image: "/images/fallback.png",
    document: "/offline.html",
    api: "/api/offline",
  },
  runtimeCaching: [
    // Cache first for static assets
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Cache first for images
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Network first for API calls
    {
      urlPattern: /^\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
    // Stale while revalidate for HTML pages
    {
      urlPattern: /^https?.*\.(html)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "html-pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
    // Stale while revalidate for CSS/JS
    {
      urlPattern: /^https?.*\.(css|js)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
  ],
});

export default withPWA;

declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
    readonly periodicSync: PeriodicSyncManager;
  }

  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }

  interface PeriodicSyncManager {
    register(tag: string, options?: { minInterval: number }): Promise<void>;
    getTags(): Promise<string[]>;
  }
}

/**
 * Client-side service worker utilities
 */
export const ServiceWorkerUtils = {
  /**
   * Register service worker
   */
  register: async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  },

  /**
   * Unregister service worker
   */
  unregister: async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log("Service Workers unregistered");
    } catch (error) {
      console.error("Error unregistering Service Workers:", error);
    }
  },

  /**
   * Check if service worker is supported
   */
  isSupported: () => {
    return typeof window !== "undefined" && "serviceWorker" in navigator;
  },

  /**
   * Request notification permission
   */
  requestNotificationPermission: async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      return await Notification.requestPermission();
    }

    return "denied";
  },

  /**
   * Subscribe to push notifications
   */
  subscribeToPushNotifications: async (vapidPublicKey: string) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push notifications not supported");
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  },

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPushNotifications: async () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }
  },

  /**
   * Send message to service worker
   */
  postMessage: (message: any) => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  },

  /**
   * Background sync registration
   */
  registerBackgroundSync: async (tag: string) => {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
      throw new Error("Background sync not supported");
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  },

  /**
   * Periodic background sync
   */
  registerPeriodicSync: async (tag: string, minInterval: number = 60000) => {
    if (!("serviceWorker" in navigator) || !("PeriodicSyncManager" in window)) {
      throw new Error("Periodic sync not supported");
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.periodicSync.register(tag, { minInterval });
  },

  /**
   * Clear all caches
   */
  clearAllCaches: async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  },

  /**
   * Get cache size
   */
  getCacheSize: async (): Promise<number> => {
    if (!("storage" in navigator) || !("estimate" in navigator.storage)) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  },

  /**
   * Get cache quota
   */
  getCacheQuota: async (): Promise<number> => {
    if (!("storage" in navigator) || !("estimate" in navigator.storage)) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.quota || 0;
  },

  /**
   * Request persistent storage
   */
  requestPersistentStorage: async (): Promise<boolean> => {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) {
      return false;
    }

    return await navigator.storage.persist();
  },
};

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Online/offline status tracking
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Offline queue for API requests
 */
export class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private storageKey = "offlineQueue";

  constructor() {
    this.loadFromStorage();
  }

  add(request: QueuedRequest) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
    });
    this.saveToStorage();
  }

  async processQueue(onlineStatusCallback?: (status: boolean) => void) {
    if (!navigator.onLine) {
      return;
    }

    const failedRequests: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        const response = await fetch(request.url, {
          method: request.method || "GET",
          headers: request.headers,
          body: request.body,
        });

        if (!response.ok) {
          failedRequests.push(request);
        }
      } catch (error) {
        console.error("Failed to process queued request:", error);
        failedRequests.push(request);
      }
    }

    this.queue = failedRequests;
    this.saveToStorage();

    if (onlineStatusCallback && failedRequests.length === 0) {
      onlineStatusCallback(true);
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    }
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    }
  }

  getQueue() {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.saveToStorage();
  }
}

interface QueuedRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timestamp?: number;
}

import React from "react";
