import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report/report.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const reportService = new ReportService(prisma);

export async function POST(request: Request) {
  try {
    const { startDate, endDate, format } = await request.json();

    if (!startDate || !endDate || !format) {
      return NextResponse.json({ message: 'Missing startDate, endDate, or format' }, { status: 400 });
    }

    const salesReport = await reportService.generateSalesReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    let content: string | Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        // Generate CSV content
        const csvRows = [
          "Metric,Value",
          `Total Revenue,${salesReport.totalRevenue}`,
          `Total Orders,${salesReport.totalOrders}`,
          `Average Order Value,${salesReport.averageOrderValue}`,
          "\nTop Selling Products",
          "Product ID,Product Name,Quantity Sold,Revenue",
          ...salesReport.topSellingProducts.map(p => `${p.productId},"${p.productName}",${p.quantitySold},${p.revenue}`)
        ];
        content = csvRows.join('\n');
        contentType = 'text/csv';
        filename = 'sales_report.csv';
        break;
      case 'pdf':
        // Placeholder for PDF generation
        content = 'PDF generation not yet implemented.';
        contentType = 'application/pdf';
        filename = 'sales_report.pdf';
        return NextResponse.json({ message: 'PDF export is not yet implemented.' }, { status: 501 });
      default:
        return NextResponse.json({ message: 'Unsupported format' }, { status: 400 });
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating sales report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
