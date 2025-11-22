'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import SuccessClient with ssr: false (only runs in browser)
const SuccessClient = dynamic(() => import('../SuccessClient/SuccessClient'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Processing payment...</div>,
});

export default function SuccessWrapper() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
