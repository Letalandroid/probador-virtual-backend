import { Controller, Get, Query, Res, UseGuards, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('product-views/pdf')
  async getProductViewsPDF(@Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generatePDFReport('product-views');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=productos_mas_visualizados.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte PDF',
        error: error.message,
      });
    }
  }

  @Get('product-views/csv')
  async getProductViewsCSV(@Res() res: Response) {
    try {
      const csv = await this.reportsService.generateCSVReport('product-views');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=productos_mas_visualizados.csv');
      res.send(csv);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte CSV',
        error: error.message,
      });
    }
  }

  @Get('virtual-try-on/pdf')
  async getVirtualTryOnPDF(@Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generatePDFReport('virtual-try-on');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=pruebas_virtuales.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte PDF',
        error: error.message,
      });
    }
  }

  @Get('virtual-try-on/csv')
  async getVirtualTryOnCSV(@Res() res: Response) {
    try {
      const csv = await this.reportsService.generateCSVReport('virtual-try-on');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=pruebas_virtuales.csv');
      res.send(csv);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte CSV',
        error: error.message,
      });
    }
  }

  @Get('product-movements/pdf')
  async getProductMovementsPDF(@Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generatePDFReport('product-movements');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=movimientos_productos.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte PDF',
        error: error.message,
      });
    }
  }

  @Get('product-movements/csv')
  async getProductMovementsCSV(@Res() res: Response) {
    try {
      const csv = await this.reportsService.generateCSVReport('product-movements');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=movimientos_productos.csv');
      res.send(csv);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        message: 'Error al generar el reporte CSV',
        error: error.message,
      });
    }
  }
}

