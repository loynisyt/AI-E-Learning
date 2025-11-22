'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    trialDays: 0,
    description: 'Perfect for getting started',
    icon: ShieldIcon,
    features: ['Access to basic courses', 'Community support', 'Limited AI tools'],
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    trialDays: 14,
    description: 'All courses unlocked',
    icon: RocketLaunchIcon,
    features: [
      'All courses unlocked',
      'Priority support',
      'Advanced AI tools',
      'Certificate of completion',
    ],
    highlighted: true,
  },
  {
    id: 'premium-plus',
    name: 'Premium+',
    price: 49,
    trialDays: 14,
    description: 'Everything + mentoring',
    icon: StarIcon,
    features: [
      'Everything in Premium',
      '1-on-1 mentoring',
      'Exclusive projects',
      'Career guidance',
    ],
    highlighted: false,
  },
];

export default function PlanSelector() {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

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

  const handleSelectPlan = async (planId) => {
    setSelectedPlan(planId);

    // For free plan, just redirect
    if (planId === 'free') {
      router.push('/dashboard');
      return;
    }

    // For paid plans, check authentication
    if (!user) {
      router.push(`/login?plan=${planId}&redirect=checkout`);
      return;
    }

    // Redirect to checkout with selected plan
    router.push(`/checkout?plan=${planId}`);
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6C4BFF 0%, #8a7bff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
          }}
        >
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Start with a 2-week free trial on premium plans. No card required.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Plans Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card
                onClick={() => handleSelectPlan(plan.id)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid #6C4BFF'
                    : plan.highlighted
                      ? '2px solid #e1e5e9'
                      : '1px solid #e1e5e9',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: isSelected
                    ? 'rgba(108, 75, 255, 0.05)'
                    : plan.highlighted
                      ? '#f9f7ff'
                      : '#ffffff',
                  boxShadow: isSelected
                    ? '0 12px 40px rgba(108,75,255,0.2)'
                    : plan.highlighted
                      ? '0 4px 15px rgba(108,75,255,0.1)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isSelected
                      ? '0 16px 50px rgba(108,75,255,0.25)'
                      : '0 8px 25px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 20,
                      fontWeight: 700,
                      height: 28,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3 }}>
                  {/* Icon & Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'rgba(108, 75, 255, 0.1)',
                        borderRadius: '12px',
                      }}
                    >
                      <IconComponent sx={{ color: '#6C4BFF', fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {plan.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ my: 3, p: 2, backgroundColor: 'rgba(108, 75, 255, 0.05)', borderRadius: '12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#6C4BFF' }}>
                        ${plan.price}
                      </Typography>
                      {plan.price > 0 && (
                        <Typography variant="body2" color="textSecondary">
                          /month
                        </Typography>
                      )}
                    </Box>

                    {/* Trial Badge */}
                    {plan.trialDays > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          fontWeight: 600,
                          color: '#6C4BFF',
                        }}
                      >
                        ✓ {plan.trialDays}-day free trial
                      </Typography>
                    )}
                  </Box>

                  {/* Features */}
                  <Box sx={{ mb: 3 }}>
                    {plan.features.map((feature, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                        <CheckCircleIcon
                          sx={{
                            color: '#6C4BFF',
                            fontSize: 18,
                            mt: 0.3,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* CTA Button */}
                  <Button
                    variant={isSelected ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    sx={{
                      py: 1.3,
                      fontWeight: 700,
                      borderRadius: '12px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #6C4BFF 0%, #8a7bff 100%)'
                        : 'transparent',
                      color: isSelected ? 'white' : '#6C4BFF',
                      boxShadow: isSelected
                        ? '0 6px 20px rgba(108,75,255,0.3)'
                        : 'none',
                      '&:hover': {
                        boxShadow: isSelected
                          ? '0 10px 30px rgba(108,75,255,0.4)'
                          : '0 4px 12px rgba(108,75,255,0.2)',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : plan.id === 'free' ? (
                      'Start Free'
                    ) : isSelected ? (
                      `Get ${plan.name}`
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>

                  {/* Security Note */}
                  {plan.id !== 'free' && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 2,
                        textAlign: 'center',
                        color: 'textSecondary',
                      }}
                    >
                      🔒 Secure checkout with Stripe
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Plan Summary */}
      {selectedPlanData && selectedPlan !== 'free' && (
        <Box
          sx={{
            p: 3,
            backgroundColor: 'rgba(108, 75, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(108, 75, 255, 0.2)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            You selected <strong>{selectedPlanData.name}</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Start your {selectedPlanData.trialDays}-day free trial today. Cancel anytime, no card required.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
