import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './database/prisma';

const app = express();

// Security & Middleware configuration
app.use(
  cors({
    origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

// Server startup
const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  try {
    // Check database connection
    await prisma.$connect();
    const match = env.DATABASE_URL.match(/@([^:]+):(\d+)\/([^?]+)/);
    const dbInfo = match ? `${match[1]}:${match[2]} (${match[3]})` : 'PostgreSQL';
    console.log(`[Sleeply Backend] Server running on port ${PORT}`);
    console.log(`[Sleeply Backend] Connected to PostgreSQL at ${dbInfo}`);
  } catch (err: any) {
    console.error(`[Sleeply Backend] Database connection failed:`, err.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Sleeply Backend] SIGTERM received. Closing resources...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[Sleeply Backend] SIGINT received. Closing resources...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

export { app, server };
