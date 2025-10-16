import express from 'express';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation middleware
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Submit contact form
router.post('/submit', validateContact, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;
    const userId = req.user?.id || null;

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
        status: 'NEW'
      }
    });

    // Send email notification
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: 'support@brainwave.com', // Replace with your support email
        subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's contact submissions
router.get('/my-submissions', authenticate, async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      contacts
    });
  } catch (error) {
    next(error);
  }
});

export default router;
