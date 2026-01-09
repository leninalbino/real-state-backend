// Tipos globales para TypeScript en desarrollo
declare global {
  var prisma: import('@prisma/client').PrismaClient | undefined;
}

export {};
