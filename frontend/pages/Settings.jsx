'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    language: 'en',
    theme: 'light',
    voiceInput: false,
    voiceOutput: false,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = {
      emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'false'),
      pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'false'),
      language: localStorage.getItem('language') || 'en',
      theme: localStorage.getItem('themeMode') || 'light',
      voiceInput: JSON.parse(localStorage.getItem('voiceInputEnabled') || 'false'),
      voiceOutput: JSON.parse(localStorage.getItem('voiceOutputEnabled') || 'false'),
    };
    setSettings(savedSettings);
  }, []);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);

    // Save to localStorage
    localStorage.setItem(setting, JSON.stringify(value));

    // Special handling for theme
    if (setting === 'theme') {
      localStorage.setItem('themeMode', value);
      // Trigger theme change (handled by parent component)
      window.dispatchEvent(new CustomEvent('themeChange', { detail: value }));
    }
  };

  const handleSave = () => {
    // Validate form
    if (!settings.language) {
      setSnackbarMessage('Please select a language.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // All settings are already saved to localStorage on change
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email notifications"
              />
              <br />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                }
                label="Push notifications"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Language
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="pl">Polish</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Voice Features
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.voiceInput}
                    onChange={(e) => handleSettingChange('voiceInput', e.target.checked)}
                  />
                }
                label="Enable voice input"
              />
              <br />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.voiceOutput}
                    onChange={(e) => handleSettingChange('voiceOutput', e.target.checked)}
                  />
                }
                label="Enable voice output"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
