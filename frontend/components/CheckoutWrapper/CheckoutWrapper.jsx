'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import CheckoutClient with ssr: false (only runs in browser)
const CheckoutClient = dynamic(() => import('../CheckoutClient/CheckoutClient'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading checkout...</div>,
});

export default function CheckoutWrapper() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
