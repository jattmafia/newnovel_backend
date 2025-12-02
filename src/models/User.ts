export interface UserProfile {
    username?: string;
    bio?: string;
    profilePicture?: string;
    location?: string;
    reputation: number;
}

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    profile: UserProfile;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}
