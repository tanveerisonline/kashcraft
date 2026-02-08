import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kashcraft.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/categories",
          "/about",
          "/contact",
          "/privacy-policy",
          "/terms-of-service",
          "/refund-policy",
          "/shipping-policy",
        ],
        disallow: [
          "/admin",
          "/account",
          "/auth",
          "/api",
          "/search",
          "/*.json$",
          "/*?*sort=",
          "/cart",
          "/checkout",
          "/orders",
        ],
        crawlDelay: 1,
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
