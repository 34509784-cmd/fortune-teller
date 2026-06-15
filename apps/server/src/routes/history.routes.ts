import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

const router = Router();

// GET /api/history — unified history across all modules
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const userId = req.userId!;

    // Fetch all reading types in parallel
    const [bazi, bagua, qimen, zodiac] = await Promise.all([
      prisma.baziReading.findMany({
        where: { userId },
        select: { id: true, createdAt: true, dayMaster: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.baguaReading.findMany({
        where: { userId },
        select: { id: true, createdAt: true, primaryName: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qimenReading.findMany({
        where: { userId },
        select: { id: true, createdAt: true, yinYangDun: true, juNumber: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.zodiacReading.findMany({
        where: { userId },
        select: { id: true, createdAt: true, sunSign: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Merge and sort by createdAt descending
    const allReadings = [
      ...bazi.map(r => ({ ...r, module: 'bazi' as const, summary: `八字: 日主${r.dayMaster}` })),
      ...bagua.map(r => ({ ...r, module: 'bagua' as const, summary: `八卦: ${r.primaryName}` })),
      ...qimen.map(r => ({ ...r, module: 'qimen' as const, summary: `奇门: ${r.yinYangDun}${r.juNumber}局` })),
      ...zodiac.map(r => ({ ...r, module: 'zodiac' as const, summary: `星座: ${r.sunSign}` })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allReadings.length;
    const data = allReadings.slice((page - 1) * limit, page * limit);

    res.json({ data, total, page, limit });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: '获取历史记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/history/:id — get specific reading by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Try each table
    const tables = [
      prisma.baziReading.findFirst({ where: { id, userId } }),
      prisma.baguaReading.findFirst({ where: { id, userId } }),
      prisma.qimenReading.findFirst({ where: { id, userId } }),
      prisma.zodiacReading.findFirst({ where: { id, userId } }),
    ];

    const results = await Promise.all(tables);
    const reading = results.find(Boolean);

    if (!reading) {
      return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    }

    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: '获取记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

export default router;
