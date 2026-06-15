import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { calculateQimen, generateQimenReading } from '../services/qimen.service';
import { prisma } from '../config/db';

const router = Router();

// POST /api/qimen/calculate
router.post('/calculate', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { queryDateTime, method } = req.body;
    if (!queryDateTime) {
      return res.status(400).json({ message: '请输入查询日期和时间', code: 'VALIDATION', status: 400 });
    }

    const input = { queryDateTime, method: method || 'CHAIBU' };
    const result = calculateQimen(input);

    let reading = null;
    if (req.userId) {
      reading = await prisma.qimenReading.create({
        data: {
          userId: req.userId,
          queryDateTime: input.queryDateTime,
          method: input.method,
          juNumber: result.juNumber,
          yinYangDun: result.yinYangDun,
          palaces: JSON.stringify(result.palaces),
          zhiFu: result.zhiFu,
          zhiShi: result.zhiShi,
          eightDoors: JSON.stringify(result.eightDoors),
          nineStars: JSON.stringify(result.nineStars),
          eightGods: JSON.stringify(result.eightGods),
        },
      });
    }

    res.json({
      readingId: reading?.id || null,
      ...result,
      readingText: generateQimenReading(result),
    });
  } catch (err) {
    console.error('Qimen calculate error:', err);
    res.status(500).json({ message: '奇门排盘计算失败', code: 'CALCULATION_ERROR', status: 500 });
  }
});

// GET /api/qimen/readings
router.get('/readings', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.json({ data: [], total: 0, page: 1, limit: 10 });
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.qimenReading.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.qimenReading.count({ where: { userId: req.userId } }),
    ]);
    res.json({ data, total, page, limit });
  } catch {
    res.status(500).json({ message: '获取历史记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/qimen/readings/:id
router.get('/readings/:id', async (req, res: Response) => {
  try {
    const reading = await prisma.qimenReading.findUnique({ where: { id: req.params.id } });
    if (!reading) return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    res.json(reading);
  } catch {
    res.status(500).json({ message: '获取记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

export default router;
