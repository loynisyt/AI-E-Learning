'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Crown } from '@/assets/icons';
import { directus } from '@/lib/directus';
import { getAuthInstance, signOut as firebaseSignOut } from '@/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

const Login = dynamic(() => import('@/app/login/page'), { ssr: false });

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);
  const [navOpen, setNavOpen] = useState(!isMobile);

  // Auth listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let auth;
    try {
      auth = getAuthInstance();
    } catch (err) {
      console.warn('Firebase client not initialized (server rendering).', err);
      setLoadingAuth(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setLoadingAuth(false);

      if (u) {
        try {
          const idToken = await u.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include',
          });
        } catch (err) {
          console.error('Failed to exchange idToken with backend:', err);
        }
      }
    });

    return () => unsub();
  }, []);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        if (directus && typeof directus.items === 'function') {
          try {
            const coursesResp = await directus.items('courses').readByQuery();
            setCourses(coursesResp?.data ?? []);
          } catch (dErr) {
            console.warn('Directus fetch failed:', dErr);
          }
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        if (BACKEND_URL) {
          try {
            const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/lessons`);
            if (res.ok) {
              const data = await res.json();
              setLessons(Array.isArray(data) ? data : []);
            }
          } catch (bErr) {
            console.warn('Backend lessons fetch error', bErr);
          }
        }
      } catch (err) {
        console.error('Dashboard load error', err);
        setError(err.message || String(err));
      }
    }

    loadData();
  }, []);

  async function handleSignOut() {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (err) {
      console.error('Sign-out failed', err);
    }
  }

  if (loadingAuth) return null;
  if (!user) return <Login />;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Learning', path: '/my-learning' },
    { label: 'Courses', path: '/courses' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }} className="p-6">
      <Box className="mt-6" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        
      </Box>

    

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{  background: 'linear-gradient(135deg, #8639ebff 0%, #4806abff 40%, #3c16c4ff 100%)', color: 'white', cursor: 'pointer',height:"100%" }} onClick={() => window.location.href = '/settings'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Current Plan: Free</Typography>
                  <Typography variant="body2">Upgrade for unlimited access</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button variant="contained" sx={{ backgroundColor: 'white', color: 'black' }}>
                    Upgrade
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => window.location.href = '/my-learning'}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Continue Current Course</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexGrow: 1 }}>
                <Box sx={{ width: 60, height: 40, bgcolor: 'grey.300', mr: 2 }} />
                <Box>
                  <Typography variant="body1">Course Title</Typography>
                  <LinearProgress variant="determinate" value={50} sx={{ mt: 1 }} />
                  <Typography variant="body2">50% Complete</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => window.location.href = '/courses'}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Browse AI Tools</Typography>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>Explore tools to enhance your learning.</Typography>
              <Button variant="outlined" sx={{ mt: 1, alignSelf: 'flex-start' }}>Browse</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ cursor: 'pointer', height:"100%",  }} onClick={() => window.location.href = '/courses'}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Courses</Typography>
              <Grid container spacing={2}>
                {courses.slice(0, 3).map(course => (
                  <Grid item xs={12} sm={4} key={course.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ flexGrow: 1 }}>{course.title}</Typography>
                        <LinearProgress variant="determinate" value={30} sx={{ mt: 1 }} />
                        <Typography variant="body2">30% Complete</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    

        <Box sx={{ alignItems: 'center', mt: 4, justifyContent: 'flex-end' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user.email || user.displayName || 'You'}
          </Typography>
          <Button variant="outlined" size="medium"   onClick={handleSignOut}>Sign out</Button>
        </Box>


    </Box>
  );
}
