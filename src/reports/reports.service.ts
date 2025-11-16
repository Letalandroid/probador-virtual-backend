import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateMockProductViews(count: number = 15) {
    const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho'];
    const categories = ['Vestidos', 'Camisetas', 'Pantalones', 'Faldas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior'];
    const productNames = [
      'Vestido Casual Floral', 'Camiseta Básica Blanca', 'Pantalón Vaquero Clásico', 'Falda Midi Plisada',
      'Abrigo Largo Invierno', 'Zapatos Deportivos Running', 'Bolso Tote Cuero', 'Chaqueta Denim',
      'Vestido Elegante Noche', 'Camiseta Manga Larga', 'Pantalón Chino Beige', 'Falda Lápiz Negra',
      'Abrigo Corto Lana', 'Botas Anchas Cuero', 'Cinturón Piel Marrón', 'Blazer Formal Azul',
      'Vestido Verano Estampado', 'Top Sin Mangas', 'Shorts Deportivos', 'Chal Largo Invierno'
    ];

    return Array.from({ length: count }, (_, i) => ({
      product_id: `mock-product-${i + 1}`,
      product_name: productNames[i % productNames.length] + ` ${i + 1}`,
      brand: brands[i % brands.length],
      category: categories[i % categories.length],
      total_views: Math.floor(Math.random() * 500) + 50,
    }));
  }

  private generateMockVirtualTryOns(count: number = 15) {
    const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho'];
    const categories = ['Vestidos', 'Camisetas', 'Pantalones', 'Faldas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior'];
    const productNames = [
      'Vestido Casual Floral', 'Camiseta Básica Blanca', 'Pantalón Vaquero Clásico', 'Falda Midi Plisada',
      'Abrigo Largo Invierno', 'Zapatos Deportivos Running', 'Bolso Tote Cuero', 'Chaqueta Denim',
      'Vestido Elegante Noche', 'Camiseta Manga Larga', 'Pantalón Chino Beige', 'Falda Lápiz Negra',
      'Abrigo Corto Lana', 'Botas Anchas Cuero', 'Cinturón Piel Marrón', 'Blazer Formal Azul',
      'Vestido Verano Estampado', 'Top Sin Mangas', 'Shorts Deportivos', 'Chal Largo Invierno'
    ];

    return Array.from({ length: count }, (_, i) => ({
      product_id: `mock-product-${i + 1}`,
      product_name: productNames[i % productNames.length] + ` ${i + 1}`,
      brand: brands[i % brands.length],
      category: categories[i % categories.length],
      try_on_count: Math.floor(Math.random() * 200) + 10,
    }));
  }

  private generateMockProductMovements(count: number = 20) {
    const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho'];
    const categories = ['Vestidos', 'Camisetas', 'Pantalones', 'Faldas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior'];
    const productNames = [
      'Vestido Casual Floral', 'Camiseta Básica Blanca', 'Pantalón Vaquero Clásico', 'Falda Midi Plisada',
      'Abrigo Largo Invierno', 'Zapatos Deportivos Running', 'Bolso Tote Cuero', 'Chaqueta Denim',
      'Vestido Elegante Noche', 'Camiseta Manga Larga', 'Pantalón Chino Beige', 'Falda Lápiz Negra',
      'Abrigo Corto Lana', 'Botas Anchas Cuero', 'Cinturón Piel Marrón', 'Blazer Formal Azul',
      'Vestido Verano Estampado', 'Top Sin Mangas', 'Shorts Deportivos', 'Chal Largo Invierno'
    ];

    const now = new Date();
    return Array.from({ length: count }, (_, i) => ({
      product_id: `mock-product-${i + 1}`,
      product_name: productNames[i % productNames.length] + ` ${i + 1}`,
      brand: brands[i % brands.length],
      category: categories[i % categories.length],
      stock_quantity: Math.floor(Math.random() * 100) + 5,
      price: (Math.random() * 200 + 20).toFixed(2),
      last_view: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_try_on: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }

  private generateMockSales(count: number = 20) {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'];
    const now = new Date();

    return Array.from({ length: count }, (_, i) => {
      const date = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      return {
        order_id: `mock-order-${i + 1}`,
        order_number: `ORD-${String(i + 1).padStart(6, '0')}`,
        user_email: `user${i + 1}@example.com`,
        user_name: `Usuario ${i + 1}`,
        total_amount: (Math.random() * 500 + 50).toFixed(2),
        status: statuses[i % statuses.length],
        payment_status: paymentStatuses[i % paymentStatuses.length],
        payment_method: paymentMethods[i % paymentMethods.length],
        items_count: Math.floor(Math.random() * 5) + 1,
        created_at: date.toLocaleString('es-ES', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
    });
  }

  private generateMockTopSelling(count: number = 15) {
    const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho'];
    const categories = ['Vestidos', 'Camisetas', 'Pantalones', 'Faldas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior'];
    const productNames = [
      'Vestido Casual Floral', 'Camiseta Básica Blanca', 'Pantalón Vaquero Clásico', 'Falda Midi Plisada',
      'Abrigo Largo Invierno', 'Zapatos Deportivos Running', 'Bolso Tote Cuero', 'Chaqueta Denim',
      'Vestido Elegante Noche', 'Camiseta Manga Larga', 'Pantalón Chino Beige', 'Falda Lápiz Negra',
      'Abrigo Corto Lana', 'Botas Anchas Cuero', 'Cinturón Piel Marrón', 'Blazer Formal Azul',
      'Vestido Verano Estampado', 'Top Sin Mangas', 'Shorts Deportivos', 'Chal Largo Invierno'
    ];

    return Array.from({ length: count }, (_, i) => ({
      product_id: `mock-product-${i + 1}`,
      product_name: productNames[i % productNames.length] + ` ${i + 1}`,
      brand: brands[i % brands.length],
      category: categories[i % categories.length],
      total_quantity_sold: Math.floor(Math.random() * 500) + 20,
      total_revenue: (Math.random() * 10000 + 500).toFixed(2),
      orders_count: Math.floor(Math.random() * 100) + 5,
    })).sort((a, b) => Number(b.total_quantity_sold) - Number(a.total_quantity_sold));
  }

  private generateMockSalesTrends(months: number = 12) {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const total = Math.random() * 50000 + 10000;
      const count = Math.floor(Math.random() * 200) + 50;
      const completed = Math.floor(count * (0.7 + Math.random() * 0.2));

      return {
        month: monthKey,
        total_revenue: total.toFixed(2),
        total_orders: count,
        completed_orders: completed,
        average_order_value: (total / count).toFixed(2),
      };
    });
  }

  private generateMockConversionMetrics(count: number = 15) {
    const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho'];
    const categories = ['Vestidos', 'Camisetas', 'Pantalones', 'Faldas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior'];
    const productNames = [
      'Vestido Casual Floral', 'Camiseta Básica Blanca', 'Pantalón Vaquero Clásico', 'Falda Midi Plisada',
      'Abrigo Largo Invierno', 'Zapatos Deportivos Running', 'Bolso Tote Cuero', 'Chaqueta Denim',
      'Vestido Elegante Noche', 'Camiseta Manga Larga', 'Pantalón Chino Beige', 'Falda Lápiz Negra',
      'Abrigo Corto Lana', 'Botas Anchas Cuero', 'Cinturón Piel Marrón', 'Blazer Formal Azul',
      'Vestido Verano Estampado', 'Top Sin Mangas', 'Shorts Deportivos', 'Chal Largo Invierno'
    ];

    return Array.from({ length: count }, (_, i) => {
      const views = Math.floor(Math.random() * 1000) + 100;
      const tryOns = Math.floor(views * (0.1 + Math.random() * 0.2));
      const sold = Math.floor(tryOns * (0.05 + Math.random() * 0.15));

      return {
        product_id: `mock-product-${i + 1}`,
        product_name: productNames[i % productNames.length] + ` ${i + 1}`,
        brand: brands[i % brands.length],
        category: categories[i % categories.length],
        total_views: views,
        total_try_ons: tryOns,
        total_sold: sold,
        view_to_try_on_rate: ((tryOns / views) * 100).toFixed(2),
        try_on_to_sale_rate: tryOns > 0 ? ((sold / tryOns) * 100).toFixed(2) : '0.00',
        overall_conversion_rate: ((sold / views) * 100).toFixed(2),
      };
    });
  }

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

    if (views.length === 0) {
      return this.generateMockProductViews(15);
    }

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

    if (sessions.length === 0) {
      return this.generateMockVirtualTryOns(15);
    }

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
    // Optimizar: obtener solo los campos necesarios y usar select en lugar de include
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        brand: true,
        stock_quantity: true,
        price: true,
        updated_at: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 100,
    });

    if (products.length === 0) {
      return this.generateMockProductMovements(20);
    }

    // Obtener las últimas vistas y try-ons en una sola query por producto usando Promise.all
    const productIds = products.map(p => p.id);
    
    // Obtener últimas vistas y try-ons en paralelo usando groupBy
    const [lastViews, lastTryOns] = await Promise.all([
      this.prisma.productView.groupBy({
        by: ['product_id'],
        where: {
          product_id: { in: productIds },
        },
        _max: {
          created_at: true,
        },
      }),
      this.prisma.virtualTryOnSession.groupBy({
        by: ['product_id'],
        where: {
          product_id: { in: productIds },
        },
        _max: {
          created_at: true,
        },
      }),
    ]);

    // Crear mapas para acceso rápido
    const viewsMap = new Map(lastViews.map(v => [v.product_id, v._max.created_at]));
    const tryOnsMap = new Map(lastTryOns.map(t => [t.product_id, t._max.created_at]));

    return products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      brand: product.brand || 'N/A',
      category: product.category.name,
      stock_quantity: product.stock_quantity,
      price: product.price.toString(),
      last_view: viewsMap.get(product.id) || null,
      last_try_on: tryOnsMap.get(product.id) || null,
      updated_at: product.updated_at,
    }));
  }


  async getSalesReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        order_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (orders.length === 0) {
      return this.generateMockSales(20);
    }

    return orders.map((order) => ({
      order_id: order.id,
      order_number: order.order_number,
      user_email: order.user.email,
      user_name: order.user.full_name || 'N/A',
      total_amount: order.total_amount.toString(),
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method || 'N/A',
      items_count: order.order_items.length,
      created_at: order.created_at instanceof Date 
        ? order.created_at.toLocaleString('es-ES', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : new Date(order.created_at).toLocaleString('es-ES', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
    }));
  }

  async getTopSellingProductsReport(limit: number = 20) {
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['product_id'],
      _sum: {
        quantity: true,
        total_price: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    if (orderItems.length === 0) {
      return this.generateMockTopSelling(15);
    }

    const productIds = orderItems.map((item) => item.product_id);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return orderItems.map((item) => ({
      product_id: item.product_id,
      product_name: productMap.get(item.product_id)?.name || 'N/A',
      brand: productMap.get(item.product_id)?.brand || 'N/A',
      category: productMap.get(item.product_id)?.category?.name || 'N/A',
      total_quantity_sold: item._sum.quantity || 0,
      total_revenue: item._sum.total_price?.toString() || '0',
      orders_count: item._count.id,
    }));
  }

  async getSalesTrendsReport(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const orders = await this.prisma.order.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
      },
      select: {
        created_at: true,
        total_amount: true,
        status: true,
      },
    });

    if (orders.length === 0) {
      return this.generateMockSalesTrends(months);
    }

    // Agrupar por mes
    const monthlyData: { [key: string]: { total: number; count: number; completed: number } } = {};

    orders.forEach((order) => {
      const monthKey = `${order.created_at.getFullYear()}-${String(order.created_at.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, completed: 0 };
      }
      monthlyData[monthKey].total += Number(order.total_amount);
      monthlyData[monthKey].count += 1;
      if (order.status === 'completed') {
        monthlyData[monthKey].completed += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        total_revenue: data.total.toFixed(2),
        total_orders: data.count,
        completed_orders: data.completed,
        average_order_value: (data.total / data.count).toFixed(2),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getConversionMetricsReport() {
    // Obtener vistas de productos
    const views = await this.prisma.productView.groupBy({
      by: ['product_id'],
      _count: {
        id: true,
      },
    });

    // Obtener pruebas virtuales
    const tryOns = await this.prisma.virtualTryOnSession.groupBy({
      by: ['product_id'],
      _count: {
        id: true,
      },
    });

    // Obtener productos vendidos
    const soldProducts = await this.prisma.orderItem.groupBy({
      by: ['product_id'],
      _sum: {
        quantity: true,
      },
    });

    if (views.length === 0 && tryOns.length === 0 && soldProducts.length === 0) {
      return this.generateMockConversionMetrics(15);
    }

    const productIds = [
      ...views.map((v) => v.product_id),
      ...tryOns.map((t) => t.product_id),
      ...soldProducts.map((s) => s.product_id),
    ];
    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length === 0) {
      return this.generateMockConversionMetrics(15);
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
      },
      include: {
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const viewsMap = new Map(views.map((v) => [v.product_id, v._count.id]));
    const tryOnsMap = new Map(tryOns.map((t) => [t.product_id, t._count.id]));
    const soldMap = new Map(soldProducts.map((s) => [s.product_id, s._sum.quantity || 0]));

    return uniqueProductIds.map((productId) => {
      const product = productMap.get(productId);
      const views = viewsMap.get(productId) || 0;
      const tryOns = tryOnsMap.get(productId) || 0;
      const sold = soldMap.get(productId) || 0;

      return {
        product_id: productId,
        product_name: product?.name || 'N/A',
        brand: product?.brand || 'N/A',
        category: product?.category?.name || 'N/A',
        total_views: views,
        total_try_ons: tryOns,
        total_sold: sold,
        view_to_try_on_rate: views > 0 ? ((tryOns / views) * 100).toFixed(2) : '0.00',
        try_on_to_sale_rate: tryOns > 0 ? ((sold / tryOns) * 100).toFixed(2) : '0.00',
        overall_conversion_rate: views > 0 ? ((sold / views) * 100).toFixed(2) : '0.00',
      };
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
      case 'sales':
        data = await this.getSalesReport();
        filename = 'analisis_ventas';
        break;
      case 'top-selling':
        data = await this.getTopSellingProductsReport();
        filename = 'productos_mas_vendidos';
        break;
      case 'sales-trends':
        data = await this.getSalesTrendsReport();
        filename = 'tendencias_ventas';
        break;
      case 'conversion-metrics':
        data = await this.getConversionMetricsReport();
        filename = 'metricas_conversion';
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
      case 'sales':
        data = await this.getSalesReport();
        title = 'Análisis Detallado de Ventas';
        break;
      case 'top-selling':
        data = await this.getTopSellingProductsReport();
        title = 'Productos Más Vendidos';
        break;
      case 'sales-trends':
        data = await this.getSalesTrendsReport();
        title = 'Análisis de Tendencias de Ventas';
        break;
      case 'conversion-metrics':
        data = await this.getConversionMetricsReport();
        title = 'Métricas de Conversión';
        break;
      default:
        throw new Error('Tipo de reporte no válido');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 60,
        size: 'A4',
        info: {
          Title: title,
          Author: 'Sistema de Gestión',
          Subject: 'Reporte',
        }
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Configuración de márgenes y espacios
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 60;
      const topMargin = 50; // Margen superior para páginas normales
      const firstPageTopMargin = 80; // Margen superior para primera página (con título)
      const bottomMargin = 60;
      const cellPadding = 8;
      const rowHeight = 30;
      const headerHeight = 35;
      const titleHeight = 60; // Altura del título y fecha en primera página

      // Título principal (solo en primera página)
      let currentY = firstPageTopMargin;
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text(title, margin, currentY, {
           align: 'center',
           width: pageWidth - 2 * margin,
         });

      // Fecha de generación (solo en primera página)
      currentY += 35;
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Generado el: ${new Date().toLocaleString('es-ES', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric', 
           hour: '2-digit', 
           minute: '2-digit' 
         })}`, margin, currentY, {
           align: 'center',
           width: pageWidth - 2 * margin,
         });

      currentY += 25; // Espacio después de la fecha

      // Verificar si hay datos
      if (!data || data.length === 0) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#999999')
           .text('No hay datos disponibles para este reporte', margin, currentY, {
             align: 'center',
             width: pageWidth - 2 * margin,
           });
        doc.end();
        return;
      }

      // Preparar encabezados
      const headers = Object.keys(data[0] || {});
      const tableWidth = pageWidth - 2 * margin;
      const colWidth = (tableWidth - (cellPadding * (headers.length + 1))) / headers.length;

      // Función para dibujar encabezado de tabla
      const drawTableHeader = (y: number) => {
        // Fondo del encabezado
        doc.rect(margin, y, tableWidth, headerHeight)
           .fillColor('#2c3e50')
           .fill()
           .fillColor('#ffffff');

        // Texto de encabezados
        doc.fontSize(10)
           .font('Helvetica-Bold');
        
        headers.forEach((header, i) => {
          const x = margin + cellPadding + i * (colWidth + cellPadding);
          const headerText = header.replace(/_/g, ' ').toUpperCase();
          doc.text(headerText, x, y + (headerHeight / 2) - 5, {
            width: colWidth,
            align: 'left',
          });
        });

        return y + headerHeight;
      };

      // Función para dibujar una fila de datos
      const drawTableRow = (row: any, y: number, isEven: boolean) => {
        // Fondo alternado para mejor legibilidad
        if (isEven) {
          doc.rect(margin, y, tableWidth, rowHeight)
             .fillColor('#f8f9fa')
             .fill()
             .fillColor('#000000');
        } else {
          doc.rect(margin, y, tableWidth, rowHeight)
             .fillColor('#ffffff')
             .fill()
             .fillColor('#000000');
        }

        // Texto de datos
        doc.fontSize(9)
           .font('Helvetica');

        headers.forEach((header, i) => {
          const x = margin + cellPadding + i * (colWidth + cellPadding);
          let value = row[header];
          
          // Convertir valores especiales a string
          if (value === null || value === undefined) {
            value = 'N/A';
          } else if (value instanceof Date) {
            value = value.toLocaleString('es-ES', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          } else {
            value = String(value);
          }
          
          // Truncar texto largo pero permitir más caracteres
          const displayValue = value.length > 40 ? value.substring(0, 37) + '...' : value;
          
          doc.text(displayValue, x, y + (rowHeight / 2) - 4, {
            width: colWidth,
            align: 'left',
            ellipsis: true,
          });
        });

        // Línea separadora
        doc.moveTo(margin, y + rowHeight)
           .lineTo(pageWidth - margin, y + rowHeight)
           .strokeColor('#e0e0e0')
           .lineWidth(0.5)
           .stroke();

        return y + rowHeight;
      };

      // Función para añadir pie de página en la página actual
      const addFooterToCurrentPage = (pageNum: number, totalPages: number) => {
        const savedY = doc.y;
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#999999')
           .text(
             `Página ${pageNum} de ${totalPages} | Total de registros: ${data.length}`,
             margin,
             pageHeight - 40,
             {
               align: 'center',
               width: pageWidth - 2 * margin,
             }
           );
        doc.y = savedY; // Restaurar posición Y
      };

      // Contador de páginas
      let pageNumber = 1;
      const availableHeightFirstPage = pageHeight - firstPageTopMargin - titleHeight - bottomMargin - headerHeight - 50;
      const availableHeightOtherPages = pageHeight - topMargin - bottomMargin - headerHeight - 50;
      const rowsPerPageFirst = Math.floor(availableHeightFirstPage / rowHeight);
      const rowsPerPageOther = Math.floor(availableHeightOtherPages / rowHeight);
      const totalPagesEstimate = Math.ceil((data.length - rowsPerPageFirst) / rowsPerPageOther) + 1 || 1;

      // Dibujar encabezado de tabla en primera página
      currentY = drawTableHeader(currentY);
      currentY += 5; // Espacio después del encabezado

      // Añadir pie de página en la primera página
      addFooterToCurrentPage(pageNumber, totalPagesEstimate);

      // Dibujar filas de datos
      data.forEach((row, index) => {
        // Verificar si necesitamos una nueva página (dejando espacio para al menos una fila)
        const spaceNeeded = rowHeight + 5; // Altura de fila + margen
        if (currentY + spaceNeeded > pageHeight - bottomMargin - 40) {
          doc.addPage();
          pageNumber++;
          // En páginas siguientes, empezar desde topMargin (sin título)
          currentY = topMargin;
          // Redibujar encabezado en nueva página
          currentY = drawTableHeader(currentY);
          currentY += 5;
          // Añadir pie de página en la nueva página
          addFooterToCurrentPage(pageNumber, totalPagesEstimate);
        }

        const isEven = index % 2 === 0;
        currentY = drawTableRow(row, currentY, isEven);
      });

      doc.end();
    });
  }
}

