/**
 * XSS (Cross-Site Scripting) Prevention
 * Sanitizes user input and prevents malicious script injection
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes
 */
export function sanitizeHTML(
  html: string,
  options: DOMPurify.Config = {}
): string {
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ...options,
  };

  return DOMPurify.sanitize(html, defaultConfig);
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];

    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }

    return url;
  } catch {
    // Not a valid URL
    return '';
  }
}

/**
 * Sanitize JSON object for XSS
 */
export function sanitizeJSON(obj: any): any {
  if (typeof obj === 'string') {
    return escapeHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeJSON(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeJSON(value);
    }

    return sanitized;
  }

  return obj;
}

/**
 * React component to safely render HTML
 */
export function SafeHTML({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const sanitized = sanitizeHTML(content);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * Detect potential XSS patterns
 */
export function detectXSSPattern(text: string): boolean {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onload=
    /eval\(/gi,
    /expression\(/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(text));
}

/**
 * Strip HTML tags
 */
export function stripHTMLTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Decode HTML entities
 */
export function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Content Security Policy with nonce for inline scripts
 */
export function generateScriptNonce(): string {
  return Buffer.from(Math.random().toString()).toString('base64').slice(7, 20);
}

/**
 * React hook for script injection prevention
 */
export const useSafeContent = (content: unknown) => {
  if (typeof content === 'string') {
    return sanitizeJSON(content);
  }

  if (typeof content === 'object') {
    return sanitizeJSON(content);
  }

  return content;
};

import React from 'react';
