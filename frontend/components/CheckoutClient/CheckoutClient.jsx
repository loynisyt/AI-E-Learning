'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme, useMediaQuery } from '@mui/material';
import { Suspense } from 'react';
import PlanSelector from '../../components/PlanSelector/PlanSelector';
import StripeCheckout from '../../components/StripeCheckout/StripeCheckout';

export default function CheckoutClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchParams = useSearchParams();
  const selectedPlan = searchParams ? searchParams.get('plan') : null;

  return (
    <div
      style={{
        padding: isMobile ? '1rem' : '2rem',
        width: '100%',
      }}
    >
      {!selectedPlan ? (
        <Suspense fallback={<div>Loading plans...</div>}>
          <PlanSelector />
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading checkout...</div>}>
          <StripeCheckout />
        </Suspense>
      )}
    </div>
  );
}
