/**
 * MobileNavigation - Mobile-specific navigation drawer with touch-friendly design
 * 
 * Implements Mantine Drawer for full-screen mobile navigation with:
 * - Larger touch targets (minimum 44x44px)
 * - Accordion-style navigation for hierarchical menus
 * - Gesture support (swipe to close)
 * - All navigation items from menuConfig.js
 * - Auto-close on navigation item selection
 * 
 * @param {Object} props
 * @param {boolean} props.opened - Whether drawer is open
 * @param {Function} props.onClose - Function to close drawer
 * @param {Array} props.menuGroups - Navigation groups from menuConfig.js
 * @param {Function} props.onNavigate - Callback when navigation item is selected
 * 
 * @returns {JSX.Element}
 */
import {
  Drawer,
  ScrollArea,
  Accordion,
  Group,
  Text,
  Box,
  useMantineTheme,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';

export default function MobileNavigation({
  opened = false,
  onClose,
  menuGroups = [],
  onNavigate,
}) {
  const theme = useMantineTheme();
  const isSmallMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const [activeAccordion, setActiveAccordion] = useState(null);

  /**
   * Handle navigation item click
   * Closes drawer and calls onNavigate callback
   */
  const handleItemClick = (item) => {
    // Close drawer first
    onClose();
    
    // Reset active accordion
    setActiveAccordion(null);
    
    // Call navigation callback if provided
    if (onNavigate && item.path) {
      onNavigate(item.path);
    }
  };

  /**
   * Handle swipe to close gesture
   */
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const startX = e.target.dataset.touchStartX;
    
    if (startX && touch.clientX - startX > 100) {
      // Swipe right to close
      onClose();
    }
  };

  /**
   * Record touch start position for swipe detection
   */
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    e.target.dataset.touchStartX = touch.clientX;
  };

  /**
   * Render navigation item with touch-friendly sizing
   */
  const renderNavigationItem = (item, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const Icon = item.icon;
    
    return (
      <Box
        key={`${item.text}-${depth}`}
        data-testid={`mobile-nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing.sm,
          paddingLeft: theme.spacing.md + (depth * theme.spacing.lg),
          minHeight: 44, // Minimum touch target height
          borderRadius: theme.radius.sm,
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: 'transparent',
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[5] 
              : theme.colors.gray[1],
          },
          '&:active': {
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[6] 
              : theme.colors.gray[2],
          },
        }}
        onClick={() => !hasSubmenu && handleItemClick(item)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={item.text}
      >
        {/* Icon */}
        {Icon && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: theme.spacing.sm,
              color: theme.colorScheme === 'dark' 
                ? theme.colors.gray[4] 
                : theme.colors.gray[6],
            }}
          >
            <Icon size={20} />
          </Box>
        )}

        {/* Text */}
        <Text
          style={{
            flex: 1,
            fontSize: theme.fontSizes.md,
            fontWeight: depth === 0 ? 500 : 400,
            color: theme.colorScheme === 'dark' 
              ? theme.colors.gray[0] 
              : theme.colors.gray[9],
          }}
        >
          {item.text}
        </Text>

        {/* Badge indicator */}
        {item.badge && (
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.colors.red[6],
              marginLeft: theme.spacing.xs,
            }}
            aria-label="Novo conteúdo"
          />
        )}

        {/* Submenu indicator */}
        {hasSubmenu && (
          <ChevronRight 
            size={16} 
            style={{
              marginLeft: theme.spacing.xs,
              color: theme.colorScheme === 'dark' 
                ? theme.colors.gray[5] 
                : theme.colors.gray[6],
            }}
          />
        )}
      </Box>
    );
  };

  /**
   * Render accordion item for navigation groups with submenus
   */
  const renderAccordionItem = (group) => {
    const hasSubmenuItems = group.items.some(item => item.submenu && item.submenu.length > 0);
    
    if (!hasSubmenuItems) {
      // Render simple list for groups without submenus
      return (
        <Box key={group.label} data-testid={`mobile-nav-group-${group.label.toLowerCase()}`}>
          <Text
            style={{
              padding: theme.spacing.sm,
              paddingLeft: theme.spacing.md,
              fontSize: theme.fontSizes.xs,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: theme.colorScheme === 'dark' 
                ? theme.colors.gray[5] 
                : theme.colors.gray[6],
            }}
          >
            {group.label}
          </Text>
          {group.items.map(item => renderNavigationItem(item))}
          <Divider my="sm" />
        </Box>
      );
    }

    // Render accordion for groups with submenus
    return (
      <Accordion
        key={group.label}
        value={activeAccordion}
        onChange={setActiveAccordion}
        chevronPosition="right"
        variant="filled"
        data-testid={`mobile-nav-accordion-${group.label.toLowerCase()}`}
        styles={{
          root: {
            backgroundColor: 'transparent',
          },
          item: {
            border: 'none',
            backgroundColor: 'transparent',
          },
          control: {
            padding: theme.spacing.sm,
            paddingLeft: theme.spacing.md,
            minHeight: 44,
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' 
                ? theme.colors.dark[5] 
                : theme.colors.gray[1],
            },
          },
          content: {
            padding: 0,
          },
        }}
      >
        <Accordion.Item value={group.label}>
          <Accordion.Control>
            <Text
              style={{
                fontSize: theme.fontSizes.sm,
                fontWeight: 600,
                color: theme.colorScheme === 'dark' 
                  ? theme.colors.gray[0] 
                  : theme.colors.gray[9],
              }}
            >
              {group.label}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            {group.items.map(item => {
              if (item.submenu && item.submenu.length > 0) {
                // Render parent item and its submenu
                return (
                  <Box key={item.text}>
                    {renderNavigationItem(item)}
                    {item.submenu.map(subItem => 
                      renderNavigationItem(subItem, 1)
                    )}
                  </Box>
                );
              }
              // Render regular item
              return renderNavigationItem(item);
            })}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size={isSmallMobile ? '100%' : '320px'}
      padding="md"
      data-testid="mobile-navigation-drawer"
      styles={{
        root: {
          // Prevent horizontal scrolling
          overflowX: 'hidden',
        },
        content: {
          // Ensure proper touch spacing
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        header: {
          padding: theme.spacing.md,
          borderBottom: `1px solid ${theme.colorScheme === 'dark' 
            ? theme.colors.dark[4] 
            : theme.colors.gray[2]}`,
        },
        body: {
          height: 'calc(100% - 60px)', // Account for header height
          padding: 0,
        },
      }}
      closeButtonProps={{
        'aria-label': 'Fechar menu de navegação',
        size: 'lg',
        style: {
          minWidth: 44,
          minHeight: 44,
        },
      }}
      withCloseButton={true}
      closeOnClickOutside={true}
      closeOnEscape={true}
      trapFocus={true}
      lockScroll={true}
      // Add swipe to close support
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      transitionProps={{
        duration: 200,
        timingFunction: 'ease-out',
      }}
    >
      {/* Drawer Header */}
      <Group justify="space-between" align="center" mb="md">
        <Text
          style={{
            fontSize: theme.fontSizes.lg,
            fontWeight: 700,
            color: theme.colorScheme === 'dark' 
              ? theme.white 
              : theme.colors.gray[9],
          }}
        >
          Navegação
        </Text>
        <ActionIcon
          onClick={onClose}
          size="lg"
          variant="subtle"
          aria-label="Fechar menu"
          style={{
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <X size={20} />
        </ActionIcon>
      </Group>

      {/* Search Bar for Mobile */}
      <Box mb="md" px="md">
        <SearchBar />
      </Box>

      {/* Navigation Content */}
      <ScrollArea 
        style={{ 
          height: '100%',
          // Prevent horizontal scrolling
          overflowX: 'hidden',
        }}
        scrollbarSize={8}
        type="auto"
      >
        <Box
          style={{
            paddingBottom: theme.spacing.xl,
          }}
        >
          {menuGroups.map(renderAccordionItem)}
        </Box>
      </ScrollArea>
    </Drawer>
  );
}