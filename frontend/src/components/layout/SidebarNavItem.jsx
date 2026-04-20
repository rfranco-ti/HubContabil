import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Menu,
  NavLink,
  Text,
  Tooltip,
} from "@mantine/core";
import { ChevronDown, ChevronRight } from "lucide-react";

const navStyles = (theme, active = false) => ({
  root: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
    color: active
      ? theme.colors.blue[theme.colorScheme === "dark" ? 3 : 7]
      : theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    backgroundColor: active
      ? theme.colorScheme === "dark"
        ? theme.colors.blue[9]
        : theme.colors.blue[0]
      : "transparent",
    "&:hover": {
      backgroundColor: active
        ? theme.colorScheme === "dark"
          ? theme.colors.blue[8]
          : theme.colors.blue[1]
        : theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    },
  },
  label: {
    fontWeight: 600,
  },
  section: {
    color: "inherit",
  },
});

function ItemBadge() {
  return <Box w={8} h={8} bg="blue.5" style={{ borderRadius: 999 }} />;
}

export function SidebarNavItem({
  item,
  collapsed = false,
  isMobile = false,
  openSubmenus,
  onToggleSubmenu,
  onClick,
}) {
  const location = useLocation();
  const Icon = item.icon;
  const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isActive = location.pathname === item.path;
  const isSubActive = useMemo(
    () => item.submenu?.some((sub) => location.pathname === sub.path),
    [item.submenu, location.pathname],
  );
  const isOpen = Boolean(openSubmenus?.[item.path]);
  const [submenuPopoverOpen, setSubmenuPopoverOpen] = useState(false);

  const handleSelect = (event) => {
    onClick?.(event);
  };

  if (collapsed && !isMobile) {
    if (hasSubmenu) {
      return (
        <Menu
          opened={submenuPopoverOpen}
          onChange={setSubmenuPopoverOpen}
          position="right-start"
          offset={12}
          width={240}
          withArrow
        >
          <Menu.Target>
            <Tooltip label={item.text} position="right" openDelay={150}>
              <ActionIcon
                component="button"
                type="button"
                size="lg"
                variant={isActive || isSubActive ? "light" : "subtle"}
                color="blue"
                radius="md"
                onClick={() => setSubmenuPopoverOpen((value) => !value)}
                aria-label={item.text}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Icon size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Group gap={8} wrap="nowrap">
                <Icon size={14} />
                <Text size="sm" fw={600} truncate>
                  {item.text}
                </Text>
              </Group>
            </Menu.Label>
            {item.submenu.map((sub) => {
              const subActive = location.pathname === sub.path;
              return (
                <Menu.Item
                  key={sub.path}
                  component={Link}
                  to={sub.path}
                  onClick={(event) => {
                    setSubmenuPopoverOpen(false);
                    handleSelect(event);
                  }}
                  leftSection={<sub.icon size={14} />}
                  color={subActive ? "blue" : "gray"}
                  fw={subActive ? 600 : 500}
                >
                  {sub.text}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Tooltip label={item.text} position="right" openDelay={150}>
        <ActionIcon
          component={Link}
          to={item.path}
          onClick={handleSelect}
          size="lg"
          variant={isActive ? "light" : "subtle"}
          color="blue"
          radius="md"
          aria-label={item.text}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Icon size={18} />
        </ActionIcon>
      </Tooltip>
    );
  }

  if (hasSubmenu) {
    return (
      <NavLink
        label={item.text}
        leftSection={<Icon size={18} />}
        rightSection={isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        opened={isOpen}
        active={isActive || isSubActive}
        onClick={() => onToggleSubmenu?.(item.path)}
        styles={(theme) => navStyles(theme, isActive || isSubActive)}
      >
        <Box pl="xs">
          {item.submenu.map((sub) => {
            const subActive = location.pathname === sub.path;
            return (
              <NavLink
                key={sub.path}
                component={Link}
                to={sub.path}
                label={sub.text}
                leftSection={<sub.icon size={16} />}
                active={subActive}
                onClick={handleSelect}
                styles={(theme) => navStyles(theme, subActive)}
              />
            );
          })}
        </Box>
      </NavLink>
    );
  }

  return (
    <NavLink
      component={Link}
      to={item.path}
      label={item.text}
      leftSection={<Icon size={18} />}
      rightSection={item.badge ? <ItemBadge /> : null}
      active={isActive}
      onClick={handleSelect}
      styles={(theme) => navStyles(theme, isActive)}
    />
  );
}
