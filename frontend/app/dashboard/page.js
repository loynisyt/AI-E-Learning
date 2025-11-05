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
  Button
} from '@mui/material';

import AIPanel from '@/components/AIPanel/AIPanel';
import { directus } from '@/lib/directus';
import { getAuthInstance, signOut as firebaseSignOut } from '@/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

const Login = dynamic(() => import('@/app/login/page'), { ssr: false });

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [user, setUser] = useState(null);       // Firebase User object
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);

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

  // Load data: Directus courses + backend lessons
  useEffect(() => {
    async function loadData() {
      try {
        // load courses from Directus if client available
        if (directus && typeof directus.items === 'function') {
          try {
            const coursesResp = await directus.items('courses').readByQuery();
            setCourses(coursesResp?.data ?? []);
          } catch (dErr) {
            console.warn('Directus fetch failed:', dErr);
            // fallback: leave courses empty
          }
        }

        // load lessons from backend through BACKEND_URL env
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        if (typeof BACKEND_URL === 'string' && BACKEND_URL.length > 0) {
          try {
            const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/lessons`);
            if (res.ok) {
              const data = await res.json();
              setLessons(Array.isArray(data) ? data : []);
            } else {
              console.warn('Backend lessons fetch failed with status', res.status);
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

  // handle sign out
  async function handleSignOut() {
    try {
      await firebaseSignOut();
      // optional: call backend to clear session cookie
      // await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
      setUser(null);
    } catch (err) {
      console.error('Sign-out failed', err);
    }
  }

  if (loadingAuth) return null; // or a loader component

  // if not authenticated -> show login page (client-only)
  if (!user) return <Login />;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box>
          <Typography variant="body2" sx={{ mr: 2, display: 'inline-block' }}>
            {user.email || user.displayName || 'You'}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleSignOut}>Sign out</Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>My Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Overall Completion</Typography>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mt: 1,
                    '& .MuiLinearProgress-bar': { borderRadius: 4 },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>65% Complete</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Typography variant="body1"><strong>Courses:</strong> {courses.length}</Typography>
              <Typography variant="body1"><strong>Lessons:</strong> {lessons.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Courses</Typography>
              <Typography variant="body2" color="text.secondary">
                {courses.length > 0 ? `You have ${courses.length} courses available.` : 'No courses available yet.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Typography variant="body2" color="text.secondary">Access your learning materials and continue where you left off.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!isMobile && (
        <Box sx={{ mt: 3 }}>
          <AIPanel />
        </Box>
      )}
    </Box>
  );
}
