import { NextResponse } from "next/server";

// This is a sample RSS feed implementation
// In production, you should fetch actual products from your database

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kashcraft.com";

  try {
    // In a real application, fetch products from your database
    // const products = await getLatestProducts({ limit: 20 });

    // For now, we'll create a template with sample data
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:image="http://purl.org/rss/1.0/modules/image/">
  <channel>
    <title>KashCraft - Latest Products</title>
    <link>${baseUrl}</link>
    <description>Discover the latest handcrafted products from KashCraft</description>
    <language>en-us</language>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>KashCraft</title>
      <link>${baseUrl}</link>
    </image>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
    <!-- Sample product entries - replace with actual products from database -->
    <item>
      <title>Artisan Handwoven Basket</title>
      <link>${baseUrl}/products/1</link>
      <guid isPermaLink="true">${baseUrl}/products/1</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Home Decor</category>
      <description>Beautiful handwoven basket crafted with traditional techniques</description>
      <content:encoded><![CDATA[
        <p>Beautiful handwoven basket crafted with traditional techniques</p>
        <p>Price: $49.99</p>
        <img src="${baseUrl}/images/product-1.jpg" alt="Artisan Handwoven Basket" />
      ]]></content:encoded>
    </item>

    <item>
      <title>Premium Leather Journal</title>
      <link>${baseUrl}/products/2</link>
      <guid isPermaLink="true">${baseUrl}/products/2</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Accessories</category>
      <description>Premium handcrafted leather journal for your thoughts and ideas</description>
      <content:encoded><![CDATA[
        <p>Premium handcrafted leather journal for your thoughts and ideas</p>
        <p>Price: $39.99</p>
        <img src="${baseUrl}/images/product-2.jpg" alt="Premium Leather Journal" />
      ]]></content:encoded>
    </item>

    <item>
      <title>Silk Scarves Collection</title>
      <link>${baseUrl}/products/3</link>
      <guid isPermaLink="true">${baseUrl}/products/3</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Clothing</category>
      <description>Elegant silk scarves hand-dyed with natural colors</description>
      <content:encoded><![CDATA[
        <p>Elegant silk scarves hand-dyed with natural colors</p>
        <p>Price: $59.99</p>
        <img src="${baseUrl}/images/product-3.jpg" alt="Silk Scarves Collection" />
      ]]></content:encoded>
    </item>

    <item>
      <title>Wooden Jewelry Box</title>
      <link>${baseUrl}/products/4</link>
      <guid isPermaLink="true">${baseUrl}/products/4</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Home Decor</category>
      <description>Handcrafted wooden jewelry box with intricate designs</description>
      <content:encoded><![CDATA[
        <p>Handcrafted wooden jewelry box with intricate designs</p>
        <p>Price: $79.99</p>
        <img src="${baseUrl}/images/product-4.jpg" alt="Wooden Jewelry Box" />
      ]]></content:encoded>
    </item>

    <item>
      <title>Ceramic Dinnerware Set</title>
      <link>${baseUrl}/products/5</link>
      <guid isPermaLink="true">${baseUrl}/products/5</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Home Decor</category>
      <description>Handpainted ceramic dishes for the perfect dining experience</description>
      <content:encoded><![CDATA[
        <p>Handpainted ceramic dishes for the perfect dining experience</p>
        <p>Price: $99.99</p>
        <img src="${baseUrl}/images/product-5.jpg" alt="Ceramic Dinnerware Set" />
      ]]></content:encoded>
    </item>
  </channel>
</rss>`;

    return new NextResponse(rssContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
