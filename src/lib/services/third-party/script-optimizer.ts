/**
 * Third-Party Script Optimization
 * Implements: deferred loading, async loading, intelligent preloading
 */

import React from 'react';
import Script from 'next/script';

interface ThirdPartyScriptConfig {
  id: string;
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  async?: boolean;
  defer?: boolean;
  module?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  waitForInteraction?: boolean;
  minimumDelay?: number;
}

/**
 * Third Party Script Manager
 */
export class ThirdPartyScriptManager {
  private scripts: Map<string, ThirdPartyScriptConfig> = new Map();
  private loadedScripts: Set<string> = new Set();
  private observedInteractions = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupInteractionObserver();
    }
  }

  /**
   * Register a third-party script configuration
   */
  registerScript(config: ThirdPartyScriptConfig) {
    this.scripts.set(config.id, config);
  }

  /**
   * Load a script with optimized strategy
   */
  loadScript(id: string) {
    const config = this.scripts.get(id);
    if (!config || this.loadedScripts.has(id)) {
      return;
    }

    if (config.waitForInteraction && !this.observedInteractions) {
      this.waitForInteraction(() => {
        this.injectScript(config);
      });
    } else {
      if (config.minimumDelay) {
        setTimeout(() => this.injectScript(config), config.minimumDelay);
      } else {
        this.injectScript(config);
      }
    }
  }

  /**
   * Inject script into DOM
   */
  private injectScript(config: ThirdPartyScriptConfig) {
    if (this.loadedScripts.has(config.id)) {
      return;
    }

    const script = document.createElement('script');
    script.id = config.id;
    script.src = config.src;

    if (config.async !== false) {
      script.async = true;
    }
    if (config.defer !== false) {
      script.defer = true;
    }
    if (config.module) {
      script.type = 'module';
    }

    if (config.onLoad) {
      script.onload = config.onLoad;
    }
    if (config.onError) {
      script.onerror = config.onError;
    }

    document.head.appendChild(script);
    this.loadedScripts.add(config.id);
  }

  /**
   * Setup interaction observer to load scripts on user interaction
   */
  private setupInteractionObserver() {
    const interactionEvents = ['click', 'scroll', 'mousemove', 'touchstart', 'keydown'];

    const handleInteraction = () => {
      this.observedInteractions = true;
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleInteraction, true);
      });
    };

    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleInteraction, true);
    });
  }

  /**
   * Wait for user interaction
   */
  private waitForInteraction(callback: () => void) {
    if (this.observedInteractions) {
      callback();
      return;
    }

    const handleInteraction = () => {
      callback();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleInteraction);
  }

  /**
   * Preload script without executing
   */
  preloadScript(src: string, id: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    link.id = `preload-${id}`;
    document.head.appendChild(link);
  }

  /**
   * Get all registered scripts
   */
  getScripts() {
    return Array.from(this.scripts.values());
  }

  /**
   * Get loaded scripts
   */
  getLoadedScripts() {
    return Array.from(this.loadedScripts);
  }
}

/**
 * Optimize Google Analytics loading
 */
export const optimizedGoogleAnalytics = {
  id: 'google-analytics',
  src: 'https://googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
  strategy: 'lazyOnload' as const,
  waitForInteraction: true,
  minimumDelay: 2000,
  onLoad: () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  },
};

/**
 * Optimize Segment loading
 */
export const optimizedSegment = {
  id: 'segment',
  src: 'https://cdn.segment.com/analytics.js/v1/WRITE_KEY/analytics.min.js',
  strategy: 'lazyOnload' as const,
  waitForInteraction: true,
  minimumDelay: 3000,
  onLoad: () => {
    if (window.analytics) {
      window.analytics.track('script_loaded', {
        timestamp: new Date().toISOString(),
      });
    }
  },
};

/**
 * Optimize Mixpanel loading
 */
