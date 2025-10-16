import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSubscriptions,
      totalRevenue,
      totalContacts,
      totalAIChats,
      waitlistCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.contact.count(),
      prisma.aIChat.count(),
      prisma.waitlist.count()
    ]);

    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
      where: { status: 'ACTIVE' }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalContacts,
        totalAIChats,
        waitlistCount,
        subscriptionsByPlan
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(skip)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all contacts
router.get('/contacts', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(skip)
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      success: true,
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update contact status
router.patch('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await prisma.contact.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Contact status updated',
      contact
    });
  } catch (error) {
    next(error);
  }
});

// Get waitlist
router.get('/waitlist', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [waitlist, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(skip)
      }),
      prisma.waitlist.count({ where })
    ]);

    res.json({
      success: true,
      waitlist,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Manage content
router.get('/content', async (req, res, next) => {
  try {
    const content = await prisma.content.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }]
    });

    res.json({
      success: true,
      content
    });
  } catch (error) {
    next(error);
  }
});

router.post('/content', async (req, res, next) => {
  try {
    const { type, title, description, imageUrl, order, isActive, metadata } = req.body;

    const content = await prisma.content.create({
      data: {
        type,
        title,
        description,
        imageUrl,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        metadata
      }
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    next(error);
  }
});

router.put('/content/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, title, description, imageUrl, order, isActive, metadata } = req.body;

    const content = await prisma.content.update({
      where: { id },
      data: {
        type,
        title,
        description,
        imageUrl,
        order,
        isActive,
        metadata
      }
    });

    res.json({
      success: true,
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/content/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.content.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
