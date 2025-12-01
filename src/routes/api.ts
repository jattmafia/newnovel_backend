import { Router, Request, Response } from 'express';

const router = Router();

// Welcome endpoint
router.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to New Novel Backend API',
        version: '1.0.0',
    });
});

export { router as apiRoutes };
