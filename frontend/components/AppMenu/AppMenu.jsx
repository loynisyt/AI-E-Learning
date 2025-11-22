'use client';
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
import AuthClient from '@/lib/authClient';

const DRAWER_WIDTH = 280;

export default function AppMenu() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);
  const [connectingProvider, setConnectingProvider] = useState(null);

  // Fetch user session info with providers connected
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const session = await AuthClient.getSession();
        if (session && session.user) {
          setUser({
            email: session.user.email,
            googleId: session.user.googleProviderId || null,
            facebookId: session.user.facebookProviderId || null,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setUser(null);
      }
    }
    fetchUserSession();
  }, []);

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

  const handleSocialConnect = async (provider) => {
    setConnectingProvider(provider);
    try {
      // Using Firebase popup for social login
      let result;
      if (provider === 'google') {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebaseClient');
        const providerObj = new GoogleAuthProvider();
        result = await signInWithPopup(auth, providerObj);
      } else if (provider === 'facebook') {
        const { FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebaseClient');
        const providerObj = new FacebookAuthProvider();
        result = await signInWithPopup(auth, providerObj);
      } else {
        throw new Error('Unsupported provider');
      }

      const user = result.user;
      if (user && user.email && user.uid) {
        // Call backend API connect provider to link the account
        await AuthClient.connectProvider(provider, user.uid, user.email);

        // Update user state to reflect connected provider
        setUser((prev) => ({
          ...prev,
          [`${provider}Id`]: user.uid,
        }));
      }
    } catch (error) {
      console.error('Social connect error:', error);
      // Optionally show error notification
    }
    setConnectingProvider(null);
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
      <List sx={{ pb: 2 }}>
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

      {/* Upgrade to Premium Section */}
      <Box
        sx={{
          mt: 'auto',
          pt: 2,
          px: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ListItem disablePadding className="menu-item">
          <ListItemButton
            onClick={() => handleMenuClick('/checkout')}
            onKeyDown={(e) => handleKeyDown(e, '/checkout')}
            sx={{
              borderRadius: 2,
              mx: 0.5,
              background: 'linear-gradient(135deg, #6C4BFF 0%, #8a7bff 100%)',
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(108,75,255,0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(108,75,255,0.4)',
                background: 'linear-gradient(135deg, #7C5BFF 0%, #9a8bff 100%)',
              },
              py: 1.2,
            }}
            aria-label="Upgrade to Premium"
          >
            <ListItemText
              primary="⭐ Upgrade Premium"
              sx={{
                textAlign: 'center',
                '& .MuiListItemText-primary': {
                  fontWeight: 700,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  letterSpacing: '0.5px',
                },
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Social Connect Buttons */}
        {user && !user.googleId && !user.facebookId && (
          <>
            <ListItem disablePadding className="menu-item">
              <ListItemButton
                onClick={() => handleSocialConnect('google')}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  background: 'linear-gradient(135deg, #4285F4 0%, #357ae8 100%)',
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(66,133,244,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(66,133,244,0.4)',
                    background: 'linear-gradient(135deg, #357ae8 0%, #2a65c7 100%)',
                  },
                  py: 1.2,
                }}
                aria-label="Connect with Google"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <img src="/icons/google.svg" alt="Google" style={{ width: 20, height: 20, marginRight: 8 }} />
                  <ListItemText
                    primary="Connect with Google"
                    sx={{
                      textAlign: 'center',
                      '& .MuiListItemText-primary': {
                        fontWeight: 700,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        letterSpacing: '0.5px',
                      },
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding className="menu-item">
              <ListItemButton
                onClick={() => handleSocialConnect('facebook')}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  background: 'linear-gradient(135deg, #3b5998 0%, #2d4373 100%)',
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59,89,152,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59,89,152,0.4)',
                    background: 'linear-gradient(135deg, #2d4373 0%, #1e2e4f 100%)',
                  },
                  py: 1.2,
                }}
                aria-label="Connect with Facebook"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <img src="/icons/facebook.svg" alt="Facebook" style={{ width: 20, height: 20, marginRight: 8 }} />
                  <ListItemText
                    primary="Connect with Facebook"
                    sx={{
                      textAlign: 'center',
                      '& .MuiListItemText-primary': {
                        fontWeight: 700,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        letterSpacing: '0.5px',
                      },
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>
          </>
        )}
      </Box>
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
