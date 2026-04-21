import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Building,
  MoreVertical,
  Trash2,
  Eye,
  Edit2,
  FolderOpen,
  Receipt,
  Users,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from "lucide-react";
import { 
  Button, 
  ActionIcon, 
  Menu, 
  Badge, 
  TextInput, 
  Group, 
  Stack, 
  Title, 
  Text, 
  Card, 
  Center, 
  Alert, 
  Box,
  ThemeIcon,
  Loader,
  Pagination,
  Divider
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { DataTable } from 'mantine-datatable';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { clientesAPI } from "../services/api";
import { formatPhoneDisplay, formatCnpj } from "../utils/masks";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // DataTable state
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState({ columnAccessor: 'razao_social', direction: 'asc' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAll();
      setClientes(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) return;
      let errorMessage = "Erro ao carregar clientes.";
      if (err.response) {
        if (err.response.status === 500) {
          errorMessage = "Erro no servidor. Verifique se o backend está rodando.";
        } else {
          errorMessage = `Erro ${err.response.status}: ${err.response.data?.message || ""}`;
        }
      } else if (err.request) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cliente) => {
    const razaoSocial = cliente.razao_social || cliente.nome_fantasia || "Este cliente";
    if (!confirm(`Tem certeza que deseja excluir "${razaoSocial}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await clientesAPI.delete(cliente._id);
      setClientes(clientes.filter((c) => c._id !== cliente._id));
      toast.success("Cliente excluído com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir cliente.");
      console.error(err);
    }
  };

  const filteredAndSortedRecords = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let filtered = clientes.filter((cliente) => 
      cliente.razao_social?.toLowerCase().includes(term) ||
      cliente.nome_fantasia?.toLowerCase().includes(term) ||
      cliente.cnpj?.includes(term)
    );

    const { columnAccessor, direction } = sortStatus;
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[columnAccessor];
      let bVal = b[columnAccessor];

      if (columnAccessor === 'contato') {
        aVal = a.contato_principal?.telefone || '';
        bVal = b.contato_principal?.telefone || '';
      }

      if (typeof aVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return sorted;
  }, [clientes, searchTerm, sortStatus]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    return filteredAndSortedRecords.slice(from, to);
  }, [page, filteredAndSortedRecords]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Ativo": return "green";
      case "Inativo": return "gray";
      case "Suspenso": return "red";
      default: return "blue";
    }
  };

  const ActionMenu = ({ record }) => (
    <Menu shadow="md" width={200} position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
          <MoreVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        <Menu.Item leftSection={<Eye size={14} />} onClick={() => navigate(`/empresa/${record.cnpj.replace(/\D/g, "")}`)}>Ver Detalhes</Menu.Item>
        <Menu.Item leftSection={<Edit2 size={14} />} onClick={() => navigate(`/empresa/${record.cnpj.replace(/\D/g, "")}`)}>Editar</Menu.Item>
        <Menu.Item leftSection={<FolderOpen size={14} />} onClick={() => toast.info("Em breve: Documentos do cliente")}>Documentos</Menu.Item>
        <Menu.Item leftSection={<Receipt size={14} />} onClick={() => toast.info("Em breve: Gerar recibo de honorários")}>Gerar Recibo</Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => handleDelete(record)}>Excluir</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (loading) {
    return (
      <Center h="100vh">
        <Stack align="center">
          <Loader size="xl" type="bars" />
          <Text c="dimmed" fw={500}>Carregando clientes...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box p={{ base: 'md', md: 'xl' }} className="max-w-[1600px] mx-auto h-full flex flex-col">
      <Group justify="space-between" mb="xl" align="flex-start">
        <Group gap="md">
          <ThemeIcon size={48} radius="md" variant="light" color="blue">
            <Users size={24} />
          </ThemeIcon>
          <Box>
            <Title order={2} fw={800} c="dark.9" className="dark:text-white">Clientes</Title>
            <Text c="dimmed" size="sm">Gerencie as empresas e acesse rapidamente seus dados fiscais</Text>
          </Box>
        </Group>
        
        <Group gap="sm" w={{ base: '100%', sm: 'auto' }}>
          <Button 
            variant="default" 
            leftSection={<Search size={16} />} 
            onClick={() => navigate("/pesquisa/empresas")}
            flex={{ base: 1, sm: 'none' }}
          >
            Pesquisar CNPJ
          </Button>
          <Button 
            leftSection={<Plus size={16} />} 
            onClick={() => navigate("/clientes/novo")}
            flex={{ base: 1, sm: 'none' }}
          >
            Novo Cliente
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert icon={<AlertCircle size={16} />} title="Erro!" color="red" variant="light" mb="xl">
          <Text size="sm">{error}</Text>
          <Button variant="subtle" color="red" size="xs" mt="sm" onClick={fetchClientes}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {!error && clientes.length === 0 ? (
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Center py={40}>
            <Stack align="center" gap="md">
              <ThemeIcon size={80} radius="100%" variant="light" color="gray">
                <Building size={40} />
              </ThemeIcon>
              <Title order={3}>Nenhum cliente cadastrado</Title>
              <Text c="dimmed" ta="center" maw={400}>Comece adicionando uma nova empresa ao seu portfólio.</Text>
              <Group mt="md">
                <Button variant="default" onClick={() => navigate("/pesquisa/empresas")} leftSection={<Search size={16} />}>Pesquisar</Button>
                <Button onClick={() => navigate("/clientes/novo")} leftSection={<Plus size={16} />}>Cadastrar</Button>
              </Group>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Card withBorder padding={0} radius="md" shadow="sm" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }} className="dark:border-slate-800 dark:bg-slate-900">
            <Group justify="space-between">
              <TextInput
                placeholder="Buscar por Razão Social, Fantasia ou CNPJ..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                w={{ base: '100%', sm: 400 }}
              />
              <Text size="sm" c="dimmed" fw={500}>
                {filteredAndSortedRecords.length} de {clientes.length} clientes
              </Text>
            </Group>
          </Box>

          <Box style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }} className="dark:bg-slate-900">
            {!isMobile ? (
              <DataTable
                withTableBorder={false}
                withColumnBorders={false}
                striped
                highlightOnHover
                records={paginatedRecords}
                columns={[
                  {
                    accessor: 'razao_social',
                    title: 'Empresa',
                    sortable: true,
                    render: (record) => (
                      <Group wrap="nowrap" gap="sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/empresa/${record.cnpj.replace(/\D/g, "")}`)}>
                        <ThemeIcon variant="light" color="blue" size="md" radius="xl">
                          <Building size={14} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={600} size="sm">{record.razao_social}</Text>
                          {record.nome_fantasia && <Text size="xs" c="dimmed">{record.nome_fantasia}</Text>}
                        </Box>
                      </Group>
                    ),
                  },
                  {
                    accessor: 'cnpj',
                    title: 'CNPJ',
                    sortable: true,
                    render: (record) => <Text size="sm" ff="monospace" c="dimmed">{formatCnpj(record.cnpj)}</Text>,
                  },
                  {
                    accessor: 'contato',
                    title: 'Contato Principal',
                    sortable: true,
                    render: (record) => (
                      <Box>
                        {record.contato_principal?.telefone ? (
                          <Text size="sm">{formatPhoneDisplay(record.contato_principal.telefone)}</Text>
                        ) : <Text size="sm" c="dimmed">—</Text>}
                        {record.contato_principal?.email ? (
                          <Text size="xs" c="dimmed">{record.contato_principal.email}</Text>
                        ) : null}
                      </Box>
                    ),
                  },
                  {
                    accessor: 'status',
                    title: 'Status',
                    sortable: true,
                    render: (record) => (
                      <Badge color={getStatusColor(record.status)} variant="light">
                        {record.status}
                      </Badge>
                    ),
                  },
                  {
                    accessor: 'acoes',
                    title: 'Ações',
                    textAlign: 'right',
                    render: (record) => <ActionMenu record={record} />,
                  },
                ]}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                totalRecords={filteredAndSortedRecords.length}
                recordsPerPage={PAGE_SIZE}
                page={page}
                onPageChange={(p) => setPage(p)}
                noRecordsText="Nenhum cliente encontrado"
                paginationSize="sm"
              />
            ) : (
              <Box p="md" style={{ flex: 1, overflowY: 'auto' }}>
                <Stack gap="md">
                  {paginatedRecords.map(record => (
                    <Card key={record._id} withBorder radius="md" p="md" shadow="xs" onClick={() => navigate(`/empresa/${record.cnpj.replace(/\D/g, "")}`)} style={{ cursor: 'pointer' }}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
                        <Group gap="sm" wrap="nowrap">
                          <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                            <Building size={20} />
                          </ThemeIcon>
                          <Box>
                            <Text fw={700} size="sm" lineClamp={1}>{record.razao_social}</Text>
                            <Text size="xs" ff="monospace" c="dimmed">{formatCnpj(record.cnpj)}</Text>
                          </Box>
                        </Group>
                        <ActionMenu record={record} />
                      </Group>
                      
                      <Divider variant="dashed" my="sm" />
                      
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase">Status</Text>
                          <Badge color={getStatusColor(record.status)} variant="light" size="sm">{record.status}</Badge>
                        </Group>
                        {record.contato_principal?.telefone && (
                          <Group wrap="nowrap" gap="xs">
                            <Phone size={14} className="text-gray-400" />
                            <Text size="sm">{formatPhoneDisplay(record.contato_principal.telefone)}</Text>
                          </Group>
                        )}
                        {record.contato_principal?.email && (
                          <Group wrap="nowrap" gap="xs">
                            <Mail size={14} className="text-gray-400" />
                            <Text size="sm" truncate>{record.contato_principal.email}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Card>
                  ))}
                  
                  {paginatedRecords.length === 0 && (
                    <Center py="xl">
                      <Text c="dimmed">Nenhum cliente encontrado com este filtro.</Text>
                    </Center>
                  )}
                  
                  {filteredAndSortedRecords.length > PAGE_SIZE && (
                    <Center mt="md">
                      <Pagination total={Math.ceil(filteredAndSortedRecords.length / PAGE_SIZE)} value={page} onChange={setPage} size="sm" />
                    </Center>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}
