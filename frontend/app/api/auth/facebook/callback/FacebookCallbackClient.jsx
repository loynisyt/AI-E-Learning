'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthClient from '@/lib/authClient';
import { Box, CircularProgress, Alert, Button } from '@mui/material';

export default function FacebookCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Exchange code with backend (backend will exchange with Facebook)
        const response = await fetch('https://127.0.0.1:4000/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: code }), // Assuming code is the idToken for now
          credentials: 'include',
        });

        if (response.ok) {
          setStatus('success');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError('Failed to authenticate with backend');
          setStatus('error');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err.message || 'Failed to process callback');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: 2
    }}>
      {status === 'processing' && (
        <>
          <CircularProgress size={60} />
          <p>Signing you in with Facebook...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <Alert severity="success">
            Successfully signed in! Redirecting to dashboard...
          </Alert>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert severity="error">
            {error || 'An error occurred during sign-in'}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </>
      )}
    </Box>
  );
}
