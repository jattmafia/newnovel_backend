import { Request, Response } from 'express';
import { registerUser, verifyEmail, loginUser, resendVerificationEmail } from '../services/authService';
import { initializeEmailService } from '../services/emailService';

// Initialize email service on startup
initializeEmailService();

export async function signupController(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password, gender, dob } = req.body;

        // Validation
        if (!name || !email || !password || !gender || !dob) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        if (!['male', 'female', 'other'].includes(gender)) {
            res.status(400).json({ error: 'Invalid gender' });
            return;
        }

        const result = await registerUser({ name, email, password, gender, dob });
        res.status(201).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed';
        res.status(400).json({ error: errorMessage });
    }
}

export async function verifyEmailController(req: Request, res: Response): Promise<void> {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            res.status(400).json({ error: 'Verification token is required' });
            return;
        }

        const result = await verifyEmail(token);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Verification failed';
        res.status(400).json({ error: errorMessage });
    }
}

export async function loginController(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const result = await loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        res.status(400).json({ error: errorMessage });
    }
}

export async function resendVerificationEmailController(req: Request, res: Response): Promise<void> {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        const result = await resendVerificationEmail(email);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
        res.status(400).json({ error: errorMessage });
    }
}
