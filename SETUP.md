# Configuración del Backend - Probador Virtual

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/probador_virtual?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"

# Puerto de la aplicación
PORT=3000
```

## Instalación de Dependencias

```bash
npm install @nestjs/jwt @nestjs/config bcryptjs class-validator class-transformer @nestjs/swagger
```

## Configuración de la Base de Datos

1. Asegúrate de que PostgreSQL esté ejecutándose
2. Ejecuta las migraciones:
```bash
npm run prisma:migrate
```

3. Genera el cliente de Prisma:
```bash
npm run prisma:generate
```

4. (Opcional) Ejecuta el seed para datos de prueba:
```bash
npm run prisma:seed
```

## Ejecutar la Aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Documentación de la API

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación de Swagger en:
- http://localhost:3000/api

## Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /users` - Obtener todos los usuarios (requiere autenticación)
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /users/profile/me` - Obtener perfil del usuario autenticado
- `PUT /users/profile/me` - Actualizar perfil del usuario autenticado

### Categorías
- `GET /categories` - Obtener todas las categorías
- `GET /categories/active` - Obtener categorías activas
- `GET /categories/:id` - Obtener categoría por ID
- `POST /categories` - Crear categoría (requiere rol admin)
- `PUT /categories/:id` - Actualizar categoría (requiere rol admin)
- `DELETE /categories/:id` - Eliminar categoría (requiere rol admin)

### Productos
- `GET /products` - Obtener todos los productos (con paginación y filtros)
- `GET /products/featured` - Obtener productos destacados
- `GET /products/search` - Buscar productos
- `GET /products/category/:categoryId` - Obtener productos por categoría
- `GET /products/:id` - Obtener producto por ID
- `POST /products` - Crear producto (requiere rol admin)
- `PUT /products/:id` - Actualizar producto (requiere rol admin)
- `DELETE /products/:id` - Eliminar producto (requiere rol admin)

## Roles de Usuario

- `client` - Usuario cliente (por defecto)
- `admin` - Administrador del sistema

## Características Implementadas

✅ Módulo de usuarios (registro, inicio de sesión, roles)
✅ Autenticación y autorización con JWT
✅ Módulo de catálogo de productos (CRUD de prendas y categorías)
✅ Validación de datos con class-validator
✅ Documentación automática con Swagger
✅ Paginación en listados
✅ Búsqueda de productos
✅ Filtros por categoría
✅ Gestión de roles y permisos
