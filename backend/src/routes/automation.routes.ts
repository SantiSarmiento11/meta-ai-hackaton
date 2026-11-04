import { Router } from 'express';
import {
  testN8nConnection,
  getCredentials,
  upsertCredential,
  triggerWorkflow,
} from '../controllers/automation.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint for testing n8n connection can be audited with or without JWT
router.get('/n8n/test', testN8nConnection);

// Protected endpoints
router.use(authenticateToken);
router.get('/credentials', getCredentials);
router.post('/credentials', upsertCredential);
router.post('/n8n/trigger', triggerWorkflow);

export default router;
