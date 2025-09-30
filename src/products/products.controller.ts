import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../models/product.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async createProduct(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productsService.createProduct(createProductDto, req.user.userId);
  }

  @Get()
  async getAllProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.getAllProducts(page, limit, categoryId, search);
  }

  @Get('featured')
  async getFeaturedProducts(@Query('limit') limit?: number) {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get('search')
  async searchProducts(
    @Query('q') search: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.searchProducts(search, page, limit);
  }

  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getProductsByCategory(categoryId, page, limit);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async updateProduct(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, req.user.userId);
  }

  @Put(':id/stock')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async updateProductStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateProductStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string, @Request() req: any) {
    return this.productsService.deleteProduct(id, req.user.userId);
  }
}