'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PhotoCamera } from '@mui/icons-material';

export default function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: new Date('1990-01-01'),
    bio: 'AI enthusiast and lifelong learner',
    avatar: '/placeholder-avatar.jpg'
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setProfileData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to update profile
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: isMobile ? 2 : 3,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 2
          }}
        >
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                mb: 4, 
                textAlign: { xs: 'center', md: 'left' },
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              Profile Settings
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid 
                  item 
                  xs={12} 
                  sm={3}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    mb: { xs: 3, sm: 0 }
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: 120, sm: 150 },
                      height: { xs: 120, sm: 150 },
                      mb: 1
                    }}
                  >
                    <Avatar
                      src={profileData.avatar}
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: '4px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#6c63ff',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#5a52cc'
                          }
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    </label>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since 2023
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={9}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: '#6c63ff' }}>
                      Personal Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Date of Birth"
                          value={profileData.dateOfBirth}
                          onChange={handleDateChange}
                          disabled={!isEditing}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mt: 2 }}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {!isEditing ? (
                        <Button
                          variant="contained"
                          onClick={() => setIsEditing(true)}
                          sx={{
                            px: 4,
                            py: 1,
                            backgroundColor: '#6c63ff',
                            '&:hover': {
                              backgroundColor: '#5a52cc'
                            }
                          }}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            sx={{ px: 4, py: 1 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            sx={{
                              px: 4,
                              py: 1,
                              backgroundColor: '#6c63ff',
                              '&:hover': {
                                backgroundColor: '#5a52cc'
                              }
                            }}
                          >
                            Save Changes
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
