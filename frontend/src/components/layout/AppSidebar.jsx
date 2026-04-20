import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { menuGroups, VERSION } from "../../data/menuConfig";
import { clearAuth } from "../../utils/auth";
import NotificationBell from "../NotificationBell";
import { SidebarNavItem } from "./SidebarNavItem";
import { layoutTokens } from "../../theme/mantineTheme";

function filterMenuGroups(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return menuGroups;

  return menuGroups
    .map((group) => {
      const items = group.items
        .map((item) => {
          const matchesSelf =
            item.text.toLowerCase().includes(normalized)
            || item.path.toLowerCase().includes(normalized);

          if (!item.submenu) {
            return matchesSelf ? item : null;
          }

          const submenu = item.submenu.filter(
            (sub) =>
              sub.text.toLowerCase().includes(normalized)
              || sub.path.toLowerCase().includes(normalized),
          );

          if (matchesSelf) return item;
          if (submenu.length > 0) return { ...item, submenu };
          return null;
        })
        .filter(Boolean);

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

function SidebarHeader({ collapsed, isMobile, onToggleCollapsed, onClose }) {
  return (
    <Group justify="space-between" align="center" p="md" gap="sm">
      <Box
        component={Link}
        to="/dashboard"
        onClick={isMobile ? onClose : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--mantine-spacing-sm)",
          minWidth: 0,
          flex: 1,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <ThemeIcon
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 135 }}
          size={isMobile ? 42 : 44}
          radius="md"
        >
          <LayoutDashboard size={isMobile ? 18 : 20} />
        </ThemeIcon>
        {(!collapsed || isMobile) && (
          <Box style={{ minWidth: 0 }}>
            <Text fw={800} size={isMobile ? "sm" : "md"} truncate>
              HUB CONTÁBIL
            </Text>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts={0.6}>
              v{VERSION}
            </Text>
          </Box>
        )}
      </Box>

      {!isMobile && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          title={collapsed ? "Expandir navegação (Ctrl+B)" : "Recolher navegação (Ctrl+B)"}
        >
          {collapsed ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
        </ActionIcon>
      )}

      {isMobile && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          onClick={onClose}
          aria-label="Fechar navegação"
        >
          <X size={18} />
        </ActionIcon>
      )}
    </Group>
  );
}

