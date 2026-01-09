import { Router } from 'express';
import * as AuthController from './auth.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/change-password', requireAuth, AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
