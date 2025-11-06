'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, useMediaQuery, useTheme } from '@mui/material';
import { directus } from '@/lib/directus';

export default function Courses() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await directus.items('courses').readByQuery();
        let fetchedCourses = res?.data || [];
        if (fetchedCourses.length === 0) {
          // Placeholder course for testing
          fetchedCourses = [
            {
              id: 'placeholder-course-1',
              title: 'Introduction to AI Learning',
              description: 'Learn the basics of AI and machine learning with hands-on exercises.',
              thumbnail: '/ai.png',
            },

              {
              id: 'placeholder-course-2',
              title: 'AI for Beginners',
              description: 'A beginner-friendly course to get started with AI technologies.',
              thumbnail: '/ai2.jpg',
            },
              {
              id: 'placeholder-course-3',
              title: 'Advanced AI Concepts',
              description: 'Learn advanced AI concepts and techniques with practical examples.',
              thumbnail: '/ai3.jpg',
            },
          ];
        }
        setCourses(fetchedCourses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
        // Fallback to placeholder
        setCourses([
          {
            id: 'placeholder-course-1',
            title: 'Introduction to AI Learning',
            description: 'Learn the basics of AI and machine learning with hands-on exercises.',
            thumbnail: '/ai.png',
          },
               {
              id: 'placeholder-course-2',
              title: 'AI for Beginners',
              description: 'A beginner-friendly course to get started with AI technologies.',
              thumbnail: '/ai2.jpg',
            },
              {
              id: 'placeholder-course-3',
              title: 'Advanced AI Concepts',
              description: 'Learn advanced AI concepts and techniques with practical examples.',
              thumbnail: '/ai3.jpg',
            },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading courses...</Typography></Box>;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>Courses</Typography>
      <Grid container spacing={3}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No courses available yet.</Typography>
          </Grid>
        ) : (
          courses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ height: 250 }}
                  component="img"
                  image={course.thumbnail || '/placeholder.jpg'}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Button variant="contained" fullWidth href={`/courses/${course.id}`}>
                    View Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
