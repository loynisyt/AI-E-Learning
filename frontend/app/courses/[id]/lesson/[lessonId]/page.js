'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  useMediaQuery, 
  useTheme, 
  Tabs, 
  Tab,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  PlayCircle, 
  Description, 
  CloudDownload, 
  Code, 
  SmartToy, 
  Psychology 
} from '@mui/icons-material';
import { directus } from '@/lib/directus';

export default function LessonDetail() {
  const { id, lessonId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await directus.items('lessons').readOne(lessonId);
        if (!res) throw new Error('Lesson not found');
        setLesson(res);
        const topicsRes = await directus.items('topics').readByQuery({ 
          filter: { lesson_id: { _eq: lessonId } }
        });
        let fetchedTopics = topicsRes?.data || [];
        if (fetchedTopics.length === 0) {
          // Placeholder topics
          fetchedTopics = [
            { id: 'topic-1', title: 'Introduction', content: 'Basic introduction to the topic.' },
            { id: 'topic-2', title: 'Key Concepts', content: 'Understanding the main ideas.' },
            { id: 'topic-3', title: 'Examples', content: 'Practical examples and applications.' },
            { id: 'topic-4', title: 'Summary', content: 'Wrap up of the lesson.' },
          ];
        }
        setTopics(fetchedTopics);
      } catch (err) {
        console.error('Failed to fetch lesson', err);
        setLesson({ title: 'Lesson Title', content: 'Lesson content here.' });
        setTopics([
          { id: 'topic-1', title: 'Introduction', content: 'Basic introduction to the topic.' },
          { id: 'topic-2', title: 'Key Concepts', content: 'Understanding the main ideas.' },
          { id: 'topic-3', title: 'Examples', content: 'Practical examples and applications.' },
          { id: 'topic-4', title: 'Summary', content: 'Wrap up of the lesson.' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading lesson...</Typography></Box>;
  
  // If lesson not found, use placeholder data
  if (!lesson) {
    setLesson({
      title: 'Sample Lesson',
      content: 'This is a placeholder lesson content for demonstration purposes.'
    });
    setTopics([
      { id: 'topic-1', title: 'Introduction', content: 'Basic introduction to the topic.' },
      { id: 'topic-2', title: 'Key Concepts', content: 'Understanding the main ideas.' },
      { id: 'topic-3', title: 'Examples', content: 'Practical examples and applications.' },
      { id: 'topic-4', title: 'Summary', content: 'Wrap up of the lesson.' },
    ]);
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
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
          {lesson.title}
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                textTransform: 'none',
                minWidth: 120,
              },
              '& .Mui-selected': {
                color: '#764ba2',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#764ba2',
              }
            }}
          >
            <Tab label="Lesson Content" />
            <Tab label="Practice Exercise" />
          </Tabs>
        </Box>
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8.4} sx={{ width: '75%' }}>
            <Card 
              elevation={2}
              sx={{ 
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>Lesson Video</Typography>
                <Box 
                  sx={{ 
                    flex: 1,
                    minHeight: { xs: 300, sm: 400, md: 500, lg: 600 },
                    width: '100%',
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    background: 'linear-gradient(45deg, #1a1a1a 30%, #2a2a2a 90%)',
                  }}
                >
                  <PlayCircle sx={{ fontSize: 60, mb: 2, color: '#764ba2' }} />
                  <Typography variant="h6">Interactive Lesson Video</Typography>
                  <Typography variant="body2" color="grey.400">Duration: 15:30</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card 
              elevation={2}
              sx={{ 
                background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                p: 2 
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>Learning Resources</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Description />}
                    sx={{ mb: 1 }}
                  >
                    Lesson Notes
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    sx={{ mb: 1 }}
                  >
                    Download Materials
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={12} md={3.6}>
            <Box sx={{ 
              position: { md: 'sticky' },
              top: { md: 24 },
              height: { md: 'calc(100vh - 240px)' },
              overflowY: { md: 'auto' }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#764ba2', mb: 2 }}>
                Topics Covered
              </Typography>
            {topics.map((topic, index) => (
              <Card 
                key={topic.id} 
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#764ba2',
                        width: 32,
                        height: 32,
                        mr: 2,
                        fontSize: '0.9rem'
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="h6">{topic.title}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    {topic.content}
                  </Typography>
                  <Button 
                    variant="contained"
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                      }
                    }}
                  >
                    Start Topic
                  </Button>
                </CardContent>
              </Card>
            ))}
            </Box>
          </Grid>
        </Grid>
      )}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
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
                    Practice Exercise
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Apply what you've learned in this interactive exercise. Use the AI tools for guidance and support.
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 300,
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
                    <Typography variant="h6">Interactive Coding Exercise</Typography>
                    <Typography variant="body2" color="grey.400">Estimated time: 30 mins</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2}
                sx={{ 
                  background: 'linear-gradient(45deg, #ffffff 30%, #f7f7f7 90%)',
                  height: '100%'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#764ba2' }}>
                    AI Learning Tools
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemButton 
                        onClick={() => window.location.href = '/ai-coach'}
                        sx={{
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'rgba(118, 75, 162, 0.1)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <SmartToy sx={{ color: '#764ba2' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="AI Coach" 
                          secondary="Get personalized guidance"
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton 
                        onClick={() => window.location.href = '/ai-panel'}
                        sx={{
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'rgba(118, 75, 162, 0.1)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Psychology sx={{ color: '#764ba2' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="AI Panel" 
                          secondary="Advanced learning tools"
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                  <Button 
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                      }
                    }}
                    href={`/exercise/${lessonId}`}
                  >
                    Open Full Exercise
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
    </Box>
  );

}
