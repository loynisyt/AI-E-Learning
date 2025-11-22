'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Grid, Card, CardContent, Button, useMediaQuery, useTheme, Paper } from '@mui/material';
import { directus } from '@/lib/directus';

export default function CourseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        // For now, using placeholder data directly instead of API calls
        setCourse({
          title: 'Introduction to Artificial Intelligence',
          description: 'A comprehensive course covering the fundamentals of AI and its applications in the real world.',
          level: 'Beginner',
          duration: '8 weeks'
        });

        setLessons([
          { 
            id: 'lesson-1', 
            title: 'Introduction to AI', 
            description: 'Learn the basics of artificial intelligence.',
            duration: '45 mins'
          },
          { 
            id: 'lesson-2', 
            title: 'What is AI?', 
            description: 'Understand the definition and types of AI.',
            duration: '30 mins'
          },
          { 
            id: 'lesson-3', 
            title: 'Machine Learning Fundamentals', 
            description: 'Explore the core concepts of machine learning.',
            duration: '60 mins'
          },
          { 
            id: 'lesson-4', 
            title: 'Deep Learning Basics', 
            description: 'Dive into neural networks and deep learning.',
            duration: '45 mins'
          },
          { 
            id: 'lesson-5', 
            title: 'AI Applications', 
            description: 'Discover real-world applications of AI.',
            duration: '50 mins'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch course', err);
        // Fallback to placeholders
        setLessons([
          { id: 'lesson-1', title: 'Introduction to AI', description: 'Learn the basics of artificial intelligence.' },
          { id: 'lesson-2', title: 'What is AI?', description: 'Understand the definition and types of AI.' },
          { id: 'lesson-3', title: 'Machine Learning Fundamentals', description: 'Explore the core concepts of machine learning.' },
          { id: 'lesson-4', title: 'Deep Learning Basics', description: 'Dive into neural networks and deep learning.' },
          { id: 'lesson-5', title: 'AI Applications', description: 'Discover real-world applications of AI.' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCourse();
  }, [id]);

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading course...</Typography></Box>;
  
  if (!course) return <Box sx={{ p: 3 }}><Typography>Course not found</Typography></Box>;

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            {course.title}
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
            {course.description}
          </Typography>
        </Box>

        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 3,
            borderBottom: '2px solid #764ba2',
            pb: 1 
          }}
        >
          Course Content
        </Typography>

        <Grid container spacing={3}>
          {lessons.map((lesson, index) => (
            <Grid item xs={12} key={lesson.id}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>{lesson.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {lesson.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main' }}>
                        Lesson {index + 1} • {lesson.duration || '30 mins'}
                      </Typography>
                    </Box>
                    <Button 
                      className='ml-3'
                      variant="contained" 
                      href={`/courses/${id}/lesson/${lesson.id}`}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        color: 'white',
                        boxShadow: '0 3px 5px 2px rgba(118, 75, 162, .3)',
                        
                      }}
                    >
                      Start Learning
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
