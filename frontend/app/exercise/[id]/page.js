'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useMediaQuery,
  useTheme,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CloudDownload,
  Code,
  SmartToy
} from '@mui/icons-material';
import { directus } from '@/lib/directus';

export default function ExerciseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [exercise, setExercise] = useState(null);
  const [aiTools, setAiTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const res = await directus.items('exercises').readOne(id);
        setExercise(res);
        if (res.ai_tools) {
          const toolsRes = await directus.items('ai_tools').readByQuery({ filter: { id: { _in: res.ai_tools } } });
          setAiTools(toolsRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch exercise', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchExercise();
  }, [id]);

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading exercise...</Typography></Box>;
  
  // If exercise not found, use placeholder data
  if (!exercise) {
    setExercise({
      title: 'Sample Exercise',
      docs: 'This is a placeholder exercise. Follow the steps below to complete the exercise.',
      assets: ['/sample-asset-1.zip', '/sample-asset-2.pdf']
    });
    setAiTools([
      {
        id: 'tool-1',
        name: 'AI Code Assistant',
        description: 'Get help with coding problems and receive instant feedback.',
        link: '/ai-coach'
      },
      {
        id: 'tool-2',
        name: 'AI Learning Guide',
        description: 'Interactive guide to help you understand complex concepts.',
        link: '/ai-panel'
      }
    ]);
  }

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
          borderRadius: 2, 
          bgcolor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          {exercise.title}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card 
              elevation={2}
              sx={{ 
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>
                  Exercise Overview
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {exercise.docs}
                </Typography>
                <Box 
                  sx={{ 
                    height: 400,
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    background: 'linear-gradient(45deg, #1a1a1a 30%, #2a2a2a 90%)',
                    mb: 3
                  }}
                >
                  <Code sx={{ fontSize: 60, mb: 2, color: '#764ba2' }} />
                  <Typography variant="h6">Interactive Exercise Environment</Typography>
                  <Typography variant="body2" color="grey.400">
                    Code, test, and get instant feedback
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card 
              elevation={2}
              sx={{ 
                background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                mb: 3
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>
                  Exercise Resources
                </Typography>
                <Grid container spacing={2}>
                  {exercise.assets && exercise.assets.map((asset, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        href={asset}
                        download
                        sx={{
                          borderColor: '#764ba2',
                          color: '#764ba2',
                          '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.04)'
                          }
                        }}
                      >
                        Download Resource {index + 1}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={2}
              sx={{ 
                background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                mb: 3,
                position: 'sticky',
                top: 24
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>
                  AI Learning Tools
                </Typography>
                <List>
                  {aiTools.map(tool => (
                    <ListItem key={tool.id} disablePadding>
                      <ListItemButton 
                        href={tool.link}
                        target="_blank"
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(118, 75, 162, 0.1)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <SmartToy sx={{ color: '#764ba2' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={tool.name}
                          secondary={tool.description}
                          primaryTypographyProps={{
                            fontWeight: 'medium'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                    }
                  }}
                  onClick={() => window.location.href = '/ai-coach'}
                >
                  Get AI Help
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
