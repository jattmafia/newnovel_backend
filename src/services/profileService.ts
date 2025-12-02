import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';
import { User } from '../models/User';

export interface UpdateProfileData {
    username?: string;
    bio?: string;
    location?: string;
}

export async function updateUserProfile(
    userId: string,
    profileData: UpdateProfileData,
    profilePictureUrl?: string
): Promise<Partial<User>> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    console.log('🔍 Updating profile for userId:', userId);

    // Validate username if provided (must be unique and alphanumeric)
    if (profileData.username) {
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(profileData.username)) {
            throw new Error('Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores');
        }

        const existingUser = await usersCollection.findOne({
            'profile.username': profileData.username,
            _id: { $ne: new ObjectId(userId) } as any,
        });
        if (existingUser) {
            throw new Error('Username already taken');
        }
    }

    const updateData: any = {};
    if (profileData.username) updateData['profile.username'] = profileData.username;
    if (profileData.bio !== undefined) updateData['profile.bio'] = profileData.bio;
    if (profileData.location !== undefined) updateData['profile.location'] = profileData.location;
    if (profilePictureUrl) updateData['profile.profilePicture'] = profilePictureUrl;

    updateData['updatedAt'] = new Date();

    const objectId = new ObjectId(userId);
    const result = await usersCollection.findOneAndUpdate(
        { _id: objectId } as any,
        { $set: updateData },
        { returnDocument: 'after' }
    ) as any;

    const user = result?.value || result;

    if (!user) {

        const checkUser = await usersCollection.findOne({ _id: objectId } as any);

        throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export async function getUserProfile(userId: string): Promise<Partial<User>> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) } as any);
    if (!user) {
        throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export async function getPublicProfile(username: string): Promise<Partial<User>> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ 'profile.username': username });
    if (!user) {
        throw new Error('User not found');
    }

    // Return only public profile information
    const { password, emailVerificationToken, emailVerificationTokenExpiry, ...publicProfile } = user;
    return publicProfile;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    // Validate username format
    if (!username || username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
    }

    const existingUser = await usersCollection.findOne({ 'profile.username': username });
    return !existingUser; // true if available, false if taken
}
