'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import CancelIcon from '@mui/icons-material/Cancel';

export default function CancelClient() {
  const router = useRouter();

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CancelIcon sx={{ fontSize: 80, color: '#ff6b6b', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        You cancelled the payment. No charges have been made to your account.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/checkout')}
          sx={{
            py: 1.5,
            px: 3,
            fontWeight: 600,
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(108,75,255,0.20)',
          }}
        >
          Try Again
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push('/')}
          sx={{
            py: 1.5,
            px: 3,
            fontWeight: 600,
            borderRadius: '8px',
          }}
        >
          Return Home
        </Button>
      </Box>

      <Typography variant="caption" sx={{ display: 'block', mt: 4, color: 'textSecondary' }}>
        If you have any questions, please{' '}
        <Button
          variant="text"
          size="small"
          onClick={() => router.push('/contact')}
          sx={{ color: '#6C4BFF', textDecoration: 'underline' }}
        >
          contact us
        </Button>
      </Typography>
    </Box>
  );
}
