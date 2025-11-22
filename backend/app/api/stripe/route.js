// backend/app/api/stripe/route.js

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const { authenticateSession } = require('../../../lib/auth');
const router = express.Router();

const prisma = new PrismaClient();

const STRIPE_PRICE_IDS = {
  premium: 'price_1STSNNQxJSkOR0hKXxJvZnJ7', // Replace with your actual price ID from Stripe
  'premium-plus': 'price_1STSNNQxJSkOR0hKqK8nL9M0', // Replace with your actual price ID from Stripe
};

// Create checkout session
router.post('/checkout', authenticateSession, async (req, res) => {
  try {
    const { planId, planName, amount, userEmail } = req.body;

    if (!planId || !userEmail) {
      return res.status(400).json({ error: 'Missing planId or userEmail' });
    }

    // Check that the userEmail matches the authenticated user email
    if (userEmail !== req.user.email) {
      return res.status(403).json({ error: 'User email does not match session user' });
    }

    if (planId === 'free') {
      return res.status(400).json({ error: 'Cannot checkout free plan' });
    }

    const priceId = STRIPE_PRICE_IDS[planId];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: {
        planId,
        planName,
        userEmail,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify session (for success page)
router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update user subscription status in database
      if (session.customer_email) {
        const user = await prisma.user.update({
          where: { email: session.customer_email },
          data: {
            subscription: session.metadata?.planId || 'premium',
            subscriptionStartDate: new Date(),
          },
        });
        return res.json({ success: true, user });
      }

      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle payment success
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured - webhook verification disabled');
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, secret);

    console.log('Webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful:', session);

      // Update user subscription status in database
      if (session.customer_email) {
        const user = await prisma.user.update({
          where: { email: session.customer_email },
          data: {
            subscription: session.metadata?.planId || 'premium',
            subscriptionStartDate: new Date(),
            stripeCustomerId: session.customer,
          },
        });
        console.log('User subscription updated:', user);
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log('Payment failed:', invoice);
      // Handle payment failure
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get subscription status
router.get('/subscription/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        subscription: true,
        subscriptionStartDate: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Subscription lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

