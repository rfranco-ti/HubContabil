import React, { useState } from "react";
import {
  AppShell,
  Group,
  Text,
  ActionIcon,
  Menu,
  Avatar,
  Box,
  Indicator,
  Tooltip,
  Burger,
} from "@mantine/core";
import {
  Search,
  Bell,
  BellRing,
  Sun,
  Moon,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useHotkeys } from "@mantine/hooks";
import { SearchBar } from "./SearchBar";
import { NotificationModal } from "./NotificationModal";
import { useTheme } from "../context/useTheme";

export function AppHeader({ burgerOpened, toggleBurger }) {
  const { theme, toggleTheme } = useTheme();
  const [searchOpened, setSearchOpened] = useState(false);
  const [notifOpened, setNotifOpened] = useState(false);
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Novo Cliente Cadastrado",
      message: "A empresa 'Tecnologia Avançada LTDA' foi adicionada.",
      time: "Há 10 minutos",
      read: false,
    },
    {
      id: 2,
      title: "Relatório Mensal Disponível",
      message: "O relatório de faturamento de Março já pode ser baixado.",
      time: "Há 2 horas",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useHotkeys([["mod+K", () => setSearchOpened(true)]]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AppShell.Header px="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
      <Group justify="space-between" h="100%" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Burger opened={burgerOpened} onClick={toggleBurger} hiddenFrom="lg" size="sm" />
          <Group gap="xs" wrap="nowrap">
            <Box bg="blue.5" p={6} style={{ borderRadius: "var(--mantine-radius-md)", display: "flex" }}>
              <LayoutGrid size={20} color="white" />
            </Box>
            <Text fw={800} size="lg" lts={-0.5} c="blue.5" truncate>
              HubContabil
            </Text>
          </Group>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Tooltip label="Pesquisar (Ctrl+K)">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => setSearchOpened(true)} visibleFrom="xs">
              <Search size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Notificações">
            <Indicator inline label={unreadCount} size={16} disabled={unreadCount === 0} color="red" offset={4}>
              <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => setNotifOpened(true)} visibleFrom="xs">
                {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
              </ActionIcon>
            </Indicator>
          </Tooltip>

          <Tooltip label={theme === "dark" ? "Modo Claro" : "Modo Escuro"}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleTheme} visibleFrom="sm">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>
          </Tooltip>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Group gap="xs" style={{ cursor: "pointer" }} ml="xs" wrap="nowrap">
                <Avatar radius="xl" size="sm" color="blue">RF</Avatar>
                <Box visibleFrom="md">
                  <Text size="xs" fw={700} lh={1} truncate>Ricardo Franco</Text>
                  <Text size="10px" c="dimmed" truncate>Administrador</Text>
                </Box>
                <Box visibleFrom="md" style={{ display: 'flex', alignItems: 'center' }}>
                  <ChevronDown size={12} opacity={0.5} />
                </Box>
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Minha Conta</Menu.Label>
              <Menu.Item leftSection={<User size={14} />}>Perfil</Menu.Item>
              <Menu.Item leftSection={<Settings size={14} />}>Configurações</Menu.Item>
              {/* Mobile-only tools in the menu */}
              <Menu.Item leftSection={theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} onClick={toggleTheme} hiddenFrom="sm">
                Tema: {theme === "dark" ? "Claro" : "Escuro"}
              </Menu.Item>
              <Menu.Item leftSection={<Search size={14} />} onClick={() => setSearchOpened(true)} hiddenFrom="xs">
                Pesquisar
              </Menu.Item>
              <Menu.Item leftSection={<Bell size={14} />} onClick={() => setNotifOpened(true)} hiddenFrom="xs">
                Notificações
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<LogOut size={14} />}>Sair do Sistema</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <SearchBar opened={searchOpened} onClose={() => setSearchOpened(false)} />
      <NotificationModal
        opened={notifOpened}
        onClose={() => setNotifOpened(false)}
        notifications={notifications}
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
      />
    </AppShell.Header>
  );
}
