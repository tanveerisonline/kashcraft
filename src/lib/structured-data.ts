/**
 * Structured Data (JSON-LD) utilities for SEO
 * Generates schema.org compatible JSON-LD markup for various entities
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kashcraft.com";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  sku?: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

/**
 * Generate schema for organizational data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KashCraft",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Premium handcrafted products with authentic artisan quality",
    sameAs: [
      "https://www.facebook.com/kashcraft",
      "https://www.instagram.com/kashcraft",
      "https://www.twitter.com/kashcraft",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Craft Lane",
      addressLocality: "Artisan City",
      addressRegion: "AC",
      postalCode: "12345",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: "+1-800-KASHCRAFT",
      email: "support@kashcraft.com",
      availableLanguage: ["en"],
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
      timeZone: "America/New_York",
    },
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate product schema
 */
export function generateProductSchema(product: Product, reviews?: Review[]) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${baseUrl}/products/${product.id}`,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability:
        product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  if (product.originalPrice && product.originalPrice > product.price) {
    schema.offers.priceCurrency = "USD";
    schema.offers.price = product.price.toFixed(2);
  }

  if (product.rating !== undefined && product.reviewCount !== undefined) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
    };
  }

  if (reviews && reviews.length > 0) {
    schema.review = reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.text,
    }));
  }

  return schema;
}

/**
 * Generate product collection schema
 */
export function generateCollectionSchema(name: string, items: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: name,
    url: `${baseUrl}/categories/${name.toLowerCase().replace(/\s+/g, "-")}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/products/${item.id}`,
        name: item.name,
        image: item.image,
      })),
    },
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate local business schema
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "KashCraft",
    image: `${baseUrl}/logo.png`,
    telephone: "+1-800-KASHCRAFT",
    email: "support@kashcraft.com",
    url: baseUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Craft Lane",
      addressLocality: "Artisan City",
      addressRegion: "AC",
      postalCode: "12345",
      addressCountry: "US",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
      timeZone: "America/New_York",
    },
    priceRange: "$$",
  };
}

/**
 * Generate e-commerce business schema
 */
export function generateECommerceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KashCraft",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    description: "Premium handcrafted products with authentic artisan quality",
  };
}

/**
 * Generate review schema
 */
export function generateReviewSchema(
  productName: string,
  author: string,
  rating: number,
  text: string,
  date: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: productName,
    },
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished: date,
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: text,
  };
}
