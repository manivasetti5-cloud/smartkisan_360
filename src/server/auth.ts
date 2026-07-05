import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { readDb, writeDb } from './db';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SIGNING_KEY_360';

// Strong password validation helper
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasMixedCase) {
    return { isValid: false, message: 'Password must contain both uppercase and lowercase letters.' };
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character (e.g. !, @, #, $, %).' };
  }
  return { isValid: true, message: 'Password is secure.' };
}

// Generate a random 6-digit OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via MSG91 (SMS) or Resend (Email)
export async function sendOtpNotification(
  identifier: string, // Email or Phone number
  otp: string,
  isEmail: boolean
): Promise<{ success: boolean; provider: string; devMode: boolean; deliveryError?: string }> {
  const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

  if (isEmail && isResendConfigured) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SmartKisan 360 <onboarding@resend.dev>',
          to: identifier,
          subject: 'SmartKisan 360 - OTP Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #10b981; text-align: center;">SmartKisan 360 Secure Auth</h2>
              <p>Hello,</p>
              <p>Your one-time password (OTP) for verification is below. This OTP is valid for <strong>5 minutes</strong>.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #6b7280;">If you did not request this, please ignore this email. Do not share this OTP with anyone.</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        return { success: true, provider: 'Resend', devMode: false };
      } else {
        const errorText = await response.text();
        let errMsg = 'Email delivery failed.';
        try {
          const parsedErr = JSON.parse(errorText);
          if (parsedErr.message) {
            errMsg = parsedErr.message;
          }
        } catch (_) {}
        console.warn('Resend API Warning (Falling back to Sandbox mode):', errMsg);
        return { success: true, provider: 'ConsoleLogger', devMode: true, deliveryError: errMsg };
      }
    } catch (err: any) {
      console.warn('Error calling Resend API (Falling back to Sandbox mode):', err.message || err);
      return { success: true, provider: 'ConsoleLogger', devMode: true, deliveryError: err.message || 'Network error delivering email.' };
    }
  }

  // Fallback to Development Console Logging
  console.log('\n=============================================');
  console.log(`[DEV MODE] OTP Generated for: ${identifier}`);
  console.log(`OTP Code: ${otp}`);
  console.log('Please enter this code in the frontend input box.');
  console.log('=============================================\n');

  return { success: true, provider: 'ConsoleLogger', devMode: true };
}

// Express authentication middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token is expired or invalid' });
  }
}

export function generateJwtToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
