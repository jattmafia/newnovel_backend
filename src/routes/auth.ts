import { Router, Request, Response, NextFunction } from 'express';
import {
    signupController,
    verifyEmailController,
    loginController,
    resendVerificationEmailController,
} from '../controllers/authController';

const router = Router();

// Debug middleware
router.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`Auth Route: ${req.method} ${req.path}`);
    next();
});

// Auth routes
router.post('/signup', signupController);
router.get('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.post('/resend-verification', resendVerificationEmailController);

export { router as authRoutes };
