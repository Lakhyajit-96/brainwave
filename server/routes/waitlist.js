import express from 'express';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation middleware
const validateWaitlist = [
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim()
];

// Join waitlist
router.post('/join', validateWaitlist, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, name, source } = req.body;

    // Check if already on waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email }
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'You are already on the waitlist!',
        alreadyExists: true
      });
    }

    // Add to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        name,
        source,
        status: 'PENDING'
      }
    });

    // Send welcome email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Welcome to Brainwave Waitlist!',
        html: `
          <h2>Thank you for joining the Brainwave waitlist!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We're excited to have you on board. You'll be among the first to know when we launch new features.</p>
          <p>Stay tuned for updates!</p>
          <br>
          <p>Best regards,<br>The Brainwave Team</p>
        `
      });
    } catch (emailError) {
      console.error('Waitlist email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist!',
      waitlistEntry: {
        id: waitlistEntry.id,
        email: waitlistEntry.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get waitlist count
router.get('/count', async (req, res, next) => {
  try {
    const count = await prisma.waitlist.count({
      where: { status: 'PENDING' }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
});

export default router;
