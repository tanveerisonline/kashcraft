/**
 * Product Comparison Service
 * Allows side-by-side comparison of up to 4 products with highlighted differences
 */

import { prisma } from "@/lib/db/prisma";

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  sku: string;
  category: string;
  [key: string]: any;
}

export interface ProductComparison {
  products: ComparisonProduct[];
  specs: ComparisonSpec[];
  differences: string[];
  timestamp: Date;
}

export interface ComparisonSpec {
  key: string;
  label: string;
  values: (string | number | null)[];
  highlighted?: boolean;
}

/**
 * Product comparison service
 */
export class ProductComparisonService {
  private static instance: ProductComparisonService;

  // Comparison-worthy attributes
  private comparisonAttributes = [
    "price",
    "weight",
    "dimensions",
    "color",
    "material",
    "warranty",
    "return_policy",
    "shipping",
    "stock",
    "rating",
    "reviews_count",
  ];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ProductComparisonService {
    if (!ProductComparisonService.instance) {
      ProductComparisonService.instance = new ProductComparisonService();
    }
    return ProductComparisonService.instance;
  }

  /**
   * Compare up to 4 products
   */
  async compareProducts(productIds: string[]): Promise<ProductComparison> {
    try {
      // Limit to 4 products
      const ids = productIds.slice(0, 4);

      // Fetch products
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: {
          category: { select: { name: true } },
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
        },
      });

      if (products.length === 0) {
        return {
          products: [],
          specs: [],
          differences: [],
          timestamp: new Date(),
        };
      }

      // Map to comparison format
      const comparisonProducts: ComparisonProduct[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image || "",
        rating: p.averageRating,
        description: p.description || "",
        sku: p.sku || "",
        category: p.category?.name || "",
        weight: p.weight,
        dimensions: p.dimensions,
        color: p.color,
        material: p.material,
        warranty: p.warranty,
        inStock: (p.inventory?.quantity || 0) > 0,
      }));

      // Extract specs for comparison
      const specs = this.extractComparisonSpecs(comparisonProducts);

      // Identify differences
      const differences = this.identifyDifferences(specs);

      return {
        products: comparisonProducts,
        specs,
        differences,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error comparing products:", error);
      return {
        products: [],
        specs: [],
        differences: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate comparison HTML for sharing/printing
   */
  generateComparisonHTML(comparison: ProductComparison): string {
    const productCols = comparison.products.map((p) => `<th>${p.name}</th>`).join("");

    const specRows = comparison.specs
      .map((spec) => {
        const cells = spec.values
          .map((val, idx) => {
            const isHighlighted = spec.highlighted && this.isDifferent(spec.values);
            const bgColor = isHighlighted ? "#fff3cd" : "";
            return `<td style="background-color: ${bgColor}">${val || "N/A"}</td>`;
          })
          .join("");

        return `
          <tr>
            <td><strong>${spec.label}</strong></td>
            ${cells}
          </tr>
        `;
      })
      .join("");

    return `
      <html>
        <head>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .highlighted { font-weight: bold; color: #d9534f; }
          </style>
        </head>
        <body>
          <h1>Product Comparison</h1>
          <table>
            <tr>
              <th>Specification</th>
              ${productCols}
            </tr>
            ${specRows}
          </table>
          <h2>Key Differences</h2>
          <ul>
            ${comparison.differences.map((d) => `<li>${d}</li>`).join("")}
          </ul>
        </body>
      </html>
    `;
  }

  /**
   * Generate comparison CSV
   */
  generateComparisonCSV(comparison: ProductComparison): string {
    const headers = ["Specification", ...comparison.products.map((p) => p.name)].join(",");

    const rows = comparison.specs
      .map((spec) => {
        const cells = [spec.label, ...spec.values].map((v) =>
          `"${v || "N/A"}"`.replace(/"/g, '""')
        );
        return cells.join(",");
      })
      .join("\n");

    return `${headers}\n${rows}`;
  }

  /**
   * Save comparison for later
   */
  async saveComparison(
    userId: string,
    name: string,
    productIds: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      const comparison = await prisma.savedComparison.create({
        data: {
          userId,
          name,
          productIds: JSON.stringify(productIds),
        },
      });

      return {
        id: comparison.id,
        url: `/compare/${comparison.id}`,
      };
    } catch (error) {
      console.error("Error saving comparison:", error);
      throw error;
    }
  }

  /**
   * Get saved comparison
   */
  async getSavedComparison(comparisonId: string): Promise<ProductComparison | null> {
    try {
      const saved = await prisma.savedComparison.findUnique({
        where: { id: comparisonId },
      });

      if (!saved) return null;

      const productIds = JSON.parse(saved.productIds);
      return this.compareProducts(productIds);
    } catch (error) {
      console.error("Error getting saved comparison:", error);
      return null;
    }
  }

  /**
   * Get user's saved comparisons
   */
  async getUserSavedComparisons(userId: string): Promise<any[]> {
    try {
      return await prisma.savedComparison.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error getting saved comparisons:", error);
      return [];
    }
  }

  /**
   * Delete saved comparison
   */
  async deleteSavedComparison(comparisonId: string): Promise<boolean> {
    try {
      await prisma.savedComparison.delete({
        where: { id: comparisonId },
      });
      return true;
    } catch (error) {
      console.error("Error deleting comparison:", error);
      return false;
    }
  }

  /**
   * Extract comparison specs from products
   */
  private extractComparisonSpecs(products: ComparisonProduct[]): ComparisonSpec[] {
    const specs: ComparisonSpec[] = [];
    const specKeys: Set<string> = new Set();

    // Collect all specification keys
    products.forEach((p) => {
      Object.keys(p).forEach((key) => {
        if (!["id", "name", "image", "description"].includes(key)) {
          specKeys.add(key);
        }
      });
    });

    // Create spec objects
    const specLabels: Record<string, string> = {
      price: "Price",
      rating: "Rating",
      weight: "Weight",
      dimensions: "Dimensions",
      color: "Color",
      material: "Material",
      warranty: "Warranty",
      inStock: "Stock Status",
      category: "Category",
      sku: "SKU",
    };

    specKeys.forEach((key) => {
      const values = products.map((p) => p[key]);
      const isDifferent = this.isDifferent(values);

      specs.push({
        key,
        label: specLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
        values,
        highlighted: isDifferent,
      });
    });

    return specs.sort((a, b) => {
      // Show price first
      if (a.key === "price") return -1;
      if (b.key === "price") return 1;
      // Show differences first
      if (a.highlighted && !b.highlighted) return -1;
      if (!a.highlighted && b.highlighted) return 1;
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Identify key differences between products
   */
  private identifyDifferences(specs: ComparisonSpec[]): string[] {
    const differences: string[] = [];

    specs.forEach((spec) => {
      if (!spec.highlighted) return;

      const uniqueValues = [...new Set(spec.values.map((v) => String(v)))];

      if (uniqueValues.length > 1) {
        if (spec.key === "price") {
          const prices = spec.values.filter((v) => v !== null) as number[];
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          differences.push(`Price varies by $${(max - min).toFixed(2)}`);
        } else if (spec.key === "rating") {
          differences.push("Rating scores differ");
        } else {
          differences.push(`${spec.label}: ${uniqueValues.join(" vs ")}`);
        }
      }
    });

    return differences;
  }

  /**
   * Check if values are different
   */
  private isDifferent(values: any[]): boolean {
    const uniqueValues = new Set(values.map((v) => JSON.stringify(v)));
    return uniqueValues.size > 1 && !uniqueValues.has("null");
  }
}

// Export singleton instance
export const productComparisonService = ProductComparisonService.getInstance();
