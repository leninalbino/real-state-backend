import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';

import propertiesRoutes, {
  adminPropertiesRouter,
} from './modules/properties/properties.routes';
import authRoutes from './modules/auth/auth.routes';
import filtersRoutes from './modules/filters/filters.routes';
import heroRoutes from './modules/hero/hero.routes';
import agentsRoutes from './modules/agents/agents.routes';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './docs/swagger';

const app = express();

// CORS configurado de manera segura
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://real-state-backend-xvct.onrender.com').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Middleware de seguridad
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/properties', propertiesRoutes);
app.use('/api/admin/properties', adminPropertiesRouter);
app.use('/api/auth', authRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/hero-slides', heroRoutes);
app.use('/api/admin/agents', agentsRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.send('Server is healthy');
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

export default app;
