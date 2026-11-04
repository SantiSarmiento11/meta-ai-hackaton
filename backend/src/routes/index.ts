import { Router } from 'express';
import authRoutes from './auth.routes';
import officeRoutes from './office.routes';
import agentRoutes from './agent.routes';
import taskRoutes from './task.routes';
import automationRoutes from './automation.routes';

import { env } from '../config/env';

const router = Router();

router.get('/health', (req, res) => {
  const dbUrl = env.DATABASE_URL;
  const match = dbUrl.match(/@([^:]+):(\d+)\/([^?]+)/);
  const dbHost = match ? `${match[1]}:${match[2]} (${match[3]})` : 'PostgreSQL';

  res.status(200).json({
    status: 'ok',
    service: 'Sleeply Backend API',
    database: `PostgreSQL @ ${dbHost}`,
    metaAiConfigured: !!env.META_AI_API_KEY,
    n8nBaseUrl: env.N8N_BASE_URL,
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/office', officeRoutes);
router.use('/agents', agentRoutes);
router.use('/tasks', taskRoutes);
router.use('/automation', automationRoutes);

export default router;
