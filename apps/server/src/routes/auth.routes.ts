import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: '请填写完整信息', code: 'VALIDATION', status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: '该邮箱已被注册', code: 'EMAIL_EXISTS', status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as any);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: '注册失败，请稍后再试', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: '请输入邮箱和密码', code: 'VALIDATION', status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误', code: 'INVALID_CREDENTIALS', status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: '邮箱或密码错误', code: 'INVALID_CREDENTIALS', status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as any);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: '登录失败，请稍后再试', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在', code: 'NOT_FOUND', status: 404 });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: '获取用户信息失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

export default router;
