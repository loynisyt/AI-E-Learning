'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { gsap } from 'gsap';
import menuConfig from '@/lib/menuConfig';

const DRAWER_WIDTH = 280;

export default function AppMenu() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (path) => {
    router.push(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMenuClick(path);
    }
  };

  // Staggered animation for menu items
  useEffect(() => {
    if (open) {
      const items = document.querySelectorAll('.menu-item');
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [open]);

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.primary.main, fontWeight: 700 }}>
          AI E-Learning
        </Typography>
        {isMobile && (
          <IconButton onClick={handleToggle} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {menuConfig.map((item, index) => {
          const IconComponent = item.icon;
          const isSelected = pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding className="menu-item">
              <ListItemButton
                selected={isSelected}
                onClick={() => handleMenuClick(item.path)}
                onKeyDown={(e) => handleKeyDown(e, item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: '0 4px 14px rgba(108,75,255,0.3)',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: '0 6px 20px rgba(76,107,255,0.4)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(108,75,255,0.1)',
                    transform: 'translateX(4px)',
                  },
                }}
                aria-label={`Navigate to ${item.label}`}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: '0 4px 14px rgba(108,75,255,0.3)',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: '0 6px 20px rgba(76,107,255,0.4)',
            },
            zIndex: 1000,
          }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleToggle}
          sx={{
            '& .MuiDrawer-paper': {
              height: '60vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              boxShadow: '0 0 20px rgba(108,75,255,0.1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          boxShadow: '0 0 20px rgba(108,75,255,0.1)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
