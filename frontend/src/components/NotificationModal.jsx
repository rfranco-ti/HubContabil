import React from "react";
import {
  Modal,
  ScrollArea,
  Stack,
  Text,
  Group,
  ActionIcon,
  Badge,
  Paper,
  Box,
  Divider,
} from "@mantine/core";
import { Bell, BellOff, Check, Trash } from "lucide-react";

export function NotificationModal({
  opened,
  onClose,
  notifications = [],
  onMarkAllRead,
  onClearAll,
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700}>Notificações</Text>
          {unreadCount > 0 && (
            <Badge color="red" variant="filled" size="sm">
              {unreadCount} novas
            </Badge>
          )}
        </Group>
      }
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Gerencie seus avisos e atualizações do sistema
          </Text>
          <Group gap={5}>
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={onMarkAllRead}
              title="Marcar todas como lidas"
            >
              <Check size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={onClearAll}
              title="Limpar todas"
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider />

        {notifications.length === 0 ? (
          <Box py="xl" ta="center">
            <BellOff size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
            <Text c="dimmed" size="sm" mt="sm">
              Nenhuma notificação por enquanto.
            </Text>
          </Box>
        ) : (
          <Stack gap="xs">
            {notifications.map((notification) => (
              <Paper
                key={notification.id}
                withBorder
                p="sm"
                bg={notification.read ? "transparent" : "var(--mantine-color-blue-light)"}
                style={{ cursor: "pointer" }}
              >
                <Group wrap="nowrap" align="start">
                  <Box
                    w={8}
                    h={8}
                    bg={notification.read ? "transparent" : "blue"}
                    style={{ borderRadius: "50%", marginTop: 6, flexShrink: 0 }}
                  />
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={notification.read ? 400 : 600}>
                      {notification.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {notification.message}
                    </Text>
                    <Text size="10px" c="dimmed" mt={4}>
                      {notification.time}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
