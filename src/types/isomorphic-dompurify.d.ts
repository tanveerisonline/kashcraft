declare namespace DOMPurify {
  interface Config {
    ADD_TAGS?: string[];
    ADD_ATTR?: string[];
    FORBID_TAGS?: string[];
    FORBID_ATTR?: string[];
    ALLOW_DATA_ATTR?: boolean;
    USE_PROFILES?: {
      html?: boolean;
      svg?: boolean;
      mathMl?: boolean;
    };
    // Add other properties as needed based on DOMPurify's Config interface
    [key: string]: any;
  }

  function sanitize(
    dirty: string | Node,
    config?: Config
  ): string;

  function addHook(
    hook: "beforeSanitizeElements" | "uponSanitizeElement" | "afterSanitizeElements" | "beforeSanitizeAttributes" | "uponSanitizeAttribute" | "afterSanitizeAttributes" | "beforeSanitizeShadowDOM" | "uponSanitizeShadowNode" | "afterSanitizeShadowDOM",
    cb: (currentNode: Node, event: Event, config: Config) => void
  ): void;

  // Add other DOMPurify methods as needed
}

declare module 'isomorphic-dompurify' {
  export default DOMPurify;
}
