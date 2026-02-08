/**
 * GDPR Compliance
 * Data export, data deletion, cookie consent, privacy policy
 */

/**
 * User consent preferences
 */
export interface UserConsent {
  userId: string;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
  necessary: boolean; // Always required
  consentDate: Date;
  consentVersion: string; // Track policy version
}

/**
 * GDPR Data Export
 */
export interface GDPRDataExport {
  userId: string;
  personalData: {
    profile: Record<string, any>;
    addresses: Record<string, any>[];
    orders: Record<string, any>[];
    reviews: Record<string, any>[];
    wishlist: Record<string, any>[];
  };
  systemData: {
    sessions: Record<string, any>[];
    loginHistory: Record<string, any>[];
    analytics: Record<string, any>[];
  };
  exportDate: Date;
  expiresAt: Date; // Data export expires after 30 days
}

/**
 * GDPR Data Deletion Request
 */
export interface GDPRDeletionRequest {
  userId: string;
  reason?: string;
  requestDate: Date;
  completionDate?: Date;
  status: "pending" | "processing" | "completed";
}

/**
 * GDPR Service
 */
export class GDPRService {
  /**
   * Get user's personal data for export
   */
  async exportUserData(userId: string): Promise<GDPRDataExport> {
    // Fetch all user data from database
    const export_: GDPRDataExport = {
      userId,
      personalData: {
        profile: {}, // Fetch from database
        addresses: [],
        orders: [],
        reviews: [],
        wishlist: [],
      },
      systemData: {
        sessions: [],
        loginHistory: [],
        analytics: [],
      },
      exportDate: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    return export_;
  }

  /**
   * Generate data export file (JSON)
   */
  async generateExportFile(userId: string): Promise<Buffer> {
    const data = await this.exportUserData(userId);
    const json = JSON.stringify(data, null, 2);
    return Buffer.from(json, "utf-8");
  }

  /**
   * Request data deletion
   */
  async requestDeletion(userId: string, reason?: string): Promise<GDPRDeletionRequest> {
    const request: GDPRDeletionRequest = {
      userId,
      reason,
      requestDate: new Date(),
      status: "pending",
    };

    // Store deletion request in database
    console.log("GDPR deletion request:", request);

    return request;
  }

  /**
   * Delete user data
   */
  async deleteUserData(userId: string): Promise<void> {
    // Delete from all tables
    console.log(`Deleting user data for userId: ${userId}`);

    // PII Deletion
    // - Delete profile
    // - Delete addresses
    // - Delete payment methods (but keep order history for accounting)
    // - Delete reviews
    // - Delete wishlist
    // - Delete sessions
    // - Delete login history

    // Non-deletable for compliance
    // - Order history (for tax/accounting)
    // - Analytics (anonymized)

    // Update deletion request status
    // UPDATE gdpr_deletion_requests SET status='completed', completionDate=NOW() WHERE userId=$1
  }

  /**
   * Anonymize user data instead of deletion
   */
  async anonymizeUserData(userId: string): Promise<void> {
    console.log(`Anonymizing user data for userId: ${userId}`);

    // Anonymize instead of delete for analytics
    // - Replace name with "Deleted User"
    // - Remove email (but keep for auth)
    // - Remove phone
    // - Remove addresses
    // - Keep order history but anonymize customer info
  }

  /**
   * Clear marketing cookies
   */
  clearMarketingCookies() {
    if (typeof window === "undefined") return;

    const marketingCookies = ["__gat", "_ga", "_gid", "__utma", "__utmb", "__utmc", "__utmz"];

    marketingCookies.forEach((cookie) => {
      document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  }

  /**
   * Clear analytics cookies
   */
  clearAnalyticsCookies() {
    if (typeof window === "undefined") return;

    const analyticsCookies = ["_ta", "_segment"];

    analyticsCookies.forEach((cookie) => {
      document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  }

  /**
   * Check if user consented to tracking
   */
  hasUserConsented(consents: UserConsent, type: "analytics" | "marketing"): boolean {
    return consents[type];
  }
}

/**
 * Cookie Consent Banner
 */
export const cookieConsentConfig = {
  necessary: {
    description: "Necessary for site functionality",
    required: true,
  },
  analytics: {
    description: "Help us understand how you use the site",
    required: false,
  },
  marketing: {
    description: "Show you relevant ads and content",
    required: false,
  },
  thirdParty: {
    description: "Allow third-party services",
    required: false,
  },
};

/**
 * Privacy Policy Content
 */
export const privacyPolicyContent = `
# Privacy Policy

## Data Collection
We collect the following personal data:
- Contact information (name, email, phone)
- Address information for orders
- Payment information (processed securely)
- Usage analytics

## Data Usage
Your data is used for:
- Processing orders
- Improving our service
- Communicating with you
- Legal compliance

## Data Rights
You have the right to:
- Access your data
- Correct your data
- Delete your data (right to be forgotten)
- Transfer your data
- Object to processing

## Data Protection
- We use encryption for sensitive data
- We implement security measures
- We comply with GDPR, CCPA, and other regulations

## Contact
For privacy concerns, email: privacy@example.com
`;

/**
 * React hook for GDPR compliance
 */
export const useGDPRCompliance = () => {
  const [consents, setConsents] = React.useState<UserConsent | null>(null);
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    // Load current consent preferences
    const saved = localStorage.getItem("user-consents");
    if (saved) {
      setConsents(JSON.parse(saved));
      setShowBanner(false);
    }
  }, []);

  const saveConsents = (newConsents: UserConsent) => {
    setConsents(newConsents);
    localStorage.setItem("user-consents", JSON.stringify(newConsents));
    setShowBanner(false);
  };

  const requestDataExport = async () => {
    try {
      const response = await fetch("/api/gdpr/export", { method: "POST" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      a.click();
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const requestDeletion = async () => {
    try {
      await fetch("/api/gdpr/delete", { method: "POST" });
      // Show confirmation
      setShowBanner(true);
    } catch (error) {
      console.error("Failed to request deletion:", error);
    }
  };

  return {
    consents,
    showBanner,
    saveConsents,
    requestDataExport,
    requestDeletion,
  };
};

export const gdprService = new GDPRService();

import React from "react";