function SearchArea({
  isMobile,
  collapsed,
  searchQuery,
  setSearchQuery,
  onOpenSearchModal,
}) {
  if (collapsed && !isMobile) {
    return (
      <Box px="md">
        <Tooltip label="Pesquisar navegação" position="right" openDelay={150}>
          <ActionIcon
            size="lg"
            radius="md"
            variant="subtle"
            color="blue"
            onClick={onOpenSearchModal}
            aria-label="Pesquisar navegação"
            style={{ width: "100%" }}
          >
            <Search size={18} />
          </ActionIcon>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box px="md">
      <TextInput
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        placeholder="Buscar navegação..."
        leftSection={<Search size={16} />}
        leftSectionPointerEvents="none"
        size="sm"
        radius="md"
      />
    </Box>
  );
}

function QuickCenter({ collapsed, isMobile, onClose }) {
  const taskLink = "/configs";
  const activityLink = "/logs";

  if (collapsed && !isMobile) {
    return (
      <Group justify="center" gap="xs" px="md">
        <Tooltip label="Notificações" position="right" openDelay={150}>
          <Box>
            <NotificationBell />
          </Box>
        </Tooltip>

        <Tooltip label="Tarefas" position="right" openDelay={150}>
          <ActionIcon
            component={Link}
            to={taskLink}
            onClick={isMobile ? onClose : undefined}
            variant="subtle"
            color="blue"
            radius="md"
            size="lg"
            aria-label="Tarefas"
          >
            <ClipboardCheck size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Atividades" position="right" openDelay={150}>
          <ActionIcon
            component={Link}
            to={activityLink}
            onClick={isMobile ? onClose : undefined}
            variant="subtle"
            color="blue"
            radius="md"
            size="lg"
            aria-label="Atividades"
          >
            <Activity size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  return (
    <Paper withBorder p="sm" radius="lg" mx="md" bg="var(--mantine-color-body)">
      <Stack gap="xs">
        <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={0.8}>
          Centro rápido
        </Text>
        <Group grow align="stretch" preventGrowOverflow={false}>
          <Paper withBorder p="xs" radius="md">
            <Stack gap={4} align="center">
              <NotificationBell />
              <Text size="xs" fw={600} ta="center">
                Notificações
              </Text>
            </Stack>
          </Paper>

          <Paper
            component={Link}
            to={taskLink}
            onClick={isMobile ? onClose : undefined}
            withBorder
            p="xs"
            radius="md"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Stack gap={4} align="center">
              <ThemeIcon variant="light" color="blue" size={38} radius="md">
                <ClipboardCheck size={18} />
              </ThemeIcon>
              <Text size="xs" fw={600} ta="center">
                Tarefas
              </Text>
              <Text size="10px" c="dimmed" ta="center">
                Agendamentos RPA
              </Text>
            </Stack>
          </Paper>

          <Paper
            component={Link}
            to={activityLink}
            onClick={isMobile ? onClose : undefined}
            withBorder
            p="xs"
            radius="md"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Stack gap={4} align="center">
              <ThemeIcon variant="light" color="blue" size={38} radius="md">
                <Activity size={18} />
              </ThemeIcon>
              <Text size="xs" fw={600} ta="center">
                Atividades
              </Text>
              <Text size="10px" c="dimmed" ta="center">
                Logs do sistema
              </Text>
            </Stack>
          </Paper>
        </Group>
      </Stack>
    </Paper>
  );
}

function SidebarContent({
  collapsed,
  isMobile,
  onToggleCollapsed,
  onClose,
}) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpened, setSearchModalOpened] = useState(false);
  const [userOpenSubmenus, setUserOpenSubmenus] = useState({});

  const filteredGroups = useMemo(
    () => filterMenuGroups(searchQuery),
    [searchQuery],
  );

  const filteredModalGroups = useMemo(
    () => filterMenuGroups(searchQuery),
    [searchQuery],
  );

  const activeParents = useMemo(() => {
    const active = {};
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (!item.submenu) return;
        const activeChild = item.submenu.some((sub) => location.pathname === sub.path);
        if (activeChild) active[item.path] = true;
      });
    });
    return active;
  }, [location.pathname]);

  const openSubmenus = useMemo(
    () => ({ ...activeParents, ...userOpenSubmenus }),
    [activeParents, userOpenSubmenus],
  );

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const navGroups = filteredGroups.map((group) => (
    <Box key={group.label}>
      {!collapsed && !isMobile && (
        <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={0.8} mb={6} px="md">
          {group.label}
        </Text>
      )}

      {collapsed && !isMobile && <Divider mx="md" mb="xs" />}

      <Stack gap={4} px={collapsed && !isMobile ? "sm" : "md"}>
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isMobile={isMobile}
            openSubmenus={openSubmenus}
            onToggleSubmenu={(path) => {
              setUserOpenSubmenus((prev) => ({ ...prev, [path]: !prev[path] }));
            }}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </Stack>
    </Box>
  ));

  return (
    <Box h="100%" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SidebarHeader
        collapsed={collapsed}
        isMobile={isMobile}
        onToggleCollapsed={onToggleCollapsed}
        onClose={onClose}
      />

      <Divider />

      <Box py="sm" style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="100%" type="auto" offsetScrollbars>
          <Stack gap="md">
            <SearchArea
              isMobile={isMobile}
              collapsed={collapsed}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenSearchModal={() => setSearchModalOpened(true)}
            />

            <QuickCenter
              collapsed={collapsed}
              isMobile={isMobile}
              onClose={onClose}
            />

            <Divider mx="md" />

            {navGroups}

            {searchQuery.trim() && filteredGroups.length === 0 && (
              <Box px="md" py="lg">
                <Text ta="center" c="dimmed" size="sm">
                  Nenhum resultado
                </Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>
      </Box>

      <Box p="md">
        <Divider mb="md" />
        <Button
          fullWidth={!collapsed || isMobile}
          variant="light"
          color="red"
          leftSection={<LogOut size={16} />}
          onClick={handleLogout}
        >
          {collapsed && !isMobile ? null : "Sair do Sistema"}
        </Button>

        {!collapsed && !isMobile && (
          <Text size="xs" c="dimmed" ta="center" mt="sm">
            Hub Contábil v{VERSION} © 2026
          </Text>
        )}
      </Box>

      <Drawer
        opened={searchModalOpened}
        onClose={() => setSearchModalOpened(false)}
        title="Pesquisar navegação"
        position="right"
        size="md"
        overlayProps={{ opacity: 0.35, blur: 4 }}
      >
        <Stack gap="md">
          <TextInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="Buscar páginas, grupos ou subitens..."
            leftSection={<Search size={16} />}
            leftSectionPointerEvents="none"
          />

          <ScrollArea h={460} type="auto">
            <Stack gap="sm">
              {filteredModalGroups.map((group) => (
                <Box key={group.label}>
                  <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={0.8} mb={6}>
                    {group.label}
                  </Text>
                  <Stack gap={4}>
                    {group.items.map((item) => {
                      const hasSubmenu = Boolean(item.submenu?.length);
                      const isActive = location.pathname === item.path;

                      return (
                        <Button
                          key={item.path}
                          component={Link}
                          to={item.path}
                          variant={isActive ? "light" : "subtle"}
                          color="blue"
                          justify="space-between"
                          leftSection={<item.icon size={16} />}
                          rightSection={hasSubmenu ? <ArrowRight size={14} /> : null}
                          onClick={() => setSearchModalOpened(false)}
                        >
                          {item.text}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>
              ))}

              {searchQuery.trim() && filteredModalGroups.length === 0 && (
                <Text ta="center" c="dimmed" size="sm" py="lg">
                  Nenhum resultado encontrado
                </Text>
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Drawer>
    </Box>
  );
}

export function AppSidebar({
  isMobile = false,
  opened = false,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}) {
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="left"
        size={layoutTokens.mobileDrawerWidth}
        withCloseButton={false}
        padding={0}
        trapFocus
        closeOnClickOutside
      >
        <SidebarContent
          isMobile
          collapsed={false}
          onClose={onClose}
          onToggleCollapsed={onToggleCollapsed}
        />
      </Drawer>
    );
  }

  return (
    <AppShell.Navbar p={0} withBorder>
      <SidebarContent
        collapsed={collapsed}
        isMobile={false}
        onToggleCollapsed={onToggleCollapsed}
      />
    </AppShell.Navbar>
  );
}
