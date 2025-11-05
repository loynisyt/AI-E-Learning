'use client';
import './../styles/globals.scss';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import AppMenu from '@/components/AppMenu/AppMenu';
import Dock from '@/components/Dock/Dock';
import SettingsThemeSwitch from '@/components/SettingsThemeSwitch/SettingsThemeSwitch';
import createAppTheme from '@/lib/theme';
import menuConfig from '@/lib/menuConfig';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const [themeMode, setThemeMode] = useState('light');
  const theme = createAppTheme(themeMode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Listen for theme change events from settings page
  useEffect(() => {
    const handleThemeChange = (event) => {
      setThemeMode(event.detail);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const handleDockItemClick = (item, index) => {
    // Handle dock navigation
    window.location.href = item.path;
  };

  const dockItems = menuConfig.map(item => ({
    icon: <item.icon />,
    label: item.label,
    path: item.path,
  }));

  return (
    <html lang="en" className={isLandingPage ? 'landing' : ''}>
      <body style={{
        background: isLandingPage ? 'linear-gradient(135deg, #8639ebff 0%, #4806abff 40%, #3c16c4ff 100%)' : theme.palette.background.default,
        minHeight: '100vh',
        margin: 0,
        color: isLandingPage ? '#FFFFFF' : theme.palette.text.primary,
        transition: 'background-color 0.4s ease, color 0.4s ease'
      }}>
        <ThemeProvider theme={theme}>
          {!isLandingPage && !isMobile && <AppMenu />}
          {!isLandingPage && !isMobile && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000
            }}>
              <SettingsThemeSwitch themeMode={themeMode} setThemeMode={setThemeMode} />
            </div>
          )}
          {!isLandingPage && isMobile && (
            <Dock
              items={dockItems}
              position="bottom"
              onItemClick={handleDockItemClick}
              className="mobile-dock"
            />
          )}
          <main style={{
            paddingLeft: !isLandingPage && !isMobile ? '280px' : '0',
            paddingBottom: !isLandingPage && isMobile ? '100px' : '0'
          }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
