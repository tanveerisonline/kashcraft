import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService(prisma);

export async function POST(request: Request) {
  try {
    const { eventType, path, productId, orderId, userId, revenue } = await request.json();

    switch (eventType) {
      case 'page_view':
        await analyticsService.trackPageView(path, userId);
        break;
      case 'product_view':
        await analyticsService.trackProductView(productId, userId);
        break;
      case 'add_to_cart':
        await analyticsService.trackAddToCart(productId, userId);
        break;
      case 'purchase':
        await analyticsService.trackPurchase(orderId, userId, revenue);
        break;
      default:
        return NextResponse.json({ message: 'Unknown event type' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Analytics event tracked successfully' });
  } catch (error: any) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
