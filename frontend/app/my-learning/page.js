'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { directus } from '@/lib/directus';

export default function MyLearning() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        // Assume user progress is stored in Directus user_progress
        const progressRes = await directus.items('user_progress').readByQuery();
        const courseIds = [...new Set(progressRes?.data?.map(p => p.course_id))];
        if (courseIds.length > 0) {
          const coursesRes = await directus.items('courses').readByQuery({ filter: { id: { _in: courseIds } } });
          setCourses(coursesRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch my learning', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading my learning...</Typography></Box>;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>My Learning</Typography>
      <Grid container spacing={3}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No courses in progress yet.</Typography>
          </Grid>
        ) : (
          courses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Progress: 50% {/* Compute from user_progress */}
                  </Typography>
                  <LinearProgress variant="determinate" value={50} sx={{ mb: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
