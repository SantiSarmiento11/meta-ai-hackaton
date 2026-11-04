import { Router } from 'express';
import { getTasks, createTask } from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);

export default router;
