import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { divineBagua, generateBaguaReading } from '../services/bagua.service';
import { prisma } from '../config/db';

const router = Router();

// POST /api/bagua/divine
router.post('/divine', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { question, method, manualLines } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: '请输入您想问的问题', code: 'VALIDATION', status: 400 });
    }

    const input = {
      question: question.trim(),
      method: method || 'AUTO',
      manualLines,
    };

    const result = divineBagua(input);

    let reading = null;
    if (req.userId) {
      reading = await prisma.baguaReading.create({
        data: {
          userId: req.userId,
          question: input.question,
          method: input.method,
          manualLines: JSON.stringify(input.manualLines || []),
          primaryHexagram: result.primaryHexagram.number,
          primaryName: result.primaryHexagram.name,
          primaryPinyin: result.primaryHexagram.pinyin,
          changedHexagram: result.changedHexagram?.number || null,
          changedName: result.changedHexagram?.name || null,
          changingLines: JSON.stringify(result.changingLines),
          trigramUpper: result.primaryHexagram.upperTrigram,
          trigramLower: result.primaryHexagram.lowerTrigram,
          judgment: result.primaryHexagram.judgment,
          image: result.primaryHexagram.image,
          lineTexts: JSON.stringify(result.primaryHexagram.lines),
        },
      });
    }

    res.json({
      readingId: reading?.id || null,
      ...result,
      readingText: generateBaguaReading(result, input.question),
    });
  } catch (err) {
    console.error('Bagua divine error:', err);
    res.status(500).json({ message: '占卜失败，请稍后再试', code: 'CALCULATION_ERROR', status: 500 });
  }
});

// GET /api/bagua/readings
router.get('/readings', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.json({ data: [], total: 0, page: 1, limit: 10 });
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.baguaReading.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.baguaReading.count({ where: { userId: req.userId } }),
    ]);
    res.json({ data, total, page, limit });
  } catch {
    res.status(500).json({ message: '获取历史记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/bagua/readings/:id
router.get('/readings/:id', async (req, res: Response) => {
  try {
    const reading = await prisma.baguaReading.findUnique({ where: { id: req.params.id } });
    if (!reading) return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    res.json(reading);
  } catch {
    res.status(500).json({ message: '获取记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

export default router;
