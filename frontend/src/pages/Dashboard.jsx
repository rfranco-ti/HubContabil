import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  Shield,
  FileCheck,
  Bell,
  Calendar as CalendarIcon,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  Clock,
  Activity,
  Calculator,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  CalendarDays,
} from "lucide-react";
import {
  Grid,
  SimpleGrid,
  Card,
  Text,
  Title,
  Badge,
  ActionIcon,
  Group,
  Stack,
  Box,
  Button,
  Loader,
  Alert,
  Center,
  ScrollArea,
  Divider,
  Avatar,
  ThemeIcon,
  Paper,
  useMantineTheme,
} from "@mantine/core";
import { toast } from "sonner";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

import api from "../services/api";

import feriadosJSON from "../data/feriados_2026.json";
import obrigacoesJSON from "../data/obrigacoes_2026.json";

const fmtCurrency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtNumber = (v) => new Intl.NumberFormat("pt-BR").format(v || 0);

const getEventsForDate = (date, calendarioData) => {
  if (!date || !calendarioData) return [];
  const diaString = String(date.getDate()).padStart(2, '0');
  const dataFormatada = dayjs(date).format('DD/MM/YYYY');
  const nomeMes = dayjs(date).locale('pt-br').format('MMMM');
  const mesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  const lista = [];
  const feriados = (calendarioData.feriados || []).filter(f => f.data === dataFormatada);
  feriados.forEach(f => lista.push({ tipo: 'FERIADO', titulo: f.nome, descricao: f.descricao, cor: 'red' }));

  const obrigacoes = calendarioData.obrigacoes[mesCapitalizado]?.[diaString];
  if (obrigacoes && Array.isArray(obrigacoes)) {
    obrigacoes.forEach(o => {
      const titulo = typeof o === 'object' ? o.eventName : o;
      const sub = typeof o === 'object' ? `${o.eventPeriod} • ${o.eventBase}` : 'Obrigação fiscal agendada.';
      const cat = (typeof o === 'object' ? o.calendar : 'FISCAL') || 'FISCAL';
      const cor = cat.toLowerCase().includes('trabalhista') ? 'green' : 'blue';
      lista.push({ tipo: cat.toUpperCase(), titulo, descricao: sub, cor });
    });
  }
  return lista;
};

