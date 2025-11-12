import { PrismaClient, Prisma, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 👉 Categorías
  const categories = [
    {
      id: '192a2f99-8145-4369-8ccc-c825ceb322d7',
      name: 'Mujeres',
      description: 'Ropa y accesorios para mujeres',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T14:24:55.049Z'),
      updated_at: new Date('2025-09-24T14:24:55.049Z'),
    },
    {
      id: 'd5e5bb1b-e7d7-478b-81fd-597ff7c06979',
      name: 'Hombres',
      description: 'Ropa y accesorios para hombres',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T14:24:55.049Z'),
      updated_at: new Date('2025-09-24T14:24:55.049Z'),
    },
    {
      id: 'a0055553-4019-46a2-9859-776303f9220e',
      name: 'Niños',
      description: 'Ropa y accesorios para niños',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T14:24:55.049Z'),
      updated_at: new Date('2025-09-24T14:24:55.049Z'),
    },
    {
      id: '1f1b233a-2a4e-4ace-8a03-2fd937ef8530',
      name: 'Gafas',
      description: 'Gafas y lentes',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: '4b9b882d-b8dc-4c52-8783-0de80280194d',
      name: 'Joyas',
      description: 'Joyas y bisutería',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: '703a4961-2b48-47f9-bc23-68578137253e',
      name: 'Vestidos',
      description: 'Vestidos elegantes para toda ocasión',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: '80dfcd4d-2e19-4119-a11e-596ade00b731',
      name: 'Bolsos',
      description: 'Bolsos y carteras',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'c7e1061b-19a6-426a-ba0c-662545f2c696',
      name: 'Blusas',
      description: 'Blusas y camisas para mujeres',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'eb3c44fc-b435-40de-a674-e99904b4c483',
      name: 'Pantalones',
      description: 'Pantalones y jeans',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'f68b9e33-32db-4dae-a731-2124eb505246',
      name: 'Chaquetas',
      description: 'Chaquetas y abrigos',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'f82d6c87-a56b-47b2-966e-8b439588008d',
      name: 'Camisetas',
      description: 'Camisetas y polos',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'd49b7a16-ca8a-400a-af7c-19d26bb692b1',
      name: 'Sudaderas',
      description: 'Sudaderas y hoodies',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
    {
      id: 'd56dc019-13ec-4feb-8024-617ded8e1687',
      name: 'Relojes',
      description: 'Relojes y accesorios de tiempo',
      image_url: null,
      is_active: true,
      created_at: new Date('2025-09-24T15:07:17.202Z'),
      updated_at: new Date('2025-09-24T15:07:17.202Z'),
    },
  ];

  // 👉 Productos
  const products = [
    {
      id: '09850210-bf45-4e95-b17d-e76233309d78',
      name: 'Gafas de Sol Aviador',
      description: 'Gafas de sol estilo aviador',
      price: new Prisma.Decimal(45.99),
      category_id: '1f1b233a-2a4e-4ace-8a03-2fd937ef8530',
      brand: 'Sun Protection',
      color: 'Negro',
      sizes: ['Único'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/38-2_copy.webp',
      ],
      stock_quantity: 50,
      is_active: true,
      gender: Gender.unisex,
    },
    {
      id: '0b6de681-c80b-43e9-9cc9-483e3caee39e',
      name: 'Bolso de Mano Elegante',
      description: 'Bolso elegante de mano',
      price: new Prisma.Decimal(129.99),
      category_id: '80dfcd4d-2e19-4119-a11e-596ade00b731',
      brand: 'Luxury Accessories',
      color: 'Negro',
      sizes: ['Único'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/e8ae74a1bc29c14aa30eed7d75251b8d.png',
      ],
      stock_quantity: 25,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: '1cacfca1-7351-45db-8b56-e8415022a0fc',
      name: 'Vestido OniiChan uwu',
      description: 'Vestido elegante perfecto para ocasiones especiales',
      price: new Prisma.Decimal(56.9),
      category_id: '703a4961-2b48-47f9-bc23-68578137253e',
      brand: 'Fashion Forward',
      color: 'Rose',
      sizes: ['XS', 'S', 'M', 'L'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/rBVaR1r-S2GAPu-pAAMqo1M9mRc863.jpg',
      ],
      stock_quantity: 50,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: '315e00f8-6ed1-4663-a210-076d3bb30d0b',
      name: 'Blusa Floral Primavera',
      description: 'Blusa con estampado floral primaveral',
      price: new Prisma.Decimal(45.99),
      category_id: 'c7e1061b-19a6-426a-ba0c-662545f2c696',
      brand: 'Garden Collection',
      color: 'Floral',
      sizes: ['XS', 'S', 'M', 'L'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/16fb48639c8e77616b82fe8320ac2001.jpg',
      ],
      stock_quantity: 40,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: '52e8fb9c-41d3-43f0-a73f-5a4e42c4de5a',
      name: 'Collar de Perlas',
      description: 'Collar elegante de perlas',
      price: new Prisma.Decimal(75.99),
      category_id: '4b9b882d-b8dc-4c52-8783-0de80280194d',
      brand: 'Elegant Jewelry',
      color: 'Perla',
      sizes: ['Único'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/collares-de-perlas-multiples.webp',
      ],
      stock_quantity: 15,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: '5e7124c1-82f1-4f8c-9b44-7d66a8df8dba',
      name: 'Jeans Skinny Fit Mujer',
      description: 'Jeans de corte ajustado para mujeres',
      price: new Prisma.Decimal(69.99),
      category_id: 'eb3c44fc-b435-40de-a674-e99904b4c483',
      brand: 'Urban Style',
      color: 'Azul',
      sizes: ['26', '28', '30', '32', '34'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/16bc0d6c2e1118410f3927b3388f68a0.jpg',
      ],
      stock_quantity: 60,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: '66f235f7-b5e2-4f7c-8903-349765d89d45',
      name: 'Chaqueta de Cuero',
      description: 'Chaqueta de cuero genuino',
      price: new Prisma.Decimal(199.99),
      category_id: 'f68b9e33-32db-4dae-a731-2124eb505246',
      brand: 'Luxury Line',
      color: 'Negro',
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/Chaqueta-de-cuero-genuino-para-hombre-abrigo-delgado-de-piel-de-vaca-Natural-Estilo-Vintage-marr.webp',
      ],
      stock_quantity: 15,
      is_active: true,
      gender: Gender.men,
    },
    {
      id: '8808579d-b1ae-4fe1-ac5d-3d8c696bc238',
      name: 'Camiseta Básica Premium',
      description: 'Camiseta básica de alta calidad',
      price: new Prisma.Decimal(29.99),
      category_id: 'f82d6c87-a56b-47b2-966e-8b439588008d',
      brand: 'StyleAI Collection',
      color: 'Negro',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/2b46edfa-053e-46a5-b9da-3d221993e9c9.499614b445862d2c95a7776004453bd4.webp',
      ],
      stock_quantity: 80,
      is_active: true,
      gender: Gender.men,
    },
    {
      id: '8f7a29e7-189b-4948-a15b-c4ad766f2c2e',
      name: 'Camiseta Infantil Colorida',
      description: 'Camiseta colorida para niños',
      price: new Prisma.Decimal(19.99),
      category_id: 'f82d6c87-a56b-47b2-966e-8b439588008d',
      brand: 'Kids Collection',
      color: 'Multicolor',
      sizes: ['2T', '3T', '4T', '5T', '6T'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/camiseta-manga-corta-infantil-guacamayo.jpg',
      ],
      stock_quantity: 40,
      is_active: true,
      gender: Gender.kids,
    },
    {
      id: '9a20dcfb-71ac-4c10-85f1-1f9ecf81eccf',
      name: 'Camiseta Deportiva',
      description: 'Camiseta deportiva transpirable',
      price: new Prisma.Decimal(35.99),
      category_id: 'f82d6c87-a56b-47b2-966e-8b439588008d',
      brand: 'Active Wear',
      color: 'Azul',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/camiseta.jpg',
      ],
      stock_quantity: 45,
      is_active: true,
      gender: Gender.men,
    },
    {
      id: 'a2f96775-3c5f-42b4-a9d7-0351766eeb4a',
      name: 'Vestido Infantil Princesa',
      description: 'Vestido de princesa para niñas',
      price: new Prisma.Decimal(39.99),
      category_id: '703a4961-2b48-47f9-bc23-68578137253e',
      brand: 'Little Dreams',
      color: 'Rosa',
      sizes: ['2T', '3T', '4T', '5T', '6T'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/71hUIkANupL._AC_UL1500_.jpg',
      ],
      stock_quantity: 20,
      is_active: true,
      gender: Gender.kids,
    },
    {
      id: 'bf4ce0b4-62dc-485c-8fae-11512c7ac8a9',
      name: 'Hoodie Oversized',
      description: 'Sudadera con capucha de corte amplio',
      price: new Prisma.Decimal(79.99),
      category_id: 'd49b7a16-ca8a-400a-af7c-19d26bb692b1',
      brand: 'Comfort Zone',
      color: 'Gris',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/Dettori-Loose-Pullover-Hoodie.avif',
      ],
      stock_quantity: 35,
      is_active: true,
      gender: Gender.men,
    },
    {
      id: 'cdbe07c6-d9ca-4c4f-8e65-b5697c4d559b',
      name: 'Reloj Deportivo',
      description: 'Reloj deportivo inteligente',
      price: new Prisma.Decimal(89.99),
      category_id: 'd56dc019-13ec-4feb-8024-617ded8e1687',
      brand: 'Tech Watch',
      color: 'Negro',
      sizes: ['S', 'M', 'L'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/image-468a996705eb4ac485a9dc23fdec7eff.webp',
      ],
      stock_quantity: 30,
      is_active: true,
      gender: Gender.unisex,
    },
    {
      id: 'd9c415a1-66df-44bd-819f-68e5290258db',
      name: 'Blusa Ejecutiva',
      description: 'Blusa elegante para uso profesional',
      price: new Prisma.Decimal(55.99),
      category_id: 'c7e1061b-19a6-426a-ba0c-662545f2c696',
      brand: 'Professional Line',
      color: 'Blanco',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/da2fc93a4a5fa130ecd02a99bb7c8c01.jpg',
      ],
      stock_quantity: 25,
      is_active: true,
      gender: Gender.women,
    },
    {
      id: 'ff674168-f3f8-450f-a8eb-1928a47f6589',
      name: 'Vestido Casual Floral',
      description: 'Vestido casual con estampado floral',
      price: new Prisma.Decimal(65.99),
      category_id: '703a4961-2b48-47f9-bc23-68578137253e',
      brand: 'Garden Collection',
      color: 'Floral',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'https://schbbdodgajmbzeeriwd.supabase.co/storage/v1/object/public/prendas/b3b56592eb54d622a2e923237eae1d77.webp',
      ],
      stock_quantity: 30,
      is_active: true,
      gender: Gender.women,
    },
  ];

  // 👉 Insertar categorías primero
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  // 👉 Luego productos
  for (const product of products) {
    const exists = await prisma.category.findUnique({
      where: { id: product.category_id },
    });

    if (!exists) {
      console.error(`❌ Category not found for product: ${product.name} (${product.category_id})`);
      continue;
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
