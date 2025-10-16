import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active content
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = {
      isActive: true,
      ...(type && { type })
    };

    const content = await prisma.content.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      content
    });
  } catch (error) {
    next(error);
  }
});

// Get content by type
router.get('/type/:type', async (req, res, next) => {
  try {
    const { type } = req.params;

    const content = await prisma.content.findMany({
      where: {
        type,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      content
    });
  } catch (error) {
    next(error);
  }
});

export default router;
