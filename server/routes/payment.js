import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

// Create PayPal order
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { plan, amount } = req.body;

    if (!plan || !amount) {
      throw new AppError('Plan and amount are required', 400);
    }

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          },
          description: `Brainwave ${plan} Plan Subscription`
        }
      ],
      application_context: {
        return_url: `${process.env.VITE_APP_URL}/payment/success`,
        cancel_url: `${process.env.VITE_APP_URL}/payment/cancel`,
        brand_name: 'Brainwave',
        user_action: 'PAY_NOW'
      }
    };

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      orderId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href
    });
  } catch (error) {
    console.error('PayPal order creation error:', error.response?.data || error);
    next(new AppError('Failed to create PayPal order', 500));
  }
});

// Capture PayPal order
router.post('/capture-order', authenticate, async (req, res, next) => {
  try {
    const { orderId, plan } = req.body;

    if (!orderId || !plan) {
      throw new AppError('Order ID and plan are required', 400);
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      // Update subscription
      const subscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: {
          plan,
          status: 'ACTIVE',
          paypalSubscriptionId: orderId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        }
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: parseFloat(response.data.purchase_units[0].amount.value),
          currency: response.data.purchase_units[0].amount.currency_code,
          status: 'COMPLETED',
          paypalOrderId: orderId,
          paypalPayerId: response.data.payer.payer_id
        }
      });

      res.json({
        success: true,
        message: 'Payment successful',
        subscription,
        payment
      });
    } else {
      throw new AppError('Payment not completed', 400);
    }
  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error);
    next(new AppError('Failed to capture payment', 500));
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      payments: subscription?.payments || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
