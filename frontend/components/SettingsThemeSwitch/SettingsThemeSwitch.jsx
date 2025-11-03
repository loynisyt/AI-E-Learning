'use client';
import React, { useEffect } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function SettingsThemeSwitch({ themeMode, setThemeMode }) {
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  return (
    <Box
      className="theme-switch"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: themeMode === 'dark'
            ? 'rgba(108,75,255,0.1)'
            : 'rgba(108,75,255,0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {themeMode === 'dark' ? (
          <DarkModeIcon sx={{ color: 'var(--primary)' }} />
        ) : (
          <LightModeIcon sx={{ color: 'var(--primary)' }} />
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: themeMode === 'dark' ? 'var(--text-invert)' : 'var(--text)',
          }}
        >
          {themeMode === 'dark' ? 'Dark' : 'Light'}
        </Typography>
      </Box>
      <Switch
        checked={themeMode === 'dark'}
        onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: 'var(--primary)',
            '&:hover': {
              backgroundColor: 'rgba(108,75,255,0.1)',
            },
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'var(--primary)',
          },
        }}
      />
    </Box>
  );
}
