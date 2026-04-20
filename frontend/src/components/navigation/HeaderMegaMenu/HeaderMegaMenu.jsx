/**
 * HeaderMegaMenu - Main navigation component that replaces both AppSidebar and AppHeader
 * 
 * @typedef {import('../types/navigationTypes').HeaderMegaMenuProps} HeaderMegaMenuProps
 * 
 * @param {HeaderMegaMenuProps} props
 * @returns {JSX.Element}
 */
import { Header, Container, Group, Box, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import SearchBar from '../components/SearchBar';
import useResponsive from '../hooks/useResponsive';
import { menuGroups } from '../../../data/menuConfig';

export default function HeaderMegaMenu({
  user,
  notifications = [],
  initialTheme = 'light',
  onThemeToggle,
  onLogout,
  onNavigate,
}) {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { isMobile } = useResponsive();
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);

  // Handle theme toggle
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      toggleColorScheme();
    }
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpened(!mobileMenuOpened);
  };

  // Handle mobile menu close
  const handleMobileMenuClose = () => {
    setMobileMenuOpened(false);
  };

  // Handle navigation
  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    // Close mobile menu if open
    if (mobileMenuOpened) {
      setMobileMenuOpened(false);
    }
  };

  return (
    <Header 
      height={60} 
      data-testid="header-mega-menu"
      styles={{
        root: {
          borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        }
      }}
    >
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%" wrap="nowrap">
          {/* Logo Area */}
          <Box 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 700,
              fontSize: theme.fontSizes.lg,
              color: theme.colorScheme === 'dark' ? theme.white : theme.colors.gray[9]
            }}
          >
            <span>HubContábil</span>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box style={{ flex: 1 }}>
              <DesktopNavigation menuGroups={menuGroups} />
            </Box>
          )}

          {/* Mobile Navigation Toggle */}
          {isMobile && (
            <Box 
              data-testid="mobile-menu-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
              }}
              onClick={handleMobileMenuToggle}
              onKeyDown={(e) => e.key === 'Enter' && handleMobileMenuToggle()}
              aria-label={mobileMenuOpened ? "Fechar menu de navegação" : "Abrir menu de navegação"}
              aria-expanded={mobileMenuOpened}
              role="button"
              tabIndex={0}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </Box>
          )}

          {/* Right Side Actions */}
          <Group gap="sm" wrap="nowrap">
            {/* Search Bar */}
            {!isMobile && (
              <Box style={{ minWidth: 200 }}>
                <SearchBar />
              </Box>
            )}
            
            {/* Theme Toggle */}
            <Box 
              data-testid="theme-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                cursor: 'pointer',
              }}
              onClick={handleThemeToggle}
              aria-label={`Alternar para modo ${colorScheme === 'dark' ? 'claro' : 'escuro'}`}
              role="button"
              tabIndex={0}
            >
              {colorScheme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </Box>
          </Group>
        </Group>
      </Container>
    </Header>

    {/* Mobile Navigation Drawer */}
    <MobileNavigation
      opened={mobileMenuOpened}
      onClose={handleMobileMenuClose}
      menuGroups={menuGroups}
      onNavigate={handleNavigate}
    />
  );
}