export const optimizedMixpanel = {
  id: 'mixpanel',
  src: 'https://cdn.mxpnl.com/libs/mixpanel-2/mixpanel.min.js',
  strategy: 'lazyOnload' as const,
  waitForInteraction: true,
  minimumDelay: 3000,
};

/**
 * Optimize Hotjar loading
 */
export const optimizedHotjar = {
  id: 'hotjar',
  src: 'https://script.hotjar.com/modules.js',
  strategy: 'lazyOnload' as const,
  waitForInteraction: true,
  minimumDelay: 5000,
};

/**
 * Optimize Intercom loading
 */
export const optimizedIntercom = {
  id: 'intercom',
  src: 'https://widget.intercom.io/widget/APP_ID',
  strategy: 'lazyOnload' as const,
  waitForInteraction: true,
  minimumDelay: 4000,
};

/**
 * React component for optimized third-party scripts
 */
export const OptimizedThirdPartyScripts: React.FC = () => {
  React.useEffect(() => {
    const manager = new ThirdPartyScriptManager();

    // Register scripts
    manager.registerScript(optimizedGoogleAnalytics);
    manager.registerScript(optimizedSegment);
    manager.registerScript(optimizedMixpanel);
    manager.registerScript(optimizedHotjar);
    manager.registerScript(optimizedIntercom);

    // Load scripts with optimized strategy
    Object.values([
      optimizedGoogleAnalytics,
      optimizedSegment,
      optimizedMixpanel,
      optimizedHotjar,
      optimizedIntercom,
    ]).forEach((config) => {
      manager.loadScript(config.id);
    });
  }, []);

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `,
        }}
      />

      {/* Preload critical resources */}
      <link
        rel="preload"
        as="script"
        href="https://cdn.example.com/critical-lib.js"
      />
      <link
        rel="prefetch"
        as="script"
        href="https://cdn.example.com/non-critical.js"
      />
      <link rel="dns-prefetch" href="https://cdn.example.com" />
      <link rel="preconnect" href="https://cdn.example.com" />
    </>
  );
};

/**
 * Hook for lazy loading third-party widgets
 */
export const useThirdPartyWidget = (config: ThirdPartyScriptConfig) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const manager = new ThirdPartyScriptManager();
    manager.registerScript({
      ...config,
      onLoad: () => {
        setIsLoaded(true);
        config.onLoad?.();
      },
    });

    manager.loadScript(config.id);
  }, [config]);

  return isLoaded;
};

/**
 * Script preloader with timing control
 */
export class ScriptPreloader {
  static preloadCritical() {
    const criticalScripts = [
      'https://cdn.example.com/critical-lib.js',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ];

    criticalScripts.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  static prefetchNonCritical() {
    const nonCritical = [
      'https://cdn.example.com/analytics.js',
      'https://cdn.example.com/tracking.js',
    ];

    nonCritical.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  static precacheChunks(chunks: string[]) {
    chunks.forEach((chunk) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = chunk;
      document.head.appendChild(link);
    });
  }
}

/**
 * Detect and manage heavy third-party scripts
 */
export const HeavyScriptDetector = {
  /**
   * Get estimated size of script
   */
  getScriptSize: async (src: string): Promise<number> => {
    try {
      const response = await fetch(src, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      return size ? parseInt(size) : 0;
    } catch (error) {
      console.warn(`Failed to get size for ${src}:`, error);
      return 0;
    }
  },

  /**
   * Warn if script is too large
   */
  warnIfLarge: async (src: string, maxSize: number = 100000) => {
    const size = await HeavyScriptDetector.getScriptSize(src);
    if (size > maxSize) {
      console.warn(
        `Script ${src} is ${(size / 1024).toFixed(2)}KB (threshold: ${(
          maxSize / 1024
        ).toFixed(2)}KB)`
      );
    }
  },

  /**
   * Defer heavy scripts
   */
  deferHeavyScript: (config: ThirdPartyScriptConfig) => {
    return {
      ...config,
      strategy: 'lazyOnload' as const,
      minimumDelay: 5000,
    };
  },
};
