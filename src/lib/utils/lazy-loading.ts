import { ComponentType, ReactNode, Suspense, lazy } from 'react';

// Prompt 137: Lazy Loading Implementation

/**
 * Dynamic import with loading fallback
 */
export const dynamicImport = <T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  fallback: ReactNode = null
): ComponentType<any> => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Intersection Observer based lazy loading
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver | null = null;

  constructor(
    private callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ) {
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: 0,
      ...options,
    };

    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
            // Unobserve after loading
            this.observer?.unobserve(entry.target);
          }
        });
      }, defaultOptions);
    }
  }

  observe(element: Element) {
    this.observer?.observe(element);
  }

  unobserve(element: Element) {
    this.observer?.unobserve(element);
  }

  disconnect() {
    this.observer?.disconnect();
  }
}

/**
 * React hook for lazy loading with Intersection Observer
 */
export const useLazyLoad = (ref: React.RefObject<HTMLElement>, callback?: () => void) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (callback) callback();
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: '50px',
      threshold: 0.1,
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);

  return isVisible;
};

/**
 * Script lazy loader - defer non-critical scripts
 */
export class ScriptLoader {
  static loadScript(src: string, options: ScriptOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer !== false;

      if (options.module) {
        script.type = 'module';
      }

      if (options.noModule) {
        script.noModule = true;
      }

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      document.head.appendChild(script);
    });
  }

  static loadScriptDeferred(src: string, delay: number = 3000) {
    setTimeout(() => {
      this.loadScript(src, { defer: true });
    }, delay);
  }
}

interface ScriptOptions {
  async?: boolean;
  defer?: boolean;
  module?: boolean;
  noModule?: boolean;
}

/**
 * Progressive Image Loading
 */
export const useProgressiveImageLoad = (ref: React.RefObject<HTMLImageElement>) => {
  const [lowQualityLoaded, setLowQualityLoaded] = React.useState(false);
  const [highQualityLoaded, setHighQualityLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const img = ref.current;

    // Load low quality immediately
    const lowResImg = new Image();
    lowResImg.onload = () => setLowQualityLoaded(true);
    lowResImg.src = img.dataset.lowres || '';

    // Load high quality in parallel
    const highResImg = new Image();
    highResImg.onload = () => setHighQualityLoaded(true);
    highResImg.src = img.src;
  }, [ref]);

  return { lowQualityLoaded, highQualityLoaded };
};

/**
 * Component lazy loading with preload
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};

/**
 * Route-based code splitting
 */
export const createDynamicRoutes = () => {
  return {
    // Admin routes
    AdminDashboard: dynamicImport(() => import('@/components/admin/dashboard')),
    AdminProducts: dynamicImport(() => import('@/components/admin/products')),
    AdminOrders: dynamicImport(() => import('@/components/admin/orders')),

    // User routes
    UserProfile: dynamicImport(() => import('@/components/user/profile')),
    UserOrders: dynamicImport(() => import('@/components/user/orders')),
    UserWishlist: dynamicImport(() => import('@/components/user/wishlist')),

    // Checkout routes
    CheckoutCart: dynamicImport(() => import('@/components/checkout/cart')),
    CheckoutForm: dynamicImport(() => import('@/components/checkout/form')),
    CheckoutPayment: dynamicImport(() => import('@/components/checkout/payment')),
  };
};

/**
 * Chunk prefetching
 */
export const prefetchChunks = (chunks: string[]) => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';

  chunks.forEach((chunk) => {
    const prefetchLink = link.cloneNode(true) as HTMLLinkElement;
    prefetchLink.href = `/_next/static/chunks/${chunk}.js`;
    document.head.appendChild(prefetchLink);
  });
};

/**
 * Resource hints for performance
 */
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  const hints = [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://cdn.example.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://api.example.com' },
    { rel: 'prefetch', href: '/_next/static/chunks/main.js' },
  ];

  hints.forEach(({ rel, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (rel === 'preconnect') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

/**
 * Defer non-critical CSS
 */
export const deferCriticalCss = () => {
  if (typeof window === 'undefined') return;

  const nonCritical = document.querySelectorAll('link[data-defer="true"]');
  nonCritical.forEach((link) => {
    const href = link.getAttribute('href');
    if (href) {
      link.setAttribute('media', 'print');
      link.addEventListener('load', () => {
        link.setAttribute('media', 'all');
      });
    }
  });
};
