"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag: any;
    fbq: any;
  }
}

/**
 * Analytics Service for tracking user interactions
 * Supports Google Analytics 4, Facebook Pixel, and custom events
 */

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";

export interface ECommerceEvent {
  event_name: string;
  event_value?: number;
  currency?: string;
  items?: ECommerceItem[];
  transaction_id?: string;
  affiliation?: string;
  value?: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  user_id?: string;
}

export interface ECommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_brand?: string;
  item_variant?: string;
}

/**
 * Initialize Google Analytics and Facebook Pixel
 */
export function initializeAnalytics() {
  if (typeof window === "undefined") return;

  // Initialize Google Analytics
  if (GA_TRACKING_ID) {
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_TRACKING_ID);
  }

  // Initialize Facebook Pixel
  if (FB_PIXEL_ID) {
    const script2 = document.createElement("script");
    script2.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script2);

    // Create noscript fallback
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "PageView");
  }
}

/**
 * Track product view
 */
export function trackProductView(product: ECommerceItem) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "view_item", {
      items: [product],
      value: product.price,
      currency: "USD",
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_id: product.item_id,
      content_name: product.item_name,
      content_type: "product",
      value: product.price,
      currency: "USD",
    });
  }
}

/**
 * Track add to cart
 */
export function trackAddToCart(items: ECommerceItem[], value: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      items: items,
      value: value,
      currency: "USD",
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: items.map((item) => item.item_id),
      content_name: items.map((item) => item.item_name).join(", "),
      content_type: "product",
      value: value,
      currency: "USD",
    });
  }
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(items: ECommerceItem[], value: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "remove_from_cart", {
      items: items,
      value: value,
      currency: "USD",
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "RemoveFromCart", {
      content_ids: items.map((item) => item.item_id),
      value: value,
      currency: "USD",
    });
  }
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(items: ECommerceItem[], value: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      items: items,
      value: value,
      currency: "USD",
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((item) => item.item_id),
      content_type: "product",
      value: value,
      currency: "USD",
    });
  }
}

/**
 * Track purchase
 */
export function trackPurchase(event: ECommerceEvent) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: event.transaction_id,
      affiliation: event.affiliation,
      value: event.value,
      currency: event.currency || "USD",
      tax: event.tax,
      shipping: event.shipping,
      coupon: event.coupon,
      items: event.items,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: event.items?.map((item) => item.item_id) || [],
      content_type: "product",
      value: event.value,
      currency: event.currency || "USD",
    });
  }
}

/**
 * Track search
 */
export function trackSearch(searchQuery: string, resultsCount?: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "search", {
      search_term: searchQuery,
      results_count: resultsCount,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "Search", {
      search_string: searchQuery,
    });
  }
}

/**
 * Track view cart
 */
export function trackViewCart(items: ECommerceItem[], value: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "view_cart", {
      items: items,
      value: value,
      currency: "USD",
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "ViewCart", {
      value: value,
      currency: "USD",
    });
  }
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", eventName, eventData || {});
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("trackCustom", eventName, eventData || {});
  }
}

/**
 * Track page visit on component mount
 */
export function usePageView(pagePath: string, pageTitle?: string) {
  useEffect(() => {
    trackPageView(pagePath, pageTitle);
  }, [pagePath, pageTitle]);
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      user_id: userId,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("init", FB_PIXEL_ID, {
      em: userId,
    });
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("set", properties);
  }
}
