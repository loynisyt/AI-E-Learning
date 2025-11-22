import React, { Suspense } from 'react';
import FacebookCallbackClient from './FacebookCallbackClient';

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacebookCallbackClient />
    </Suspense>
  );
}
