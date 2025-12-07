import { Router } from 'express';
import { AuthController } from '../controllers/auth.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