function KPICard({ title, value, subtitle, icon: Icon, color, onClick }) {
  return (
    <Card withBorder padding="md" radius="md" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Group justify="space-between" mb="xs">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
        <ThemeIcon variant="light" color={color} size="md"><Icon size={16} /></ThemeIcon>
      </Group>
      <Title order={3} fw={800}>{value}</Title>
      <Text size="xs" c="dimmed">{subtitle}</Text>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  
  const [kpis, setKpis] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [calendarioData, setCalendarioData] = useState({ feriados: [], obrigacoes: {} });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayedDate, setDisplayedDate] = useState(new Date());

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Calendário (estático por enquanto via JSONs locais)
      const dataCalendario = {
        feriados: feriadosJSON.feriados_consolidados_2026 || [],
        obrigacoes: obrigacoesJSON["2026"] || {}
      };
      setCalendarioData(dataCalendario);

      // 2. Dados Reais do Backend
      const response = await api.get("/dashboard");
      const { dashboard } = response.data;

      if (dashboard) {
        // Mapear KPIs
        setKpis({
          clientes: { 
            ativos: dashboard.kpis?.clientes?.ativos || 0, 
            total: dashboard.kpis?.clientes?.total || 0 
          },
          honorarios: { 
            total: dashboard.kpis?.honorarios?.total || 0 
          },
          certificados: { 
            validos: dashboard.kpis?.certificados?.validos || 0, 
            expirando: dashboard.kpis?.certificados?.expirando || [] 
          },
          documentos: { 
            mes: dashboard.kpis?.documentos?.mes || 0 
          },
          notificacoes: { 
            naoLidas: dashboard.kpis?.notificacoes?.naoLidas || 0 
          }
        });

        // Mapear Atividades
        if (dashboard.atividades && Array.isArray(dashboard.atividades)) {
          setAtividades(dashboard.atividades.map(a => ({
            id: Math.random(), // id temporário para key
            titulo: a.titulo,
            descricao: a.descricao,
            tempo: a.tempoRelativo,
            cor: a.cor
          })));
        }
      }

      // Encontra data inicial com eventos no calendário
      const hoje = new Date();
      if (getEventsForDate(hoje, dataCalendario).length > 0) {
        setDisplayedDate(hoje);
        setSelectedDate(hoje);
      } else {
        // Buscar o próximo dia com evento
        for (let d = 1; d <= 31; d++) {
          const test = new Date(hoje.getFullYear(), hoje.getMonth(), d);
          if (test.getMonth() !== hoje.getMonth()) break;
          if (getEventsForDate(test, dataCalendario).length > 0) {
            setDisplayedDate(test);
            setSelectedDate(test);
            break;
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados do dashboard:", e);
      toast.error("Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const allEventDates = useMemo(() => {
    if (!calendarioData) return [];
    const dates = [];
    const year = 2026; // current data scope
    
    Object.keys(calendarioData.obrigacoes || {}).forEach(monthName => {
      const monthMap = {
        "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5,
        "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11
      };
      const monthIndex = monthMap[monthName];
      if (monthIndex === undefined) return;

      Object.keys(calendarioData.obrigacoes[monthName]).forEach(dayStr => {
        if (calendarioData.obrigacoes[monthName][dayStr].length > 0) {
          dates.push(new Date(year, monthIndex, parseInt(dayStr, 10)));
        }
      });
    });

    if (calendarioData.feriados) {
      calendarioData.feriados.forEach(f => {
        const [day, month, fYear] = f.data.split('/');
        dates.push(new Date(parseInt(fYear, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
      });
    }
    
    const uniqueDatesMap = {};
    dates.forEach(d => {
      uniqueDatesMap[d.getTime()] = d;
    });
    return Object.values(uniqueDatesMap).sort((a, b) => a - b);
  }, [calendarioData]);

  const goToPrevEvent = () => {
    if (allEventDates.length === 0) return;
    const currentIndex = allEventDates.findIndex(d => dayjs(d).isSame(dayjs(displayedDate), 'day'));
    if (currentIndex > 0) {
      const prevDate = allEventDates[currentIndex - 1];
      setDisplayedDate(prevDate);
      setSelectedDate(prevDate);
    }
  };

  const goToNextEvent = () => {
    if (allEventDates.length === 0) return;
    const currentIndex = allEventDates.findIndex(d => dayjs(d).isSame(dayjs(displayedDate), 'day'));
    if (currentIndex >= 0 && currentIndex < allEventDates.length - 1) {
      const nextDate = allEventDates[currentIndex + 1];
      setDisplayedDate(nextDate);
      setSelectedDate(nextDate);
    } else if (currentIndex === -1 && allEventDates.length > 0) {
      setDisplayedDate(allEventDates[0]);
      setSelectedDate(allEventDates[0]);
    }
  };

  const handleDateChange = (date) => {
    if (!date) return;
    setSelectedDate(date);
    
    const eventos = getEventsForDate(date, calendarioData);
    if (eventos.length > 0) {
      setDisplayedDate(date);
    }
  };

  const renderDay = (date) => {
    const day = date.getDate();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const temEvento = getEventsForDate(date, calendarioData).length > 0;
    const isSelected = dayjs(date).isSame(dayjs(selectedDate), 'day');

    return (
      <Box style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'flex-start', // Top-left alignment for industrial grid feel
        justifyContent: 'flex-start',
        padding: '8px',
        backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}>
        <Text size="sm" fw={isSelected ? 800 : 600} c={isSelected ? 'blue.7' : (isWeekend ? 'red.6' : 'gray.8')}>
          {day}
        </Text>
        {temEvento && (
          <Box style={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mantine-color-blue-6)' }} />
        )}
      </Box>
    );
  };

  const eventosExibidos = useMemo(() => getEventsForDate(displayedDate, calendarioData), [displayedDate, calendarioData]);

  if (loading) return <Center h="100vh"><Loader size="xl" type="bars" /></Center>;

  return (
    <Box p="md" className="max-w-[1400px] mx-auto">
      <Group justify="space-between" mb="lg">
        <Stack gap={0}><Title order={2} fw={800}>Dashboard</Title><Text c="dimmed" size="sm">HubContabil • Gestão Fiscal</Text></Stack>
        <Button variant="light" leftSection={<RefreshCw size={16} />} onClick={carregarDados}>Atualizar</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" mb="xl">
        <KPICard 
          title="Clientes" 
          value={fmtNumber(kpis.clientes.ativos)} 
          subtitle="Ativos" 
          icon={Users} 
          color="blue" 
          onClick={() => navigate("/clientes")} 
        />
        <KPICard 
          title="Honorários" 
          value={fmtCurrency(kpis.honorarios.total)} 
          subtitle="Março" 
          icon={DollarSign} 
          color="green" 
          onClick={() => navigate("/clientes")} 
        />
        <KPICard 
          title="Certificados" 
          value={kpis.certificados.validos} 
          subtitle="Válidos" 
          icon={Shield} 
          color="orange" 
          onClick={() => navigate("/certificados")} 
        />
        <KPICard 
          title="Docs" 
          value={kpis.documentos.mes} 
          subtitle="Mês" 
          icon={FileCheck} 
          color="cyan" 
          onClick={() => navigate("/documentos")} 
        />
        <KPICard 
          title="Alertas" 
          value={kpis.notificacoes.naoLidas} 
          subtitle="Pendentes" 
          icon={Bell} 
          color="red" 
        />
      </SimpleGrid>

      <Card withBorder radius="md" padding={0} mb="xl">
        <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <Group justify="space-between">
            <Group gap="xs"><CalendarDays size={20} className="text-blue-600"/><Title order={4}>Agenda de Obrigações</Title></Group>
            <Badge variant="light" size="lg" radius="sm">2026</Badge>
          </Group>
        </Box>
        <Grid gutter={0} align="stretch">
          <Grid.Col span={{ base: 12, md: 5 }} p="md" style={{ display: 'flex', flexDirection: 'column' }}>
            <Box style={{ flex: 1 }}>
              <Calendar
                locale="pt-br"
                firstDayOfWeek={0}
                value={selectedDate}
                onChange={handleDateChange}
                getDayProps={(date) => ({
                  onClick: () => handleDateChange(date)
                })}
                renderDay={renderDay}
                size="md"
                nextIcon={<ChevronRight size={18} />}
                previousIcon={<ChevronLeft size={18} />}
                styles={{
                  month: { width: '100%', borderCollapse: 'collapse' },
                  monthCell: { border: '1px solid var(--mantine-color-gray-3)', padding: 0 },
                  day: { height: 80, width: '100%', borderRadius: 0, padding: 0, border: 0 },
                  weekday: { 
                    fontSize: '11px', fontWeight: 700, color: 'var(--mantine-color-gray-6)',
                    backgroundColor: 'var(--mantine-color-gray-0)', height: 40,
                    border: '1px solid var(--mantine-color-gray-3)', textAlign: 'center'
                  },
                  calendarHeader: { 
                    padding: '10px', height: 60, display: 'flex', 
                    justifyContent: 'space-between', alignItems: 'center' 
                  },
                  calendarHeaderControl: { width: 34, height: 34, borderRadius: '4px' },
                  calendarHeaderLevel: { fontSize: '16px', fontWeight: 700, flex: 1, textAlign: 'center' }
                }}
              />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }} p="xl" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Stack h="100%" gap="md">
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text fw={800} size="xl" lh={1.2}>{dayjs(displayedDate).format('DD [de] MMMM')}</Text>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Obrigações e vencimentos</Text>
                </Box>
                <Group gap={4}>
                  <ActionIcon variant="light" color="gray" radius="md" size="lg" onClick={goToPrevEvent} disabled={allEventDates.findIndex(d => dayjs(d).isSame(dayjs(displayedDate), 'day')) <= 0}>
                    <ChevronLeft size={20} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="gray" radius="md" size="lg" onClick={goToNextEvent} disabled={allEventDates.findIndex(d => dayjs(d).isSame(dayjs(displayedDate), 'day')) >= allEventDates.length - 1}>
                    <ChevronRight size={20} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="blue" radius="md" size="lg" ml="xs">
                    <Info size={20}/>
                  </ActionIcon>
                </Group>
              </Group>
              <Divider variant="dashed" />
              <ScrollArea h={320} offsetScrollbars>
                <Stack gap="sm">
                  {eventosExibidos.length > 0 ? (
                    eventosExibidos.map((ev, idx) => (
                      <Paper key={idx} withBorder p="md" radius="md" bg="white" shadow="xs">
                        <Group wrap="nowrap" gap="md">
                          <ThemeIcon variant="light" color={ev.cor} size="lg" radius="md">
                            {ev.tipo === 'FERIADO' ? <CalendarIcon size={18} /> : <Clock size={18} />}
                          </ThemeIcon>
                          <Box style={{ flex: 1 }}>
                            <Group justify="space-between" mb={2}>
                              <Text size="sm" fw={700}>{ev.titulo}</Text>
                              <Badge color={ev.cor} variant="outline" size="xs">{ev.tipo}</Badge>
                            </Group>
                            <Text size="xs" c="dimmed">{ev.descricao}</Text>
                          </Box>
                        </Group>
                      </Paper>
                    ))
                  ) : (
                    <Center p="xl"><Text size="sm" c="dimmed">Nenhum evento agendado.</Text></Center>
                  )}
                </Stack>
              </ScrollArea>
              <Button fullWidth size="md" mt="auto" onClick={() => navigate('/calendario')} rightSection={<ChevronRight size={18} />}>Ver Calendário Completo</Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>
    </Box>
  );
}
