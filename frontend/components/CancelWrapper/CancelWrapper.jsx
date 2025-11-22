'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import CancelClient with ssr: false (only runs in browser)
const CancelClient = dynamic(() => import('../CancelClient/CancelClient'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>,
});

export default function CancelWrapper() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
      <CancelClient />
    </Suspense>
  );
}
