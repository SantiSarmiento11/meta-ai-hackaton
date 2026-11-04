import { Router, Request, Response, NextFunction } from 'express';
import {
  getAgents,
  updateAgent,
  getAgentActivity,
  updateAgentActivity,
  executeAgentAction,
  chatWithPrincipalAgent,
  getChatHistory,
  getMetaAiStatus,
  getCoworkerRepositories,
  executeCoworkerRepoAction,
  getSecretaryDriveFiles,
  executeSecretaryDriveAction,
  getManagerSystemHealth,
  executeManagerAction,
} from '../controllers/agent.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { env } from '../config/env';

const router = Router();

// Middleware to authenticate either with JWT user token or with X-N8N-API-KEY / local n8n caller
const authenticateUserOrN8n = (req: Request, res: Response, next: NextFunction): void => {
  const n8nApiKey = req.headers['x-n8n-api-key'];
  if (n8nApiKey && n8nApiKey === env.N8N_API_KEY) {
    (req as any).user = { id: 'n8n_system_agent', email: 'n8n@sleeply.local' };
    next();
    return;
  }
  // Allow loopback / localhost callers if internal
  const remoteIp = req.socket.remoteAddress;
  if (remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1') {
    (req as any).user = { id: 'local_orchestrator', email: 'system@sleeply.local' };
    next();
    return;
  }
  authenticateToken(req as any, res, next);
};

// Public activity route for UI state & n8n webhook sync
router.get('/activity', getAgentActivity);
router.post('/activity', authenticateUserOrN8n, updateAgentActivity);

// Protected endpoints for user management and agent actions
router.use(authenticateToken);
router.get('/', getAgents);
router.post('/chat', chatWithPrincipalAgent);
router.get('/chat/history', getChatHistory);
router.get('/meta-ai/status', getMetaAiStatus);

// Specialized Agent Endpoints
router.get('/coworker/repositories', getCoworkerRepositories);
router.post('/coworker/action', executeCoworkerRepoAction);

router.get('/secretary/drive-files', getSecretaryDriveFiles);
router.post('/secretary/action', executeSecretaryDriveAction);

router.get('/manager/health', getManagerSystemHealth);
router.post('/manager/action', executeManagerAction);

router.post('/:code/action', executeAgentAction);
router.patch('/:id', updateAgent);

export default router;


