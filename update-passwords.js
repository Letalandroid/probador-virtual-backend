// Script para actualizar las contraseñas de los usuarios de prueba
// Ejecutar después de importar la base de datos: node update-passwords.js

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePasswords() {
  try {
    // Hash para admin123
    const adminHash = await bcrypt.hash('admin123', 10);
    // Hash para cliente123
    const clientHash = await bcrypt.hash('cliente123', 10);

    // Actualizar contraseña del administrador
    await prisma.user.update({
      where: { email: 'admin@probador.com' },
      data: { password: adminHash }
    });

    // Actualizar contraseña del cliente
    await prisma.user.update({
      where: { email: 'cliente@probador.com' },
      data: { password: clientHash }
    });

    console.log('✅ Contraseñas actualizadas correctamente');
    console.log('Admin: admin@probador.com / admin123');
    console.log('Cliente: cliente@probador.com / cliente123');
  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();

