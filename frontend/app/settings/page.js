'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, Select, MenuItem, Slider, Button, TextField, useMediaQuery, useTheme } from '@mui/material';

export default function Settings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [voiceQuality, setVoiceQuality] = useState('medium');
  const [volume, setVolume] = useState(50);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    const savedDark = localStorage.getItem('darkMode') === 'true';
    const savedVoice = localStorage.getItem('voiceOutput') !== 'false';
    const savedQuality = localStorage.getItem('voiceQuality') || 'medium';
    const savedVolume = parseInt(localStorage.getItem('volume')) || 50;
    setLanguage(savedLang);
    setDarkMode(savedDark);
    setVoiceOutput(savedVoice);
    setVoiceQuality(savedQuality);
    setVolume(savedVolume);
  }, []);

  const handleSave = () => {
    localStorage.setItem('language', language);
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('voiceOutput', voiceOutput.toString());
    localStorage.setItem('voiceQuality', voiceQuality);
    localStorage.setItem('volume', volume.toString());
    // Trigger theme change
    window.dispatchEvent(new CustomEvent('themeChange', { detail: darkMode ? 'dark' : 'light' }));
    alert('Settings saved!');
  };

  const handleContactSubmit = async () => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contactMessage }),
      });
      if (res.ok) {
        alert('Message sent!');
        setContactMessage('');
      } else {
        alert('Failed to send message.');
      }
    } catch (err) {
      console.error('Contact submit error', err);
      alert('Error sending message.');
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Language</Typography>
        <Select value={language} onChange={(e) => setLanguage(e.target.value)} fullWidth>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="pl">Polski</MenuItem>
          <MenuItem value="es">Español</MenuItem> 
          <MenuItem value="fr">Français</MenuItem>
          <MenuItem value="de">Deutsch</MenuItem>
          <MenuItem value="zh">中文</MenuItem>
          <MenuItem value="ja">日本語</MenuItem>
          <MenuItem value="ru">Русский</MenuItem>
                
        </Select>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
          label="Dark Mode"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={voiceOutput} onChange={(e) => setVoiceOutput(e.target.checked)} />}
          label="Voice Output"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Voice Quality</Typography>
        <Select value={voiceQuality} onChange={(e) => setVoiceQuality(e.target.value)} fullWidth>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Volume</Typography>
        <Slider value={volume} onChange={(e, newValue) => setVolume(newValue)} min={0} max={100} />
        <Typography>{volume}%</Typography>
      </Box>

      <Button variant="contained" onClick={handleSave} sx={{ mb: 3 }}>Save Settings</Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Contact Support</Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={contactMessage}
          onChange={(e) => setContactMessage(e.target.value)}
          placeholder="Enter your message..."
        />
        <Button variant="outlined" onClick={handleContactSubmit} sx={{ mt: 1 }}>Send</Button>
      </Box>
    </Box>
  );
}
