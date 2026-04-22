import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Group,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Button,
} from "@mantine/core";
import {
  Activity,
  CheckSquare2,
  LogOut,
  Mail,
  Search,
  Settings,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../../context/useTheme.js";
import { useAuth } from "../../context/AuthProvider";
import NotificationBell from "../NotificationBell";
import { menuGroups } from "../../data/menuConfig";

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

export function AppHeader({ isMobile, burgerOpened, onBurgerClick }) {
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const { user, logout } = useAuth();

  const userName = user?.nome || "Administrador";
  const userCargo = user?.role || user?.cargo || "Contador";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin = ["admin", "administrador"].includes(userCargo.toLowerCase());

  const searchResults = useMemo(() => filterMenuGroups(searchQuery), [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus?.();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const headerActionProps = {
    variant: "subtle",
    radius: "md",
    size: "lg",
  };

  return (
    <>
      <AppShell.Header
        style={{
          backdropFilter: "blur(12px)",
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group h="100%" justify="space-between" px={{ base: "sm", sm: "md", lg: "lg" }} wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger opened={burgerOpened} onClick={onBurgerClick} size="sm" aria-label="Alternar navegação" />

            <Box visibleFrom="sm" style={{ minWidth: 0 }}>
              <Text fw={800} size="sm" truncate>
                Hub Contábil
              </Text>
              <Text size="xs" c="dimmed" truncate>
                Navegação modular e responsiva
              </Text>
            </Box>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Tooltip label="Pesquisar navegação" openDelay={150}>
              <ActionIcon {...headerActionProps} onClick={() => setSearchOpen(true)} aria-label="Pesquisar navegação">
                <Search size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Notificações" openDelay={150}>
              <Box>
                <NotificationBell />
              </Box>
            </Tooltip>

            <Tooltip label="Tarefas" openDelay={150}>
              <ActionIcon
                {...headerActionProps}
                component={Link}
                to="/configs"
                aria-label="Tarefas"
              >
                <CheckSquare2 size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Atividades" openDelay={150}>
              <ActionIcon
                {...headerActionProps}
                component={Link}
                to="/logs"
                aria-label="Atividades"
              >
                <Activity size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={theme === "dark" ? "Modo claro" : "Modo escuro"} openDelay={150}>
              <ActionIcon
                {...headerActionProps}
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </ActionIcon>
            </Tooltip>

            <Menu shadow="lg" radius="md" width={280} position="bottom-end" withinPortal>
              <Menu.Target>
                <Paper
                  withBorder
                  radius="xl"
                  p={4}
                  style={{ cursor: "pointer" }}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="blue" radius="md" size="sm">
                      {userInitial}
                    </Avatar>
                    {!isMobile && (
                      <Box style={{ minWidth: 0 }}>
                        <Text size="xs" fw={700} truncate maw={120}>
                          {userName}
                        </Text>
                        <Text size="10px" c="dimmed" truncate maw={120}>
                          {userCargo}
                        </Text>
                      </Box>
                    )}
                  </Group>
                </Paper>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Perfil</Menu.Label>
                <Box px="sm" pb="xs">
                  <Text size="sm" fw={700} truncate>
                    {userName}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {userCargo}
                  </Text>
                  {userEmail && (
                    <Group gap={6} mt={4} wrap="nowrap">
                      <Mail size={12} />
                      <Text size="xs" c="dimmed" truncate>
                        {userEmail}
                      </Text>
                    </Group>
                  )}
                </Box>

                {isAdmin && (
                  <Menu.Item component={Link} to="/admin" leftSection={<Shield size={14} />}>
                    Painel Admin
                  </Menu.Item>
                )}

                <Menu.Item component={Link} to="/configs" leftSection={<Settings size={14} />}>
                  Configurações
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={handleLogout}>
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <Modal
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Pesquisar navegação"
        centered
        radius="lg"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            ref={searchRef}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="Digite para buscar páginas e atalhos..."
            leftSection={<Search size={16} />}
            leftSectionPointerEvents="none"
            size="md"
            radius="md"
          />

          <ScrollArea h={380} type="auto">
            <Stack gap="sm">
              {searchResults.map((group) => (
                <Box key={group.label}>
                  <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={0.8} mb={6}>
                    {group.label}
                  </Text>
                  <Stack gap={4}>
                    {group.items.map((item) => (
                      <Button
                        key={item.path}
                        component={Link}
                        to={item.path}
                        variant="subtle"
                        color="blue"
                        justify="space-between"
                        leftSection={<item.icon size={16} />}
                        onClick={() => setSearchOpen(false)}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ))}

              {searchQuery.trim() && searchResults.length === 0 && (
                <Text ta="center" c="dimmed" size="sm" py="lg">
                  Nenhum resultado encontrado
                </Text>
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Modal>
    </>
  );
}
