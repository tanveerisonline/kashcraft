/**
 * Size Guide Service
 * Manages product-specific size charts, measurements, and conversion guides
 */

import prisma from "@/lib/db/prisma";

export interface SizeGuide {
  id: string;
  productId?: string;
  categoryId?: string;
  name: string;
  measurements: SizeMeasurement[];
  fitDescription?: string;
  conversionCharts?: ConversionChart[];
  images?: string[];
  createdAt: Date;
}

export interface SizeMeasurement {
  size: string;
  chest?: number;
  waist?: number;
  hips?: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  [key: string]: string | number | undefined;
}

export interface ConversionChart {
  from: string;
  to: string;
  conversions: Record<string, string>;
}

/**
 * Size guide service for product fitting
 */
export class SizeGuideService {
  private static instance: SizeGuideService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SizeGuideService {
    if (!SizeGuideService.instance) {
      SizeGuideService.instance = new SizeGuideService();
    }
    return SizeGuideService.instance;
  }

  /**
   * Get size guide for product
   */
  async getSizeGuideForProduct(productId: string): Promise<SizeGuide | null> {
    try {
      // First try product-specific guide
      let guide = await prisma.sizeGuide.findFirst({
        where: { productId },
      });

      if (guide) {
        return this.mapSizeGuide(guide);
      }

      // Fall back to category guide
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true },
      });

      if (product?.categoryId) {
        guide = await prisma.sizeGuide.findFirst({
          where: { categoryId: product.categoryId },
        });
      }

      return guide ? this.mapSizeGuide(guide) : null;
    } catch (error) {
      console.error("Error getting size guide:", error);
      return null;
    }
  }

  /**
   * Create size guide
   */
  async createSizeGuide(
    name: string,
    measurements: SizeMeasurement[],
    categoryId: string,
    productId?: string,
    fitDescription?: string,
    images?: string[]
  ): Promise<SizeGuide> {
    try {
      const guide = await prisma.sizeGuide.create({
        data: {
          name,
          measurements: JSON.stringify(measurements),
          productId,
          categoryId,
          fitDescription,
          fitImages: images ? JSON.stringify(images) : undefined,
        },
      });

      return this.mapSizeGuide(guide);
    } catch (error) {
      console.error("Error creating size guide:", error);
      throw error;
    }
  }

  /**
   * Add conversion chart to guide
   */
  async addConversionChart(
    sizeGuideId: string,
    from: string,
    to: string,
    conversions: Record<string, string>
  ): Promise<void> {
    try {
      const guide = await prisma.sizeGuide.findUnique({
        where: { id: sizeGuideId },
      });

      if (!guide) return;

      const conversionCharts = guide.conversionCharts
        ? JSON.parse(guide.conversionCharts as string)
        : [];

      conversionCharts.push({ from, to, conversions });

      await prisma.sizeGuide.update({
        where: { id: sizeGuideId },
        data: {
          conversionCharts: JSON.stringify(conversionCharts),
        },
      });
    } catch (error) {
      console.error("Error adding conversion chart:", error);
      throw error;
    }
  }

  /**
   * Get size recommendations based on measurements
   */
  async getSizeRecommendation(
    guideId: string,
    measurements: Record<string, number>
  ): Promise<string | null> {
    try {
      const guide = await prisma.sizeGuide.findUnique({
        where: { id: guideId },
      });

      if (!guide) return null;

      const guideMeasurements: SizeMeasurement[] = JSON.parse(guide.measurements as string);

      // Find best matching size
      let bestMatch = guideMeasurements[0];
      let lowestDifference = Infinity;

      for (const sizeMeasurement of guideMeasurements) {
        let difference = 0;

        // Compare measurements
        Object.entries(measurements).forEach(([key, value]) => {
          const guideValue = sizeMeasurement[key];
          if (typeof guideValue === "number") {
            difference += Math.abs(guideValue - value);
          }
        });

        if (difference < lowestDifference) {
          lowestDifference = difference;
          bestMatch = sizeMeasurement;
        }
      }

      return bestMatch.size;
    } catch (error) {
      console.error("Error getting size recommendation:", error);
      return null;
    }
  }

  /**
   * Convert size between systems
   */
  convertSize(size: string, fromSystem: string, toSystem: string): string | null {
    // Standard size conversions
    const conversionMap: Record<string, Record<string, Record<string, string>>> = {
      US: {
        EU: {
          XS: "32",
          S: "34",
          M: "36",
          L: "38",
          XL: "40",
          XXL: "42",
        },
        UK: {
          XS: "4",
          S: "6",
          M: "8",
          L: "10",
          XL: "12",
          XXL: "14",
        },
      },
      EU: {
        US: {
          "32": "XS",
          "34": "S",
          "36": "M",
          "38": "L",
          "40": "XL",
          "42": "XXL",
        },
        UK: {
          "32": "4",
          "34": "6",
          "36": "8",
          "38": "10",
          "40": "12",
          "42": "14",
        },
      },
      UK: {
        US: {
          "4": "XS",
          "6": "S",
          "8": "M",
          "10": "L",
          "12": "XL",
          "14": "XXL",
        },
        EU: {
          "4": "32",
          "6": "34",
          "8": "36",
          "10": "38",
          "12": "40",
          "14": "42",
        },
      },
    };

    return conversionMap[fromSystem]?.[toSystem]?.[size] || null;
  }

  /**
   * Get popular size guides
   */
  async getPopularSizeGuides(limit: number = 10): Promise<SizeGuide[]> {
    try {
      const guides = await prisma.sizeGuide.findMany({
        take: limit,
        include: {
          category: true,
        },
      });

      return guides.map((g) => this.mapSizeGuide(g));
    } catch (error) {
      console.error("Error getting popular guides:", error);
      return [];
    }
  }

  /**
   * Map database guide to SizeGuide interface
   */
  private mapSizeGuide(guide: any): SizeGuide {
    return {
      id: guide.id,
      productId: guide.productId,
      categoryId: guide.categoryId,
      name: guide.name,
      measurements: JSON.parse(guide.measurements || "[]"),
      fitDescription: guide.fitDescription,
      conversionCharts: guide.conversionCharts ? JSON.parse(guide.conversionCharts) : undefined,
      images: guide.images ? JSON.parse(guide.images) : undefined,
      createdAt: guide.createdAt,
    };
  }
}

// Export singleton instance
export const sizeGuideService = SizeGuideService.getInstance();
