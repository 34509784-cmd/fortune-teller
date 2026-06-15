import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { calculateZodiacChart, generateZodiacReading } from '../services/zodiac.service';
import { prisma } from '../config/db';

const router = Router();

// POST /api/zodiac/chart
router.post('/chart', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { birthDateTime, longitude, latitude, houseSystem } = req.body;
    if (!birthDateTime) {
      return res.status(400).json({ message: '请输入出生日期和时间', code: 'VALIDATION', status: 400 });
    }

    const input = {
      birthDateTime,
      longitude: longitude || 120,
      latitude: latitude || 30,
      houseSystem: houseSystem || 'PLACIDUS',
    };

    const result = calculateZodiacChart(input);

    let reading = null;
    if (req.userId) {
      reading = await prisma.zodiacReading.create({
        data: {
          userId: req.userId,
          birthDateTime: input.birthDateTime,
          longitude: input.longitude,
          latitude: input.latitude,
          houseSystem: input.houseSystem,
          planets: JSON.stringify(result.planets),
          houses: JSON.stringify(result.houses),
          ascendant: result.ascendant,
          midheaven: result.midheaven,
          aspects: JSON.stringify(result.aspects),
          elements: JSON.stringify(result.elements),
          modalities: JSON.stringify(result.modalities),
          sunSign: result.sunSign,
          moonSign: result.moonSign,
        },
      });
    }

    res.json({
      readingId: reading?.id || null,
      ...result,
      readingText: generateZodiacReading(result),
    });
  } catch (err) {
    console.error('Zodiac chart error:', err);
    res.status(500).json({ message: '星盘计算失败', code: 'CALCULATION_ERROR', status: 500 });
  }
});

// GET /api/zodiac/readings
router.get('/readings', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.json({ data: [], total: 0, page: 1, limit: 10 });
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.zodiacReading.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.zodiacReading.count({ where: { userId: req.userId } }),
    ]);
    res.json({ data, total, page, limit });
  } catch {
    res.status(500).json({ message: '获取历史记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/zodiac/readings/:id
router.get('/readings/:id', async (req, res: Response) => {
  try {
    const reading = await prisma.zodiacReading.findUnique({ where: { id: req.params.id } });
    if (!reading) return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    res.json(reading);
  } catch {
    res.status(500).json({ message: '获取记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

export default router;
