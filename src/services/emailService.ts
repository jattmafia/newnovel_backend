import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

let transporter: Transporter | null = null;

export function initializeEmailService(): Transporter {
    if (transporter) {
        return transporter;
    }

    transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailSecure,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword,
        },
    });

    return transporter;
}

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
    if (!transporter) {
        initializeEmailService();
    }

    if (!transporter) {
        throw new Error('Email service not initialized');
    }

    try {
        await transporter.sendMail({
            from: config.emailFrom,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        console.log(`✓ Email sent to ${options.to}`);
    } catch (error) {
        console.error('✗ Failed to send email:', error);
        throw error;
    }
}

export function generateVerificationEmailHTML(name: string, verificationLink: string): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to New Novel!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">Verify Email</a>
            </p>
            <p>Or copy this link in your browser:</p>
            <p>${verificationLink}</p>
            <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 New Novel. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
