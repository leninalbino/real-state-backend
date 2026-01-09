import { Request, Response } from 'express';
import { z } from 'zod';
import * as AuthService from './auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['buyer', 'agent', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const result = await AuthService.register(parsed.data);
    return res.status(201).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error registering user';
    const status = message === 'Email already in use' ? 409 : 500;
    return res.status(status).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const result = await AuthService.login(parsed.data.email, parsed.data.password);
    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid credentials';
    const status = message === 'User suspended' ? 403 : 401;
    return res.status(status).json({ message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    await AuthService.changePassword(
      req.user.userId,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    return res.json({ message: 'Password updated' });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error updating password';
    const status = message === 'Invalid credentials' ? 401 : 500;
    return res.status(status).json({ message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const result = await AuthService.requestPasswordReset(parsed.data.email);
    const isProduction = process.env.NODE_ENV === 'production';
    return res.json({
      message: 'If the account exists, a reset email was sent.',
      ...(isProduction ? {} : { token: result.token }),
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Error requesting reset' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    await AuthService.resetPassword(parsed.data.token, parsed.data.newPassword);
    return res.json({ message: 'Password reset' });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error resetting password';
    const status = message === 'Invalid or expired token' ? 400 : 500;
    return res.status(status).json({ message });
  }
};
