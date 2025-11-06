'use client';

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

export default function Notifications() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>Notifications</Typography>
      <Typography variant="body1">No new notifications.</Typography>
    </Box>
  );
}
