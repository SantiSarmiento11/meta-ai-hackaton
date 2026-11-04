import { Router } from 'express';
import { getOffice, saveOffice } from '../controllers/office.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All office endpoints require JWT authentication
router.use(authenticateToken);

router.get('/', getOffice);
router.post('/save', saveOffice);
router.put('/save', saveOffice);

export default router;
