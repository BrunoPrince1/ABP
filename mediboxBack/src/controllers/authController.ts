import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection';
import { AppError } from '../middleware/errorHandler';
import type { User } from '../types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };

      const { rows: existing } = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email],
      );
      if (existing.length > 0) throw new AppError('E-mail já cadastrado', 409);

      const password_hash = await bcrypt.hash(password, 10);
      const { rows: [user] } = await pool.query<User>(
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
        [name, email, password_hash],
      );

      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
      );

      res.status(201).json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, token } });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const { rows } = await pool.query<User>(
        `SELECT * FROM users WHERE email = $1`,
        [email],
      );
      const user = rows[0];
      if (!user) throw new AppError('Credenciais inválidas', 401);

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new AppError('Credenciais inválidas', 401);

      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
      );

      res.json({
        success: true,
        data: { user: { id: user.id, name: user.name, email: user.email }, token },
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rows } = await pool.query<User>(
        `SELECT id, name, email, created_at FROM users WHERE id = $1`,
        [req.user!.sub],
      );
      if (!rows[0]) throw new AppError('Usuário não encontrado', 404);
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      next(err);
    }
  },
};
