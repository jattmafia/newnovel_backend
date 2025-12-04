import bcryptjs from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { getDatabase } from '../config/database';
import { User } from '../models/User';
import { sendEmail, generateVerificationEmailHTML } from './emailService';
import { ObjectId } from 'mongodb';

export interface SignupData {
    name: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'other';
    dob: string; // ISO format date string
}

export async function registerUser(data: SignupData): Promise<{ userId: string; message: string }> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: data.email });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Generate verification token
    const signOptions: SignOptions = { expiresIn: '24h' };
    const verificationToken = jwt.sign(
        { email: data.email },
        config.jwtSecret as string,
        signOptions
    );

    // Create user document
    const user: User = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        gender: data.gender,
        dob: new Date(data.dob),
        profile: {
            bio: '',
            reputation: 0,
        },
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Send verification email BEFORE inserting user into database
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${verificationToken}`;
    const emailHTML = generateVerificationEmailHTML(data.name, verificationLink);

    try {
        await sendEmail({
            to: data.email,
            subject: 'Verify your email - New Novel',
            html: emailHTML,
        });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }

    // Insert user into database only after email is successfully sent
    const result = await usersCollection.insertOne(user);

    return {
        userId: result.insertedId.toString(),
        message: 'User registered successfully. Please check your email to verify your account.',
    };
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as { email: string };

        // Find user and update verification status
        const result = await usersCollection.updateOne(
            { email: decoded.email },
            {
                $set: {
                    isEmailVerified: true,
                    emailVerificationToken: undefined,
                    emailVerificationTokenExpiry: undefined,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            throw new Error('User not found');
        }

        return { message: 'Email verified successfully' };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Verification token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid verification token');
        }
        throw error;
    }
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: Partial<User> }> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (!user.isEmailVerified) {
        throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id?.toString(), email: user.email },
        config.jwtSecret as string,
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
        token,
        user: userWithoutPassword,
    };
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
    const db = getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    if (user.isEmailVerified) {
        throw new Error('Email is already verified');
    }

    // Generate new verification token
    const signOptions: SignOptions = { expiresIn: '24h' };
    const verificationToken = jwt.sign(
        { email: user.email },
        config.jwtSecret as string,
        signOptions
    );

    // Update user with new token
    await usersCollection.updateOne(
        { email: user.email },
        {
            $set: {
                emailVerificationToken: verificationToken,
                emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                updatedAt: new Date(),
            },
        }
    );

    // Send verification email
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${verificationToken}`;
    const emailHTML = generateVerificationEmailHTML(user.name, verificationLink);

    try {
        await sendEmail({
            to: user.email,
            subject: 'Verify your email - New Novel',
            html: emailHTML,
        });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }

    return { message: 'Verification email sent successfully' };
}
