// Configuración de la base de datos
export const dbConfig = {
  // MongoDB Atlas (producción)
  mongodb: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/real-estate',
    options: {
      retryWrites: process.env.NODE_ENV === 'production',
      w: process.env.NODE_ENV === 'production' ? 'majority' : 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    },
  },

  // Prisma
  prisma: {
    // Logging solo en desarrollo
    logging:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error', 'warn'],
    // ErrorFormat
    errorFormat: 'pretty' as const,
  },
};
