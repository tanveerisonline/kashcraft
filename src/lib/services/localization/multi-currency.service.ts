/**
 * Multi-Currency Support Service
 * Handles currency conversion, user location detection, and price localization
 */

import { EventEmitter } from "events";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
  lastUpdated: Date;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

/**
 * Multi-currency service with real-time conversion
 */
export class MultiCurrencyService extends EventEmitter {
  private static instance: MultiCurrencyService;

  private currencies: Map<string, Currency> = new Map([
    [
      "USD",
      {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        exchangeRate: 1,
        lastUpdated: new Date(),
      },
    ],
    [
      "EUR",
      {
        code: "EUR",
        symbol: "€",
        name: "Euro",
        exchangeRate: 0.92,
        lastUpdated: new Date(),
      },
    ],
    [
      "GBP",
      {
        code: "GBP",
        symbol: "£",
        name: "British Pound",
        exchangeRate: 0.79,
        lastUpdated: new Date(),
      },
    ],
    [
      "JPY",
      {
        code: "JPY",
        symbol: "¥",
        name: "Japanese Yen",
        exchangeRate: 149.5,
        lastUpdated: new Date(),
      },
    ],
    [
      "CAD",
      {
        code: "CAD",
        symbol: "C$",
        name: "Canadian Dollar",
        exchangeRate: 1.36,
        lastUpdated: new Date(),
      },
    ],
    [
      "AUD",
      {
        code: "AUD",
        symbol: "A$",
        name: "Australian Dollar",
        exchangeRate: 1.52,
        lastUpdated: new Date(),
      },
    ],
    [
      "CHF",
      {
        code: "CHF",
        symbol: "CHF",
        name: "Swiss Franc",
        exchangeRate: 0.88,
        lastUpdated: new Date(),
      },
    ],
    [
      "CNY",
      {
        code: "CNY",
        symbol: "¥",
        name: "Chinese Yuan",
        exchangeRate: 7.24,
        lastUpdated: new Date(),
      },
    ],
    [
      "INR",
      {
        code: "INR",
        symbol: "₹",
        name: "Indian Rupee",
        exchangeRate: 83.12,
        lastUpdated: new Date(),
      },
    ],
  ]);

  // Country to currency mapping
  private countryToCurrency: Map<string, string> = new Map([
    ["US", "USD"],
    ["GB", "GBP"],
    ["CA", "CAD"],
    ["AU", "AUD"],
    ["JP", "JPY"],
    ["CN", "CNY"],
    ["IN", "INR"],
    ["DE", "EUR"],
    ["FR", "EUR"],
    ["CH", "CHF"],
  ]);

