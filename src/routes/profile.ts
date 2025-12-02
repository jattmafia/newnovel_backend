import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';
import {
    updateProfileController,
    getMyProfileController,
    getPublicProfileController,
    checkUsernameController,
} from '../controllers/profileController';

const router = Router();

// Private routes (require authentication)
router.put('/update', authMiddleware, upload.single('profilePicture'), updateProfileController);
router.get('/me', authMiddleware, getMyProfileController);

// Public routes (no authentication required)
router.get('/check-username', checkUsernameController);
router.get('/:username', getPublicProfileController);

export { router as profileRoutes };
