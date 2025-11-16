import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductViewsReport() {
    const views = await this.prisma.productView.groupBy({
      by: ['product_id'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 50,
    });

    const productIds = views.map((v) => v.product_id);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return views.map((view) => ({
      product_id: view.product_id,
      product_name: productMap.get(view.product_id)?.name || 'N/A',
      brand: productMap.get(view.product_id)?.brand || 'N/A',
      category: productMap.get(view.product_id)?.category?.name || 'N/A',
      total_views: view._count.id,
    }));
  }

  async getVirtualTryOnSessionsReport() {
    const sessions = await this.prisma.virtualTryOnSession.groupBy({
      by: ['product_id'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 50,
    });

    const productIds = sessions.map((s) => s.product_id);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return sessions.map((session) => ({
      product_id: session.product_id,
      product_name: productMap.get(session.product_id)?.name || 'N/A',
      brand: productMap.get(session.product_id)?.brand || 'N/A',
      category: productMap.get(session.product_id)?.category?.name || 'N/A',
      try_on_count: session._count.id,
    }));
  }

  async getProductMovementsReport() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        views: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
        tryOnSessions: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 100,
    });

    return products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      brand: product.brand || 'N/A',
      category: product.category.name,
      stock_quantity: product.stock_quantity,
      price: product.price.toString(),
      last_view: product.views[0]?.created_at || null,
      last_try_on: product.tryOnSessions[0]?.created_at || null,
      updated_at: product.updated_at,
    }));
  }

  async generatePDFReport(reportType: string): Promise<Buffer> {
    let data: any[];
    let title: string;

    switch (reportType) {
      case 'product-views':
        data = await this.getProductViewsReport();
        title = 'Reporte de Productos Más Visualizados';
        break;
      case 'virtual-try-on':
        data = await this.getVirtualTryOnSessionsReport();
        title = 'Reporte de Pruebas Virtuales';
        break;
      case 'product-movements':
        data = await this.getProductMovementsReport();
        title = 'Reporte de Movimientos de Productos';
        break;
      default:
        throw new Error('Tipo de reporte no válido');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Título
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      // Fecha de generación
      doc.fontSize(10).text(`Generado el: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
      doc.moveDown(2);

      // Tabla
      let y = doc.y;
      const rowHeight = 20;
      const pageWidth = doc.page.width;
      const margin = 50;
      const tableWidth = pageWidth - 2 * margin;

      // Encabezados
      const headers = Object.keys(data[0] || {});
      const colWidth = tableWidth / headers.length;

      doc.fontSize(12).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header.replace(/_/g, ' ').toUpperCase(), margin + i * colWidth, y, {
          width: colWidth,
          align: 'left',
        });
      });

      y += rowHeight;
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();

      // Datos
      doc.fontSize(10).font('Helvetica');
      data.forEach((row, index) => {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }

        headers.forEach((header, i) => {
          const value = String(row[header] || '');
          doc.text(value.substring(0, 30), margin + i * colWidth, y, {
            width: colWidth,
            align: 'left',
          });
        });

        y += rowHeight;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
      });

      doc.end();
    });
  }

  async generateCSVReport(reportType: string): Promise<string> {
    let data: any[];
    let filename: string;

    switch (reportType) {
      case 'product-views':
        data = await this.getProductViewsReport();
        filename = 'productos_mas_visualizados';
        break;
      case 'virtual-try-on':
        data = await this.getVirtualTryOnSessionsReport();
        filename = 'pruebas_virtuales';
        break;
      case 'product-movements':
        data = await this.getProductMovementsReport();
        filename = 'movimientos_productos';
        break;
      default:
        throw new Error('Tipo de reporte no válido');
    }

    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Encabezados
    csvRows.push(headers.map((h) => `"${h.replace(/_/g, ' ')}"`).join(','));

    // Datos
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '""';
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}