  private constructor() {
    super();
    this.startCurrencyUpdater();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MultiCurrencyService {
    if (!MultiCurrencyService.instance) {
      MultiCurrencyService.instance = new MultiCurrencyService();
    }
    return MultiCurrencyService.instance;
  }

  /**
   * Get all supported currencies
   */
  getCurrencies(): Currency[] {
    return Array.from(this.currencies.values());
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | undefined {
    return this.currencies.get(code.toUpperCase());
  }

  /**
   * Convert amount between currencies
   */
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): CurrencyConversion | null {
    try {
      const from = this.currencies.get(fromCurrency.toUpperCase());
      const to = this.currencies.get(toCurrency.toUpperCase());

      if (!from || !to) {
        return null;
      }

      // Convert to base (USD) then to target
      const amountInUSD = amount / from.exchangeRate;
      const convertedAmount = amountInUSD * to.exchangeRate;
      const rate = to.exchangeRate / from.exchangeRate;

      return {
        from: from.code,
        to: to.code,
        amount,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        rate: Math.round(rate * 10000) / 10000,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error converting currency:", error);
      return null;
    }
  }

  /**
   * Format price for currency
   */
  formatPrice(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return `${amount.toFixed(2)}`;

    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Position symbol based on currency
    if (["JPY", "CNY", "INR"].includes(currencyCode)) {
      return `${currency.symbol}${formatted}`;
    } else if (["GBP", "EUR"].includes(currencyCode)) {
      return `${currency.symbol}${formatted}`;
    } else {
      return `${currency.symbol}${formatted}`;
    }
  }

  /**
   * Detect user currency from IP or locale
   */
  async detectUserCurrency(ipAddress?: string, acceptLanguage?: string): Promise<string> {
    try {
      // Try to detect from Accept-Language header first
      if (acceptLanguage) {
        const locale = acceptLanguage.split(",")[0].split("-")[1]?.toUpperCase();
        if (locale && this.countryToCurrency.has(locale)) {
          return this.countryToCurrency.get(locale) || "USD";
        }
      }

      // Try IP geo-location (simplified - would use real API in production)
      if (ipAddress) {
        const currency = await this.lookupCurrencyByIP(ipAddress);
        if (currency) return currency;
      }

      // Fall back to USD
      return "USD";
    } catch (error) {
      console.error("Error detecting currency:", error);
      return "USD";
    }
  }

  /**
   * Get exchange rates for a currency
   */
  getExchangeRates(baseCurrency: string = "USD"): Record<string, number> {
    const base = this.currencies.get(baseCurrency.toUpperCase());
    if (!base) return {};

    const rates: Record<string, number> = {};

    this.currencies.forEach((currency) => {
      rates[currency.code] = currency.exchangeRate / base.exchangeRate;
    });

    return rates;
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates(): Promise<void> {
    try {
      // In production, use a real API like:
      // - OpenExchangeRates
      // - Fixer.io
      // - Alpha Vantage
      // - ECB (European Central Bank)

      const apiUrl = `https://open.er-api.com/v6/latest/USD`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.rates) {
        const timestamp = new Date();

        Object.entries(data.rates).forEach(([code, rate]: [string, any]) => {
          if (this.currencies.has(code)) {
            const currency = this.currencies.get(code)!;
            currency.exchangeRate = rate;
            currency.lastUpdated = timestamp;
            this.currencies.set(code, currency);
          }
        });

        this.emit("rates-updated", { timestamp });
      }
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    }
  }

  /**
   * Add supported currency
   */
  addCurrency(code: string, symbol: string, name: string, exchangeRate: number): void {
    this.currencies.set(code, {
      code,
      symbol,
      name,
      exchangeRate,
      lastUpdated: new Date(),
    });
  }

  /**
   * Handle currency for product listings
   */
  getPriceInCurrency(
    basePriceUSD: number,
    targetCurrency: string
  ): { price: number; formatted: string } {
    const conversion = this.convertCurrency(basePriceUSD, "USD", targetCurrency);

    if (!conversion) {
      return {
        price: basePriceUSD,
        formatted: this.formatPrice(basePriceUSD, "USD"),
      };
    }

    return {
      price: conversion.convertedAmount,
      formatted: this.formatPrice(conversion.convertedAmount, targetCurrency),
    };
  }

  /**
   * Get conversion fee (if applicable)
   */
  getConversionFee(amount: number, fromCurrency: string, toCurrency: string): number {
    // Some providers charge a fee for conversion
    const baseFeePercentage = process.env.CURRENCY_CONVERSION_FEE || "0.02"; // 2% default
    const feePercentage = parseFloat(baseFeePercentage);

    const conversion = this.convertCurrency(amount, fromCurrency, toCurrency);
    if (!conversion) return 0;

    return Math.round(conversion.convertedAmount * feePercentage * 100) / 100;
  }

  /**
   * Lookup currency by IP address
   */
  private async lookupCurrencyByIP(ipAddress: string): Promise<string | null> {
    try {
      // In production, use a real IP geolocation API
      // Examples: MaxMind, ip-api.com, ipgeolocation.io
      const response = await fetch(`https://ip-api.com/json/${ipAddress}`);
      const data = await response.json();

      if (data.countryCode) {
        return this.countryToCurrency.get(data.countryCode) || null;
      }

      return null;
    } catch (error) {
      console.error("Error looking up IP:", error);
      return null;
    }
  }

  /**
   * Start periodic currency rate updater
   */
  private startCurrencyUpdater(): void {
    // Update exchange rates every hour
    setInterval(
      () => {
        this.updateExchangeRates();
      },
      60 * 60 * 1000
    );

    // Initial update
    this.updateExchangeRates();
  }

  /**
   * Get currency statistics
   */
  getCurrencyStats(): any {
    const currencies = Array.from(this.currencies.values());

    return {
      totalSupported: currencies.length,
      currencies: currencies.map((c) => ({
        code: c.code,
        name: c.name,
        exchangeRate: c.exchangeRate,
        lastUpdated: c.lastUpdated,
      })),
      lastUpdated: Math.max(...currencies.map((c) => c.lastUpdated.getTime())),
    };
  }
}

// Export singleton instance
export const multiCurrencyService = MultiCurrencyService.getInstance();
