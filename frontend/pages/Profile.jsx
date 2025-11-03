'use client';
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account settings and preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                John Doe
              </Typography>
              <Typography variant="body2" color="text.secondary">
                john.doe@example.com
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Username:</strong> john_doe
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Member since:</strong> January 2024
              </Typography>
              <Typography variant="body2">
                <strong>Courses completed:</strong> 3
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Statistics
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Total courses:</strong> 5
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Hours studied:</strong> 42
              </Typography>
              <Typography variant="body2">
                <strong>Achievements:</strong> 8
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
