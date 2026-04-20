import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Indicator,
  Loader,
  Paper,
  Popover,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  Bell,
  CheckCheck,
  Clock3,
  Trash2,
} from "lucide-react";
import { notificacoesAPI } from "../services/notificacoesAPI";

export default function NotificationBell() {
  const [opened, setOpened] = useState(false);
  const [count, setCount] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarContador();
    const interval = setInterval(carregarContador, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (opened) {
      carregarNotificacoes();
    }
  }, [opened]);

  const carregarContador = async () => {
    try {
      const data = await notificacoesAPI.contarNaoLidas();
      setCount(data.count || 0);
    } catch {
      // Ignora falhas quando o usuário não está autenticado
    }
  };

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await notificacoesAPI.listarNaoLidas();
      setNotificacoes(data.notificacoes || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLida = async (id) => {
    try {
      await notificacoesAPI.marcarComoLida(id);
      setNotificacoes((prev) => prev.filter((notif) => notif.id !== id));
      setCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      await notificacoesAPI.marcarTodasComoLidas();
      setNotificacoes([]);
      setCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleDeletar = async (id, event) => {
    event.stopPropagation();

    try {
      await notificacoesAPI.deletar(id);
      setNotificacoes((prev) => prev.filter((notif) => notif.id !== id));
      setCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  const formatarTempo = (dataEnvio) => {
    const agora = new Date();
    const data = new Date(dataEnvio);
    const diffMs = agora - data;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias}d atrás`;
    return data.toLocaleDateString("pt-BR");
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={380}
      shadow="xl"
      radius="lg"
      withinPortal
      trapFocus={false}
    >
      <Popover.Target>
        <Indicator
          inline
          label={count > 99 ? "99+" : count}
          disabled={count === 0}
          color="red"
          size={16}
          offset={4}
        >
          <ActionIcon
            size="lg"
            radius="md"
            variant="subtle"
            aria-label="Notificações"
            onClick={() => setOpened((value) => !value)}
          >
            <Bell size={18} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="md" pb="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Box>
              <Text fw={800} size="sm">
                Notificações
              </Text>
              {count > 0 && (
                <Text size="xs" c="dimmed">
                  {count} não lida{count > 1 ? "s" : ""}
                </Text>
              )}
            </Box>

            {notificacoes.length > 0 && (
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                radius="md"
                onClick={handleMarcarTodasLidas}
                aria-label="Marcar todas como lidas"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} />
              </ActionIcon>
            )}
          </Group>
        </Box>

        <Divider />

        <ScrollArea h={420} type="auto">
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : notificacoes.length === 0 ? (
            <Box py="xl" px="md">
              <Stack align="center" gap="xs">
                <ThemeIcon variant="light" color="gray" size={56} radius="xl">
                  <Bell size={24} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  Nenhuma notificação
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  Você será notificado sobre eventos e feriados
                </Text>
              </Stack>
            </Box>
          ) : (
            <Stack gap={0}>
              {notificacoes.map((notif) => (
                <Paper
                  key={notif.id}
                  withBorder={false}
                  radius={0}
                  p="md"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleMarcarLida(notif.id)}
                >
                  <Group align="flex-start" gap="sm" wrap="nowrap">
                    <ThemeIcon variant="light" color="gray" size={44} radius="md">
                      {notif.tipoEvento?.icone || "⏰"}
                    </ThemeIcon>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Text size="sm" fw={700} truncate>
                          {notif.titulo}
                        </Text>

                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          radius="md"
                          onClick={(event) => handleDeletar(notif.id, event)}
                          aria-label="Remover notificação"
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>

                      <Text size="xs" c="dimmed" mt={4} lineClamp={2}>
                        {notif.mensagem}
                      </Text>

                      <Group gap={6} mt={8} wrap="nowrap">
                        <Clock3 size={12} />
                        <Text size="xs" c="dimmed">
                          {formatarTempo(notif.dataEnvio)}
                        </Text>

                        {notif.tipoAlerta === "UM_DIA_ANTE" && (
                          <Badge size="xs" variant="light" color="yellow">
                            Amanhã
                          </Badge>
                        )}

                        {notif.tipoAlerta === "NO_DIA" && (
                          <Badge size="xs" variant="light" color="blue">
                            Hoje
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </ScrollArea>

        {notificacoes.length > 0 && (
          <Divider />
        )}

        {notificacoes.length > 0 && (
          <Box p="sm">
            <Text size="xs" c="dimmed" ta="center">
              Mostrando {notificacoes.length} notificação
              {notificacoes.length > 1 ? "es" : ""}
            </Text>
          </Box>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
