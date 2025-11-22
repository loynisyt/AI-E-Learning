import React, { Suspense } from 'react';
import GoogleCallbackClient from './GoogleCallbackClient';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackClient />
    </Suspense>
  );
}
