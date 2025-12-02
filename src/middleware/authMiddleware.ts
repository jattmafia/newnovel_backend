import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.headers.authorization?.split(' ')[1];

       
        if (!token) {
          
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, config.jwtSecret as string) as {
            userId: string;
            email: string;
        };
       
        (req as any).userId = decoded.userId;
        (req as any).email = decoded.email;

        next();
    } catch (error) {
       res.status(401).json({ error: 'Invalid or expired token' });
    }
}
