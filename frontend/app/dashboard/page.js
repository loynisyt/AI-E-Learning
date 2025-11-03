'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { directus } from '@/lib/directus';
import AIPanel from '@/components/AIPanel/AIPanel';
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
} from '@mui/material';

const Login = dynamic(() => import('@/app/login/page'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    async function loadData() {
      try {
        // Directus SDK: read items safely
        const coursesResp = await directus.items('courses').readByQuery();
        setCourses(coursesResp?.data ?? []);

        // Safe backend URL fallback (prevents "undefined/..." Invalid URL)
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

        // Only attempt fetch if BACKEND_URL is a non-empty string
        if (typeof BACKEND_URL === 'string' && BACKEND_URL.length > 0) {
          const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/lessons`);
          if (res.ok) {
            setLessons(await res.json());
          } else {
            console.error('Failed fetching lessons', res.status);
          }
        }
      } catch (err) {
        console.error('Dashboard load error', err);
      }
    }
    loadData();
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Login />;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Completion
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mt: 1,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  65% Complete
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Typography variant="body1">
                <strong>Courses:</strong> {courses.length}
              </Typography>
              <Typography variant="body1">
                <strong>Lessons:</strong> {lessons.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Courses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {courses.length > 0
                  ? `You have ${courses.length} courses available.`
                  : 'No courses available yet.'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access your learning materials and continue where you left off.
              </Typography>
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
