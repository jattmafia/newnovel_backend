import { Router, Request, Response } from 'express';
import { authRoutes } from './auth';
import { profileRoutes } from './profile';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Welcome endpoint
router.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to New Novel Backend API',
        version: '1.0.0',
    });
});

export { router as apiRoutes };