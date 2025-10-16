import express from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { authenticate, checkSubscription } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

// AI Chat completion
router.post('/chat', authenticate, aiLimiter, async (req, res, next) => {
  try {
    const { prompt, model = 'gpt-4' } = req.body;

    if (!prompt) {
      throw new AppError('Prompt is required', 400);
    }

    // Check daily AI request limit based on subscription
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayChats = await prisma.aIChat.count({
      where: {
        userId: req.user.id,
        createdAt: { gte: today }
      }
    });

    const limits = {
      FREE: 10,
      BASIC: 100,
      PREMIUM: -1,
      ENTERPRISE: -1
    };

    const userLimit = limits[req.user.subscription?.plan || 'FREE'];

    if (userLimit !== -1 && todayChats >= userLimit) {
      throw new AppError('Daily AI request limit reached. Please upgrade your plan.', 429);
    }

    // Make OpenRouter API call
    const completion = await openai.chat.completions.create({
      model: model === 'gpt-4' ? 'openai/gpt-4' : 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Brainwave AI, a helpful and intelligent assistant integrated into the Brainwave platform. Provide clear, concise, and accurate responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      headers: {
        'HTTP-Referer': process.env.VITE_APP_URL || 'http://localhost:3000',
        'X-Title': 'Brainwave AI'
      }
    });

    const response = completion.choices[0].message.content;
    const tokens = completion.usage.total_tokens;

    // Save chat to database
    const chat = await prisma.aIChat.create({
      data: {
        userId: req.user.id,
        prompt,
        response,
        model,
        tokens
      }
    });

    res.json({
      success: true,
      response,
      tokens,
      chatId: chat.id,
      remainingRequests: userLimit === -1 ? 'unlimited' : userLimit - todayChats - 1
    });
  } catch (error) {
    if (error.response?.status === 429) {
      next(new AppError('OpenAI rate limit reached. Please try again later.', 429));
    } else {
      next(error);
    }
  }
});

// Get AI chat history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const chats = await prisma.aIChat.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.aIChat.count({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      chats,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// Delete chat history
router.delete('/history/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await prisma.aIChat.findUnique({
      where: { id }
    });

    if (!chat || chat.userId !== req.user.id) {
      throw new AppError('Chat not found', 404);
    }

    await prisma.aIChat.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// AI Image generation (Premium feature)
router.post('/generate-image', authenticate, checkSubscription('PREMIUM'), aiLimiter, async (req, res, next) => {
  try {
    const { prompt, size = '1024x1024' } = req.body;

    if (!prompt) {
      throw new AppError('Prompt is required', 400);
    }

    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size
    });

    res.json({
      success: true,
      imageUrl: image.data[0].url
    });
  } catch (error) {
    next(error);
  }
});

export default router;
