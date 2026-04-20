import React from "react";
import { ScrollArea, Stack, NavLink, Text, Box, Tooltip, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { menuGroups } from "../data/menuConfig";

export function DoubleNavbar({ onCloseMobile, isMinimal, onToggleMinimal }) {
  const location = useLocation();

  const getGroupColor = (index) => {
    const colors = ["blue", "grape", "orange", "teal", "indigo", "pink", "cyan"];
    return colors[index % colors.length];
  };

  const renderMinimalItems = () => {
    return menuGroups.flatMap((group, groupIndex) => {
      const groupColor = getGroupColor(groupIndex);
      
      return group.items.map((item) => {
        const Icon = item.icon;
        if (!Icon) return null;
        
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isActive = location.pathname === item.path || 
                         (hasSubmenu && item.submenu.some(sub => location.pathname.startsWith(sub.path)));

        return (
          <Tooltip label={item.text} position="right" transitionProps={{ duration: 0 }} key={`${group.label}-${item.text}`} portalProps={{ target: document.body }}>
            <Box>
              <UnstyledButton
                component={hasSubmenu ? 'button' : Link}
                to={hasSubmenu ? undefined : item.path}
                onClick={() => {
                  if (hasSubmenu) {
                    onToggleMinimal();
                  } else {
                    onCloseMobile();
                  }
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? `var(--mantine-color-${groupColor}-6)` : `var(--mantine-color-${groupColor}-1)`,
                  color: isActive ? 'white' : `var(--mantine-color-${groupColor}-6)`,
                  marginBottom: 8,
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              </UnstyledButton>
            </Box>
          </Tooltip>
        );
      });
    });
  };

  const renderNavItems = (items, groupColor) => {
    return items.map((item) => {
      const Icon = item.icon;
      const hasSubmenu = item.submenu && item.submenu.length > 0;
      
      const isActive = location.pathname === item.path || 
                       (hasSubmenu && item.submenu.some(sub => location.pathname === sub.path));

      const iconNode = Icon ? (
        <Box 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 28, 
            height: 28, 
            borderRadius: '8px',
            backgroundColor: isActive ? `var(--mantine-color-${groupColor}-6)` : `var(--mantine-color-${groupColor}-1)`,
            color: isActive ? 'white' : `var(--mantine-color-${groupColor}-6)`
          }}
        >
          <Icon size={16} strokeWidth={2} />
        </Box>
      ) : null;

      if (hasSubmenu) {
        return (
          <NavLink
            key={item.text}
            label={<Text fw={isActive ? 700 : 500}>{item.text}</Text>}
            leftSection={iconNode}
            childrenOffset={36}
            active={isActive}
            variant="subtle"
            color={groupColor}
            styles={{
              root: { borderRadius: '8px', marginBottom: '4px' },
            }}
          >
            {item.submenu.map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = location.pathname === sub.path;
              return (
                <NavLink
                  key={sub.text}
                  component={Link}
                  to={sub.path}
                  label={<Text size="sm" fw={isSubActive ? 700 : 500}>{sub.text}</Text>}
                  leftSection={
                    SubIcon ? (
                      <Box style={{ color: `var(--mantine-color-${groupColor}-6)`, display: 'flex' }}>
                        <SubIcon size={14} strokeWidth={2} />
                      </Box>
                    ) : null
                  }
                  active={isSubActive}
                  onClick={onCloseMobile}
                  variant="light"
                  color={groupColor}
                  styles={{
                    root: { borderRadius: '6px', marginBottom: '2px' },
                  }}
                />
              );
            })}
          </NavLink>
        );
      }

      return (
        <NavLink
          key={item.text}
          component={Link}
          to={item.path}
          label={<Text fw={isActive ? 700 : 500}>{item.text}</Text>}
          leftSection={iconNode}
          active={isActive}
          onClick={onCloseMobile}
          variant="light"
          color={groupColor}
          styles={{
            root: { borderRadius: '8px', marginBottom: '4px' },
          }}
        />
      );
    });
  };

  if (isMinimal) {
    return (
      <ScrollArea h="calc(100vh - 60px)" p="xs" bg="var(--mantine-color-gray-0)">
        <Stack gap={0} align="center" mt="sm">
          {renderMinimalItems()}
        </Stack>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea h="calc(100vh - 60px)" p="sm" bg="var(--mantine-color-gray-0)">
      <Stack gap="xl">
        {menuGroups.map((group, index) => {
          const groupColor = getGroupColor(index);
          return (
            <Box key={index}>
              <Text size="xs" fw={800} c={`${groupColor}.7`} tt="uppercase" lts={1.5} mb="sm" px="sm">
                {group.label}
              </Text>
              <Stack gap={0}>
                {renderNavItems(group.items, groupColor)}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
