# Analytics Implementation Guide

This guide explains how to use the analytics system integrated into KashCraft.

## Overview

The analytics system supports:

- **Google Analytics 4 (GA4)** - for comprehensive user behavior tracking
- **Facebook Pixel** - for conversion tracking and audience building
- **Custom Events** - for business-specific metrics

## Setup

### 1. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=1234567890

# Application URL
NEXT_PUBLIC_APP_URL=https://kashcraft.com
```

### 2. Initialize Analytics Provider

Wrap your app with the AnalyticsProvider in your root layout:

```tsx
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
```

## Available Events

### Page Views

Automatically tracked on route changes.

### E-Commerce Events

#### Product View

```tsx
import { trackProductView } from "@/lib/analytics";

trackProductView({
  item_id: "123",
  item_name: "Product Name",
  item_category: "Category",
  price: 49.99,
  item_brand: "Brand Name",
});
```

#### Add to Cart

```tsx
import { trackAddToCart } from "@/lib/analytics";

trackAddToCart(
  [
    {
      item_id: "123",
      item_name: "Product Name",
      price: 49.99,
      quantity: 1,
    },
  ],
  49.99 // total value
);
```

#### Remove from Cart

```tsx
import { trackRemoveFromCart } from "@/lib/analytics";

trackRemoveFromCart(cartItems, totalValue);
```

#### View Cart

```tsx
import { trackViewCart } from "@/lib/analytics";

trackViewCart(cartItems, cartTotal);
```

#### Begin Checkout

```tsx
import { trackBeginCheckout } from "@/lib/analytics";

trackBeginCheckout(cartItems, cartTotal);
```

#### Purchase (Conversion)

```tsx
import { trackPurchase } from "@/lib/analytics";

trackPurchase({
  transaction_id: "order-123",
  affiliation: "KashCraft Store",
  value: 199.99,
  currency: "USD",
  tax: 16.0,
  shipping: 10.0,
  coupon: "SAVE10",
  items: [
    {
      item_id: "123",
      item_name: "Product Name",
      price: 49.99,
      quantity: 2,
    },
  ],
});
```

### Search

```tsx
import { trackSearch } from "@/lib/analytics";

trackSearch("search query", resultsCount);
```

### Custom Events

```tsx
import { trackCustomEvent } from "@/lib/analytics";

trackCustomEvent("wishlist_add", {
  product_id: "123",
  product_name: "Product Name",
});
```

## User Tracking

### Set User ID

```tsx
import { setUserId } from "@/lib/analytics";

// Call after user logs in
setUserId(userId);
```

### Set User Properties

```tsx
import { setUserProperties } from "@/lib/analytics";

setUserProperties({
  user_type: "premium",
  country: "US",
  language: "en",
});
```

## Best Practices

1. **Track Conversions**: Always track purchase events with complete transaction data
2. **Consistent Naming**: Use consistent event and parameter names across the app
3. **Privacy**: Respect user privacy and comply with GDPR/CCPA
4. **Testing**: Test analytics in development using GA4 and Facebook Pixel debuggers
5. **UTM Parameters**: Use UTM parameters in marketing links for better attribution
6. **Custom Dashboards**: Create custom dashboards in GA4 and Facebook for key metrics

## Debugging

### Google Analytics Debug Mode

Use the Google Analytics Debugger Chrome extension to monitor events in real-time.

### Facebook Pixel Debug Mode

Use the Facebook Pixel Helper Chrome extension to verify events are firing correctly.

## Dashboard Setup

### Google Analytics 4 Dashboards

Create dashboards for:

- E-commerce conversion funnel
- Product performance
- User acquisition sources
- Cart abandonment metrics

### Facebook Ads Manager

Use pixel data for:

- Custom audiences based on behavior
- Conversion tracking for ads
- Lookalike audiences
- ROAS optimization

## Support

For issues or questions about analytics implementation:

- Check GA4 documentation: https://support.google.com/analytics
- Check Facebook Pixel docs: https://developers.facebook.com/docs/facebook-pixel
- Review event implementation in specific components
