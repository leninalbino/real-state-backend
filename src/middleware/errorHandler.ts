import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Errores de Prisma por código de error
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      message: 'Error en la base de datos',
      error: isProduction ? undefined : err.message,
    });
  }

  // Errores genéricos
  console.error(`❌ Error [${statusCode}]:`, err.message);

  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};