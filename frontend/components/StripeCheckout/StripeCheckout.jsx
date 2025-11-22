'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Box, CircularProgress, Typography, Alert, Card, CardContent } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function StripeCheckout({ planId, planName, price }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get plan from URL if not provided as props
  const urlPlanId = searchParams.get('plan');
  const finalPlanId = planId || urlPlanId;

  const planDetails = {
    free: {
      name: 'Free',
      price: 0,
      trialDays: 0,
      description: 'Access to basic courses',
      features: ['Access to basic courses', 'Community support', 'Limited AI tools'],
    },
    premium: {
      name: 'Premium',
      price: 2900,
      trialDays: 14,
      description: 'All courses unlocked',
      features: ['All courses unlocked', 'Priority support', 'Advanced AI tools', 'Certificate of completion'],
    },
    'premium-plus': {
      name: 'Premium+',
      price: 4900,
      trialDays: 14,
      description: 'Everything in Premium',
      features: ['Everything in Premium', '1-on-1 mentoring', 'Exclusive projects', 'Career guidance'],
    },
  };

  const plan = planDetails[finalPlanId] || planDetails.free;

  // Check user auth on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/session', { method: 'GET' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.log('User not authenticated');
      }
    };
    checkUser();
  }, []);

  const handleCheckout = async () => {
    if (finalPlanId === 'free') {
      // For free plan, just redirect to dashboard
      router.push('/dashboard');
      return;
    }

    if (!user) {
      // Redirect to login with return plan
      router.push(`/login?plan=${finalPlanId}&redirect=checkout`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session via backend API
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: finalPlanId,
          planName: plan.name,
          amount: plan.price,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        border: '2px solid #6C4BFF',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 60px rgba(108,75,255,0.15)',
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#6C4BFF', mb: 1 }}>
          {plan.name}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {plan.description}
        </Typography>

        <Box sx={{ my: 4, p: 2, backgroundColor: '#f0ebff', borderRadius: '12px' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#6C4BFF' }}>
            ${(plan.price / 100).toFixed(2)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {finalPlanId !== 'free' ? 'per month' : 'forever'}
          </Typography>
          {plan.trialDays > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                fontWeight: 700,
                color: '#6C4BFF',
              }}
            >
              ✓ {plan.trialDays}-day free trial • No card required
            </Typography>
          )}
        </Box>

        {/* Features List */}
        <Box sx={{ mb: 3 }}>
          {plan.features.map((feature, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#6C4BFF', mr: 2, fontSize: 20 }} />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!user && finalPlanId !== 'free' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You need to log in to subscribe to a paid plan.
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCheckout}
          disabled={loading || (finalPlanId !== 'free' && !user)}
          sx={{
            py: 1.8,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(108,75,255,0.25)',
            background: finalPlanId === 'free'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #6C4BFF 0%, #8a7bff 100%)',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(108,75,255,0.35)',
              transform: 'translateY(-3px)',
            },
            '&:disabled': {
              opacity: 0.6,
              cursor: 'not-allowed',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : finalPlanId === 'free' ? (
            'Get Started Free'
          ) : (
            `Subscribe to ${plan.name}`
          )}
        </Button>

        {finalPlanId !== 'free' && (
          <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'textSecondary' }}>
            🔒 Secure checkout powered by Stripe. Your payment information is safe.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
