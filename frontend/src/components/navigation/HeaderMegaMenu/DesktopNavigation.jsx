/**
 * DesktopNavigation - Desktop-specific navigation with mega-menu dropdowns
 * 
 * @typedef {import('../types/navigationTypes').NavigationGroup} NavigationGroup
 * 
 * @param {Object} props
 * @param {NavigationGroup[]} props.menuGroups - Navigation groups from menuConfig.js
 * @returns {JSX.Element}
 */
import { useState, useRef, useEffect } from 'react';
import { Group, Box, Text, useMantineTheme, Menu, UnstyledButton } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';

export default function DesktopNavigation({ menuGroups = [] }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const menuRefs = useRef({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !menuRefs.current[activeMenu]?.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  // Handle hover with delay
  const handleMouseEnter = (menuIndex) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setActiveMenu(menuIndex);
    }, 150); // 150ms delay for better UX
    
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 200); // 200ms delay before closing
    
    setHoverTimeout(timeout);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, menuIndex, itemIndex = null) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (itemIndex !== null && menuGroups[menuIndex]?.items[itemIndex]) {
          const item = menuGroups[menuIndex].items[itemIndex];
          if (item.path) {
            navigate(item.path);
            setActiveMenu(null);
          }
        }
        break;
      case 'Escape':
        setActiveMenu(null);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (activeMenu === menuIndex) {
          // Focus first item in dropdown
          const firstItem = menuRefs.current[`${menuIndex}-0`];
          if (firstItem) firstItem.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (activeMenu === menuIndex) {
          // Focus last item in dropdown
          const items = menuGroups[menuIndex]?.items || [];
          const lastItem = menuRefs.current[`${menuIndex}-${items.length - 1}`];
          if (lastItem) lastItem.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (activeMenu !== null) {
          const nextMenu = (activeMenu + 1) % menuGroups.length;
          setActiveMenu(nextMenu);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (activeMenu !== null) {
          const prevMenu = (activeMenu - 1 + menuGroups.length) % menuGroups.length;
          setActiveMenu(prevMenu);
        }
        break;
    }
  };

  // Handle navigation item click
  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
      setActiveMenu(null);
    }
  };

  return (
    <Group 
      gap="md" 
      data-testid="desktop-navigation"
      style={{ 
        height: '100%',
        justifyContent: 'center'
      }}
    >
      {menuGroups.map((group, groupIndex) => {
        const { hovered, ref } = useHover();
        const isActive = activeMenu === groupIndex || hovered;

        return (
          <Box
            key={group.label}
            ref={(node) => {
              ref.current = node;
              menuRefs.current[groupIndex] = node;
            }}
            onMouseEnter={() => handleMouseEnter(groupIndex)}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', height: '100%' }}
          >
            {/* Main Navigation Button */}
            <UnstyledButton
              data-testid={`nav-group-${groupIndex}`}
              style={{
                height: '100%',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                color: isActive ? theme.colors.blue[6] : theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[7],
                fontWeight: 500,
                fontSize: theme.fontSizes.sm,
                borderBottom: `2px solid ${isActive ? theme.colors.blue[6] : 'transparent'}`,
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]) : 'transparent',
              }}
              onClick={() => setActiveMenu(activeMenu === groupIndex ? null : groupIndex)}
              onKeyDown={(e) => handleKeyDown(e, groupIndex)}
              aria-haspopup="true"
              aria-expanded={isActive}
              aria-controls={`mega-menu-${groupIndex}`}
              tabIndex={0}
              role="button"
            >
              <Text component="span">{group.label}</Text>
              {group.items.some(item => item.submenu) && (
                <Box component="span" ml={4} style={{ fontSize: '12px' }}>▼</Box>
              )}
            </UnstyledButton>

            {/* Mega Menu Dropdown */}
            {isActive && group.items.length > 0 && (
              <Box
                id={`mega-menu-${groupIndex}`}
                data-testid={`mega-menu-${groupIndex}`}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: 320,
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                  border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                  borderRadius: theme.radius.md,
                  boxShadow: theme.shadows.md,
                  padding: theme.spacing.md,
                  zIndex: 1000,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: theme.spacing.md,
                }}
                onMouseEnter={() => handleMouseEnter(groupIndex)}
                onMouseLeave={handleMouseLeave}
              >
                {group.items.map((item, itemIndex) => (
                  <Box key={item.text}>
                    {/* Main Item */}
                    <UnstyledButton
                      ref={(node) => {
                        menuRefs.current[`${groupIndex}-${itemIndex}`] = node;
                      }}
                      data-testid={`nav-item-${groupIndex}-${itemIndex}`}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: theme.radius.sm,
                        textAlign: 'left',
                        color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[7],
                        '&:hover': {
                          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                        },
                        '&:focus': {
                          outline: `2px solid ${theme.colors.blue[5]}`,
                          outlineOffset: 2,
                        },
                      }}
                      onClick={() => handleItemClick(item.path)}
                      onKeyDown={(e) => handleKeyDown(e, groupIndex, itemIndex)}
                      tabIndex={0}
                      role="menuitem"
                    >
                      <Group gap="sm" wrap="nowrap">
                        {item.icon && (
                          <Box style={{ display: 'flex', alignItems: 'center' }}>
                            <item.icon size={16} />
                          </Box>
                        )}
                        <Text component="span" size="sm">{item.text}</Text>
                        {item.badge && (
                          <Box
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: theme.colors.red[6],
                            }}
                            aria-label="Novo"
                          />
                        )}
                      </Group>
                    </UnstyledButton>

                    {/* Submenu Items */}
                    {item.submenu && item.submenu.length > 0 && (
                      <Box pl={24} mt={4}>
                        {item.submenu.map((subItem, subIndex) => (
                          <UnstyledButton
                            key={subItem.text}
                            data-testid={`submenu-item-${groupIndex}-${itemIndex}-${subIndex}`}
                            style={{
                              width: '100%',
                              padding: '6px 12px',
                              borderRadius: theme.radius.sm,
                              textAlign: 'left',
                              color: theme.colorScheme === 'dark' ? theme.colors.gray[3] : theme.colors.gray[6],
                              fontSize: theme.fontSizes.xs,
                              '&:hover': {
                                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                              },
                            }}
                            onClick={() => handleItemClick(subItem.path)}
                            tabIndex={0}
                            role="menuitem"
                          >
                            <Group gap="sm" wrap="nowrap">
                              {subItem.icon && (
                                <Box style={{ display: 'flex', alignItems: 'center' }}>
                                  <subItem.icon size={14} />
                                </Box>
                              )}
                              <Text component="span" size="xs">{subItem.text}</Text>
                            </Group>
                          </UnstyledButton>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Group>
  );
}