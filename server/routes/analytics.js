import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Track event
router.post('/track', async (req, res, next) => {
  try {
    const { event, page, metadata } = req.body;
    const userId = req.user?.id || null;

    await prisma.analytics.create({
      data: {
        userId,
        event,
        page,
        metadata
      }
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user analytics
router.get('/user', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate, event } = req.query;

    const where = {
      userId: req.user.id,
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(event && { event })
    };

    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const eventCounts = await prisma.analytics.groupBy({
      by: ['event'],
      where: { userId: req.user.id },
      _count: true
    });

    res.json({
      success: true,
      analytics,
      eventCounts
    });
  } catch (error) {
    next(error);
  }
});

export default router;
