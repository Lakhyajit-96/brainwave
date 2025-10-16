import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get subscription plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'FREE',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'Basic AI features',
          '10 AI requests per day',
          'Email support',
          'Access to community'
        ],
        limits: {
          aiRequests: 10,
          storage: '100MB'
        }
      },
      {
        id: 'BASIC',
        name: 'Basic',
        price: 9.99,
        interval: 'month',
        features: [
          'All Free features',
          '100 AI requests per day',
          'Priority email support',
          'Advanced analytics',
          'Custom branding'
        ],
        limits: {
          aiRequests: 100,
          storage: '1GB'
        },
        popular: false
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        price: 29.99,
        interval: 'month',
        features: [
          'All Basic features',
          'Unlimited AI requests',
          '24/7 priority support',
          'Advanced AI models',
          'API access',
          'Team collaboration'
        ],
        limits: {
          aiRequests: -1,
          storage: '10GB'
        },
        popular: true
      },
      {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 99.99,
        interval: 'month',
        features: [
          'All Premium features',
          'Dedicated account manager',
          'Custom AI training',
          'SLA guarantee',
          'Advanced security',
          'Unlimited storage'
        ],
        limits: {
          aiRequests: -1,
          storage: 'Unlimited'
        },
        popular: false
      }
    ];

    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
});

// Get current subscription
router.get('/current', authenticate, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
});

// Update subscription plan
router.post('/update', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'].includes(plan)) {
      throw new AppError('Invalid plan', 400);
    }

    const subscription = await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        plan,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        cancelAtPeriodEnd: true,
        status: 'CANCELED'
      }
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      subscription
    });
  } catch (error) {
    next(error);
  }
});

export default router;
