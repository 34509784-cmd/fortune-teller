import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { calculateBazi } from '../services/bazi.service';
import { prisma } from '../config/db';

const router = Router();

// POST /api/bazi/calculate
router.post('/calculate', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { birthDate, birthTime, longitude, latitude, gender, calendarType } = req.body;
    if (!birthDate || !birthTime) {
      return res.status(400).json({ message: '请输入出生日期和时间', code: 'VALIDATION', status: 400 });
    }

    const input = {
      birthDate,
      birthTime,
      longitude: longitude || 120,
      latitude: latitude || 30,
      gender: gender || 'MALE',
      calendarType: calendarType || 'GREGORIAN',
    };

    const result = calculateBazi(input);

    // Save to DB if user is logged in
    let reading = null;
    if (req.userId) {
      reading = await prisma.baziReading.create({
        data: {
          userId: req.userId,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          longitude: input.longitude,
          latitude: input.latitude,
          gender: input.gender,
          calendarType: input.calendarType,
          fourPillars: JSON.stringify(result.fourPillars),
          dayMaster: result.dayMaster,
          tenGods: JSON.stringify(result.tenGods),
          fiveElements: JSON.stringify(result.fiveElements),
          daYun: JSON.stringify(result.daYun),
          shenSha: JSON.stringify(result.shenSha),
          naYin: JSON.stringify(result.naYin),
          elementBalance: JSON.stringify(result.elementBalance),
        },
      });
    }

    res.json({
      readingId: reading?.id || null,
      ...result,
      readingText: generateBaziReading(result),
    });
  } catch (err) {
    console.error('Bazi calculate error:', err);
    res.status(500).json({ message: '八字排盘计算失败', code: 'CALCULATION_ERROR', status: 500 });
  }
});

// GET /api/bazi/readings
router.get('/readings', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.json({ data: [], total: 0, page: 1, limit: 10 });
  }
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.baziReading.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.baziReading.count({ where: { userId: req.userId } }),
    ]);
    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: '获取历史记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// GET /api/bazi/readings/:id
router.get('/readings/:id', async (req: AuthRequest, res: Response) => {
  try {
    const reading = await prisma.baziReading.findUnique({ where: { id: req.params.id } });
    if (!reading) {
      return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    }
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: '获取记录失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// DELETE /api/bazi/readings/:id
router.delete('/readings/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: '请先登录', code: 'UNAUTHORIZED', status: 401 });
  }
  try {
    const reading = await prisma.baziReading.findUnique({ where: { id: req.params.id } });
    if (!reading || reading.userId !== req.userId) {
      return res.status(404).json({ message: '记录不存在', code: 'NOT_FOUND', status: 404 });
    }
    await prisma.baziReading.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '删除失败', code: 'INTERNAL_ERROR', status: 500 });
  }
});

// Template-based interpretation
function generateBaziReading(result: any): string {
  const { fourPillars, dayMaster, elementBalance, shenSha } = result;
  const elements: Record<string, string> = { wood: '🌳木', fire: '🔥火', earth: '⛰️土', metal: '⚔️金', water: '💧水' };

  let text = `## 八字排盘解读\n\n`;
  text += `### 📜 四柱八字\n`;
  text += `- **年柱**: ${fourPillars.year.stem}${fourPillars.year.branch} (${result.naYin.year})\n`;
  text += `- **月柱**: ${fourPillars.month.stem}${fourPillars.month.branch} (${result.naYin.month})\n`;
  text += `- **日柱**: ${fourPillars.day.stem}${fourPillars.day.branch} (${result.naYin.day})\n`;
  text += `- **时柱**: ${fourPillars.hour.stem}${fourPillars.hour.branch} (${result.naYin.hour})\n\n`;

  text += `### ☀️ 日主\n`;
  text += `您的日主为 **${dayMaster}**（${result.fiveElements[Object.keys(result.fiveElements)[0]] > 2 ? '身强' : '身弱'}），代表您的本质属性和核心能量。\n\n`;

  text += `### ⚖️ 五行平衡\n`;
  text += `${elementBalance.advice}\n\n`;

  if (shenSha && shenSha.length > 0) {
    text += `### 🌟 神煞\n`;
    shenSha.forEach((s: any) => {
      text += `- **${s.name}**（${s.pillar}柱）— ${s.type}\n`;
    });
    text += `\n`;
  }

  text += `### 🛤️ 大运走势\n`;
  result.daYun.slice(0, 4).forEach((dy: any) => {
    text += `- ${dy.startAge}-${dy.endAge}岁: ${dy.stem}${dy.branch} 大运\n`;
  });

  return text;
}

export default router;
