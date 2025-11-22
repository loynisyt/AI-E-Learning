'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verify session with backend
    const verifySession = async () => {
      try {
        if (sessionId) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (response.ok) {
            setSuccess(true);
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 6,
      }}
    >
      {loading ? (
        <Typography>Processing your payment...</Typography>
      ) : success ? (
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: '#6C4BFF', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Thank you for your purchase. Your subscription is now active.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push('/dashboard')}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 8px 30px rgba(108,75,255,0.20)',
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc3545' }}>
            Payment Verification Failed
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 3 }}>
            We couldnt verify your payment. Please contact support.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/checkout')}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Container>
  );
}
