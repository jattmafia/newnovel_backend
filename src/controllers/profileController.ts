import { Request, Response } from 'express';
import { updateUserProfile, getUserProfile, getPublicProfile, checkUsernameAvailability } from '../services/profileService';
import { uploadProfilePicture } from '../services/cloudflareService';

export async function updateProfileController(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;
        const { username, bio, location } = req.body;

      
        if (!userId) {
            console.log('❌ [UPDATE PROFILE] No userId provided');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let profilePictureUrl: string | undefined;

        // Upload profile picture if provided
        if ((req as any).file) {
            console.log('📝 [UPDATE PROFILE] Uploading profile picture');
            profilePictureUrl = await uploadProfilePicture((req as any).file, userId);
            console.log('📝 [UPDATE PROFILE] Picture uploaded:', profilePictureUrl);
        }

        console.log('📝 [UPDATE PROFILE] Calling updateUserProfile service');
        const updatedUser = await updateUserProfile(
            userId,
            { username, bio, location },
            profilePictureUrl
        );
        console.log('📝 [UPDATE PROFILE] Profile updated successfully');

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
        res.status(400).json({ error: errorMessage });
    }
}

export async function getMyProfileController(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await getUserProfile(userId);
        res.status(200).json(user);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        res.status(400).json({ error: errorMessage });
    }
}

export async function getPublicProfileController(req: Request, res: Response): Promise<void> {
    try {
        const { username } = req.params;

        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        const user = await getPublicProfile(username);
        res.status(200).json(user);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        res.status(404).json({ error: errorMessage });
    }
}

export async function checkUsernameController(req: Request, res: Response): Promise<void> {
    try {
        const { username } = req.query;

        if (!username || typeof username !== 'string') {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        console.log('🔍 [USERNAME CHECK] Checking availability for:', username);
        const isAvailable = await checkUsernameAvailability(username);

        res.status(200).json({
            username,
            available: isAvailable,
            message: isAvailable ? 'Username is available' : 'Username is already taken',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Username check failed';
        res.status(400).json({ error: errorMessage });
    }
}
