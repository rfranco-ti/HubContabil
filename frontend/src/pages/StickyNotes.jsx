import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  StickyNote,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Palette,
  ArrowLeft,
  Bell,
  BellOff,
  Grid3X3,
  Grid2X2,
  List,
  FolderPlus,
  Folder,
  FolderOpen,
  Check,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";
import { Button } from "@/components/ui";
import { notasAPI } from "../services/api";
import { toast } from "sonner";

// Cores disponíveis para notas (Microsoft Sticky Notes palette)
const CORES_NOTAS = [
  {
    id: "yellow",
    bg: "#fff740",
    border: "#e6df3a",
    label: "Amarelo",
    accent: "#ffe600",
    text: "text-gray-900",
    textLight: "text-gray-700",
    textMuted: "text-gray-600",
  },
  {
    id: "pink",
    bg: "#ff7eb9",
    border: "#e66aa5",
    label: "Rosa",
    accent: "#ff65a3",
    text: "text-white",
    textLight: "text-white/90",
    textMuted: "text-white/70",
  },
  {
    id: "blue",
    bg: "#7afcff",
    border: "#6fe5e6",
    label: "Azul",
    accent: "#5ce0e3",
    text: "text-gray-900",
    textLight: "text-gray-700",
    textMuted: "text-gray-600",
  },
  {
    id: "green",
    bg: "#a8f0a8",
    border: "#96d896",
    label: "Verde",
    accent: "#85e085",
    text: "text-gray-900",
    textLight: "text-gray-700",
    textMuted: "text-gray-600",
  },
  {
    id: "purple",
    bg: "#e8b4f8",
    border: "#d2a0e0",
    label: "Roxo",
    accent: "#d99aee",
    text: "text-gray-900",
    textLight: "text-gray-700",
    textMuted: "text-gray-600",
  },
];

// Tamanhos de notas
const TAMANHOS_NOTA = {
  pequeno: {
    label: "Nota pequena",
    height: "min-h-[180px]",
    contentLines: "line-clamp-6",
    cols: { sm: 2, md: 3, lg: 4, xl: 5, "2xl": 6 },
  },
  medio: {
    label: "Nota média",
    height: "min-h-[240px]",
    contentLines: "line-clamp-8",
    cols: { sm: 2, md: 3, lg: 4, xl: 5, "2xl": 5 },
  },
  grande: {
    label: "Nota grande",
    height: "min-h-[320px]",
    contentLines: "line-clamp-12",
    cols: { sm: 1, md: 2, lg: 3, xl: 4, "2xl": 4 },
  },
};

export default function StickyNotes() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);
  const [corSelecionada, setCorSelecionada] = useState("yellow");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Novos estados para features profissionais
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [tamanhoNota, setTamanhoNota] = useState("medio");
  const [editandoInline, setEditandoInline] = useState(null);
  const [mostrandoCores, setMostrandoCores] = useState(null);
  const [pastas, setPastas] = useState([]);
  const [pastaSelecionada, setPastaSelecionada] = useState("todas");
  const [modalPastaAberto, setModalPastaAberto] = useState(false);
  const [nomeNovaPasta, setNomeNovaPasta] = useState("");

  // Drag and drop states
  const [draggingNota, setDraggingNota] = useState(null);
  const [dragOverPasta, setDragOverPasta] = useState(null);

  const dragItem = useRef();
  const dragOverItem = useRef();

  // Carregar notas da API
  useEffect(() => {
    carregarNotas();
    carregarPastas();
  }, [pastaSelecionada]);

  async function carregarNotas() {
    try {
      setCarregando(true);
      const response = await notasAPI.listar();
      if (response.data?.success) {
        setNotas(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
      toast.error("Erro ao carregar notas");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarPastas() {
    try {
      const response = await notasAPI.listarPastas();
      if (response.data?.success) {
        setPastas(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar pastas:", error);
    }
  }

  // Criar nota
  const handleCriarNota = async (dados) => {
    try {
      setSalvando(true);
      const response = await notasAPI.criar({
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        cor: corSelecionada,
        pastaId:
          pastaSelecionada !== "todas" && pastaSelecionada !== "sem-pasta"
            ? pastaSelecionada
            : null,
      });

      if (response.data?.success) {
        setNotas([response.data.data, ...notas]);
        setModalAberto(false);
        setCorSelecionada("yellow");
        toast.success("Nota criada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar nota:", error);
      toast.error("Erro ao criar nota");
    } finally {
      setSalvando(false);
    }
  };

  // Editar nota
  const handleEditarNota = async (dados) => {
    try {
      setSalvando(true);
      const response = await notasAPI.atualizar(notaEditando.id, {
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        cor: corSelecionada,
      });

      if (response.data?.success) {
        setNotas(
          notas.map((nota) =>
            nota.id === notaEditando.id ? response.data.data : nota,
          ),
        );
        setModalAberto(false);
        setNotaEditando(null);
        setCorSelecionada("yellow");
        toast.success("Nota atualizada!");
      }
    } catch (error) {
      console.error("Erro ao editar nota:", error);
      toast.error("Erro ao editar nota");
    } finally {
      setSalvando(false);
    }
  };

  // Excluir nota
  const handleExcluirNota = async (id) => {
    try {
      const response = await notasAPI.excluir(id);
      if (response.data?.success) {
        setNotas(notas.filter((nota) => nota.id !== id));
        setSelecionadas((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success("Nota excluída");
      }
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
      toast.error("Erro ao excluir nota");
    }
  };

  // Excluir múltiplas notas
  const handleExcluirMultiplas = async () => {
    if (selecionadas.size === 0) return;

    try {
      const promises = Array.from(selecionadas).map((id) =>
        notasAPI.excluir(id),
      );
      await Promise.all(promises);

      setNotas(notas.filter((nota) => !selecionadas.has(nota.id)));
      toast.success(`${selecionadas.size} nota(s) excluída(s)`);
      setSelecionadas(new Set());
    } catch (error) {
      console.error("Erro ao excluir notas:", error);
      toast.error("Erro ao excluir notas");
    }
  };

  // Toggle seleção de nota
  const toggleSelecaoNota = (id) => {
    setSelecionadas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Selecionar/deselecionar todas
  const toggleSelecionarTodas = () => {
    if (selecionadas.size === notasFiltradas.length) {
      setSelecionadas(new Set());
    } else {
      setSelecionadas(new Set(notasFiltradas.map((n) => n.id)));
    }
  };

  // Mudar cor rapidamente
  const handleMudarCor = async (notaId, novaCor) => {
    try {
      const response = await notasAPI.atualizar(notaId, { cor: novaCor });
      if (response.data?.success) {
        setNotas(
          notas.map((nota) => (nota.id === notaId ? response.data.data : nota)),
        );
        toast.success("Cor atualizada");
      }
    } catch (error) {
      console.error("Erro ao mudar cor:", error);
      toast.error("Erro ao mudar cor");
    }
  };

  // Toggle lembrete
  const handleToggleLembrete = async (nota) => {
    try {
      const novoLembrete = !nota.lembrete;
      const response = await notasAPI.atualizar(nota.id, {
        lembrete: novoLembrete,
        dataLembrete: novoLembrete ? new Date().toISOString() : null,
      });

      if (response.data?.success) {
        setNotas(notas.map((n) => (n.id === nota.id ? response.data.data : n)));
        toast.success(
          novoLembrete ? "Lembrete ativado" : "Lembrete desativado",
        );
      }
    } catch (error) {
      console.error("Erro ao toggle lembrete:", error);
      toast.error("Erro ao atualizar lembrete");
    }
  };

  // Toggle fixar nota
  const handleToggleFixar = async (nota) => {
    try {
      const novoFixada = !nota.fixada;
      const response = await notasAPI.atualizar(nota.id, {
        fixada: novoFixada,
        dataFixacao: novoFixada ? new Date().toISOString() : null,
      });

      if (response.data?.success) {
        setNotas(notas.map((n) => (n.id === nota.id ? response.data.data : n)));
        toast.success(
          novoFixada ? "Nota fixada com sucesso!" : "Nota desafixada",
        );
      }
    } catch (error) {
      console.error("Erro ao fixar nota:", error);
      toast.error("Erro ao fixar nota");
    }
  };

  // Inline edit handlers
  const handleInlineEdit = async (notaId, dados) => {
    try {
      const response = await notasAPI.atualizar(notaId, dados);
      if (response.data?.success) {
        setNotas(
          notas.map((nota) => (nota.id === notaId ? response.data.data : nota)),
        );
        setEditandoInline(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar nota:", error);
      toast.error("Erro ao salvar");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === dragOverItem.current) return;

    const newNotas = [...notas];
    const draggedItem = newNotas[dragItem.current];
    newNotas.splice(dragItem.current, 1);
    newNotas.splice(dragOverItem.current, 0, draggedItem);

    // Update ordem
    const notasReordenadas = newNotas.map((nota, index) => ({
      ...nota,
      ordem: index,
    }));

    setNotas(notasReordenadas);

    // Salvar no backend
    try {
      await notasAPI.reordenar(
        notasReordenadas.map((n) => ({ id: n.id, ordem: n.ordem })),
      );
    } catch (error) {
      console.error("Erro ao reordenar:", error);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Drop nota em pasta
  const handleDropNaPasta = async (pastaId, notaId) => {
    try {
      const response = await notasAPI.atualizar(notaId, {
        pastaId: pastaId || null,
      });
      if (response.data?.success) {
        setNotas(notas.map((n) => (n.id === notaId ? response.data.data : n)));
        toast.success("Nota movida");
      }
    } catch (error) {
      console.error("Erro ao mover nota:", error);
      toast.error("Erro ao mover nota");
    }
  };

  // Criar pasta
  const handleCriarPasta = async () => {
    if (!nomeNovaPasta.trim()) {
      toast.error("Nome da pasta é obrigatório");
      return;
    }

    try {
      const response = await notasAPI.criarPasta({ nome: nomeNovaPasta });
      if (response.data?.success) {
        setPastas([...pastas, response.data.data]);
        setNomeNovaPasta("");
        setModalPastaAberto(false);
        toast.success("Pasta criada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      toast.error("Erro ao criar pasta");
    }
  };

  // Filtrar notas por busca e pasta
  const notasFiltradas = useMemo(() => {
    let filtered = notas;

    // Filtrar por pasta
    if (pastaSelecionada === "sem-pasta") {
      filtered = filtered.filter((n) => !n.pastaId);
    } else if (pastaSelecionada !== "todas") {
      filtered = filtered.filter((n) => n.pastaId === pastaSelecionada);
    }

    // Filtrar por busca
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.titulo.toLowerCase().includes(termo) ||
          (n.conteudo && n.conteudo.toLowerCase().includes(termo)),
      );
    }

    return filtered;
  }, [notas, busca, pastaSelecionada]);

  // Abrir modal para edição
  const handleAbrirEdicao = (nota) => {
    setNotaEditando(nota);
    setCorSelecionada(nota.cor);
    setModalAberto(true);
  };

  // Fechar modal
  const handleFecharModal = () => {
    setModalAberto(false);
    setNotaEditando(null);
    setCorSelecionada("yellow");
  };

  // Obter config de cor
  const getCorConfig = (corId) => {
    return CORES_NOTAS.find((c) => c.id === corId) || CORES_NOTAS[0];
  };

  // Formatar data
  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mapeamento explícito de grids (Tailwind não gera classes dinâmicas em build time)
  const GRID_MAP = {
    pequeno:
      "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5",
    medio:
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4",
    grande:
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3",
  };
  const gridColsClass = GRID_MAP[tamanhoNota] || GRID_MAP.medio;

  // Estado para pastas expandidas
  const [pastasExpandidas, setPastasExpandidas] = useState(
    new Set(["todas", "sem-pasta"]),
  );

  // Toggle pasta expandida
  const togglePastaExpandida = (pastaId) => {
    setPastasExpandidas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pastaId)) {
        newSet.delete(pastaId);
      } else {
        newSet.add(pastaId);
      }
      return newSet;
    });
  };

  // Obter notas de uma pasta
  const getNotasDaPasta = (pastaId) => {
    if (pastaId === "todas") return notas.slice(0, 5);
    if (pastaId === "sem-pasta")
      return notas.filter((n) => !n.pastaId).slice(0, 5);
    return notas.filter((n) => n.pastaId === pastaId).slice(0, 5);
  };

  return (
    <div className="h-full flex bg-stone-100">
      {/* Sidebar de Pastas */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen size={20} className="text-gray-700" />
              <h2 className="font-bold text-gray-900 text-base">Pastas</h2>
            </div>
            <button
              onClick={() => setModalPastaAberto(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Nova pasta"
            >
              <FolderPlus
                size={18}
                className="text-gray-600 group-hover:text-blue-600 transition-colors"
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Pasta Todas */}
          <div className="mb-1">
            <button
              onClick={() => setPastaSelecionada("todas")}
              onDoubleClick={() => togglePastaExpandida("todas")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                pastaSelecionada === "todas"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <FolderOpen
                size={18}
                className={
                  pastaSelecionada === "todas"
                    ? "text-blue-600"
                    : "text-gray-500"
                }
              />
              <span className="text-sm font-semibold flex-1 text-left">
                Todas as Notas
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  pastaSelecionada === "todas"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {notas.length}
              </span>
            </button>
            {pastasExpandidas.has("todas") && notas.length > 0 && (
              <div className="ml-6 mt-2 space-y-1.5 pb-2 border-b border-gray-100">
                {notas.slice(0, 5).map((nota) => {
                  const cor = getCorConfig(nota.cor);
                  return (
                    <button
                      key={nota.id}
                      onClick={() => {
                        setPastaSelecionada("todas");
                        handleAbrirEdicao(nota);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: cor.bg }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {nota.titulo}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {nota.conteudo?.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {notas.length > 5 && (
                  <button
                    onClick={() => setPastaSelecionada("todas")}
                    className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 text-left"
                  >
                    + Ver mais {notas.length - 5} notas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pasta Sem Pasta */}
          <div className="mb-1">
            <button
              onClick={() => setPastaSelecionada("sem-pasta")}
              onDoubleClick={() => togglePastaExpandida("sem-pasta")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                pastaSelecionada === "sem-pasta"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPasta("sem-pasta");
              }}
              onDragLeave={() => setDragOverPasta(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPasta(null);
              }}
            >
              <Folder
                size={18}
                className={
                  pastaSelecionada === "sem-pasta"
                    ? "text-blue-600"
                    : "text-gray-500"
                }
              />
              <span className="text-sm font-semibold flex-1 text-left">
                Sem Pasta
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  pastaSelecionada === "sem-pasta"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {notas.filter((n) => !n.pastaId).length}
              </span>
            </button>
            {pastasExpandidas.has("sem-pasta") &&
              notas.filter((n) => !n.pastaId).length > 0 && (
                <div className="ml-6 mt-2 space-y-1.5 pb-2 border-b border-gray-100">
                  {notas
                    .filter((n) => !n.pastaId)
                    .slice(0, 5)
                    .map((nota) => {
                      const cor = getCorConfig(nota.cor);
                      return (
                        <button
                          key={nota.id}
                          onClick={() => handleAbrirEdicao(nota)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: cor.bg }}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-800 truncate">
                                {nota.titulo}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {nota.conteudo?.substring(0, 30)}...
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
          </div>

          <div className="my-3 border-b border-gray-200"></div>

          {/* Pastas do usuário */}
          {pastas.map((pasta) => {
            const notasDaPasta = notas.filter((n) => n.pastaId === pasta.id);
            const isExpandida = pastasExpandidas.has(pasta.id);

            return (
              <div key={pasta.id} className="mb-1">
                <button
                  onClick={() => setPastaSelecionada(pasta.id)}
                  onDoubleClick={() => togglePastaExpandida(pasta.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    pastaSelecionada === pasta.id
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverPasta(pasta.id);
                  }}
                  onDragLeave={() => setDragOverPasta(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverPasta(null);
                    const notaId = e.dataTransfer.getData("text/plain");
                    if (notaId) {
                      handleDropNaPasta(pasta.id, notaId);
                    }
                  }}
                >
                  <div className="relative">
                    <Folder
                      size={18}
                      className={
                        pastaSelecionada === pasta.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />
                    {notasDaPasta.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className="text-sm font-semibold flex-1 text-left truncate">
                    {pasta.nome}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      pastaSelecionada === pasta.id
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {notasDaPasta.length}
                  </span>
                </button>
                {isExpandida && notasDaPasta.length > 0 && (
                  <div className="ml-6 mt-2 space-y-1.5 pb-2 border-b border-gray-100">
                    {notasDaPasta.slice(0, 5).map((nota) => {
                      const cor = getCorConfig(nota.cor);
                      return (
                        <button
                          key={nota.id}
                          onClick={() => handleAbrirEdicao(nota)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: cor.bg }}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-800 truncate">
                                {nota.titulo}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {nota.conteudo?.substring(0, 30)}...
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {notasDaPasta.length > 5 && (
                      <button
                        onClick={() => setPastaSelecionada(pasta.id)}
                        className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 text-left"
                      >
                        + Ver mais {notasDaPasta.length - 5} notas
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 rounded-xl shadow-md">
                <StickyNote size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mural de Notas
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {notasFiltradas.length} nota(s) • {pastas.length} pasta(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Controle de tamanho */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5">
                <button
                  onClick={() => setTamanhoNota("pequeno")}
                  className={`p-2 rounded-lg transition-all ${
                    tamanhoNota === "pequeno"
                      ? "bg-white shadow-sm text-gray-900"
                      : "hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Nota pequena"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="10"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="1"
                      y="10"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="5"
                      height="5"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTamanhoNota("medio")}
                  className={`p-2 rounded-lg transition-all ${
                    tamanhoNota === "medio"
                      ? "bg-white shadow-sm text-gray-900"
                      : "hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Nota média"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="9"
                      y="1"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="1"
                      y="9"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="9"
                      y="9"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTamanhoNota("grande")}
                  className={`p-2 rounded-lg transition-all ${
                    tamanhoNota === "grande"
                      ? "bg-white shadow-sm text-gray-900"
                      : "hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Nota grande"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="14"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="1"
                      y1="5"
                      x2="15"
                      y2="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="1"
                      y1="11"
                      x2="15"
                      y2="11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNotaEditando(null);
                  setCorSelecionada("yellow");
                  setModalAberto(true);
                }}
                className="shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={16} className="mr-2" />
                Nova Nota
              </Button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Buscar notas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Selection Bar */}
        {selecionadas.size > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-3 flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium text-blue-900">
              {selecionadas.size} nota(s) selecionada(s)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelecionarTodas}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
              >
                {selecionadas.size === notasFiltradas.length
                  ? "Desmarcar todas"
                  : "Selecionar todas"}
              </button>
              <button
                onClick={handleExcluirMultiplas}
                className="text-sm text-red-700 hover:text-red-900 font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          </div>
        )}

        {/* Grid de Notas */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-stone-100">
          <div className="w-full">
            {carregando ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Carregando notas...
                  </p>
                </div>
              </div>
            ) : notasFiltradas.length === 0 ? (
              <div
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center flex items-center justify-center"
                style={{ minHeight: "400px" }}
              >
                <div>
                  <div className="p-6 bg-gray-50 rounded-full inline-block mb-4">
                    <StickyNote size={64} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {busca ? "Nenhuma nota encontrada" : "Nenhuma nota criada"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {busca
                      ? "Tente buscar com outros termos"
                      : 'Clique em "Nova Nota" para começar a organizar suas ideias'}
                  </p>
                  {!busca && (
                    <Button
                      variant="primary"
                      onClick={() => setModalAberto(true)}
                      className="shadow-lg"
                    >
                      <Plus size={16} className="mr-2" />
                      Criar Primeira Nota
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className={`grid ${gridColsClass} gap-5`}>
                {notasFiltradas.map((nota, index) => {
                  const cor = getCorConfig(nota.cor);
                  const isSelecionada = selecionadas.has(nota.id);
                  const isEditando = editandoInline === nota.id;
                  const tamanhoConfig = TAMANHOS_NOTA[tamanhoNota];

                  return (
                    <NotaCard
                      key={nota.id}
                      nota={nota}
                      cor={cor}
                      isSelecionada={isSelecionada}
                      isEditando={isEditando}
                      tamanhoConfig={tamanhoConfig}
                      onToggleSelecao={() => toggleSelecaoNota(nota.id)}
                      onEditar={() => handleAbrirEdicao(nota)}
                      onExcluir={() => handleExcluirNota(nota.id)}
                      onMudarCor={(novaCor) => handleMudarCor(nota.id, novaCor)}
                      onToggleLembrete={() => handleToggleLembrete(nota)}
                      onToggleFixar={() => handleToggleFixar(nota)}
                      onInlineEdit={(dados) => handleInlineEdit(nota.id, dados)}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <NotaFormModal
          nota={notaEditando}
          corSelecionada={corSelecionada}
          onCorChange={setCorSelecionada}
          onSave={notaEditando ? handleEditarNota : handleCriarNota}
          onClose={handleFecharModal}
          salvando={salvando}
        />
      )}

      {/* Modal Nova Pasta */}
      {modalPastaAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nova Pasta</h3>
            <input
              type="text"
              value={nomeNovaPasta}
              onChange={(e) => setNomeNovaPasta(e.target.value)}
              placeholder="Nome da pasta"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition-all"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleCriarPasta()}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setModalPastaAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCriarPasta}
              >
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente: Nota Card
function NotaCard({
  nota,
  cor,
  isSelecionada,
  isEditando,
  tamanhoConfig,
  onToggleSelecao,
  onEditar,
  onExcluir,
  onMudarCor,
  onToggleLembrete,
  onToggleFixar,
  onInlineEdit,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) {
  const [editando, setEditando] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(nota.titulo);
  const [conteudoEdit, setConteudoEdit] = useState(nota.conteudo || "");
  const [mostrarCores, setMostrarCores] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editando]);

  const handleDoubleClick = () => {
    setEditando(true);
    setTituloEdit(nota.titulo);
    setConteudoEdit(nota.conteudo || "");
  };

  const handleSave = () => {
    if (tituloEdit.trim()) {
      onInlineEdit({
        titulo: tituloEdit.trim(),
        conteudo: conteudoEdit.trim(),
      });
      setEditando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      setEditando(false);
      setTituloEdit(nota.titulo);
      setConteudoEdit(nota.conteudo || "");
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e)}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      className={`group relative ${tamanhoConfig.height} border-2 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer`}
      style={{
        backgroundColor: cor.bg,
        borderColor: cor.border,
      }}
    >
      {/* Checkbox de seleção */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          type="checkbox"
          checked={isSelecionada}
          onChange={onToggleSelecao}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Ações do header */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {/* Grip para drag */}
        <div className="p-1 cursor-move">
          <GripVertical size={14} className={cor.textMuted} />
        </div>

        {/* Toggle fixar */}
        <button
          onClick={onToggleFixar}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          title={nota.fixada ? "Desafixar nota" : "Fixar nota"}
        >
          {nota.fixada ? (
            <Pin size={14} className="text-red-600" />
          ) : (
            <PinOff size={14} className={cor.textMuted} />
          )}
        </button>

        {/* Toggle lembrete */}
        <button
          onClick={onToggleLembrete}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          title={nota.lembrete ? "Desativar lembrete" : "Ativar lembrete"}
        >
          {nota.lembrete ? (
            <Bell size={14} className="text-blue-600" />
          ) : (
            <BellOff size={14} className={cor.textMuted} />
          )}
        </button>

        {/* Color picker rápido */}
        <div className="relative">
          <button
            onClick={() => setMostrarCores(!mostrarCores)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            title="Mudar cor"
          >
            <Palette size={14} className={cor.textMuted} />
          </button>

          {mostrarCores && (
            <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-20">
              <div className="flex gap-1">
                {CORES_NOTAS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onMudarCor(c.id);
                      setMostrarCores(false);
                    }}
                    className="w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editar */}
        <button
          onClick={onEditar}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          title="Editar nota"
        >
          <Edit3 size={14} className={cor.textMuted} />
        </button>

        {/* Excluir */}
        <button
          onClick={onExcluir}
          className="p-1.5 bg-white/20 hover:bg-red-200/50 rounded-md transition-colors"
          title="Excluir nota"
        >
          <Trash2 size={14} className="text-red-600" />
        </button>
      </div>

      {/* Conteúdo */}
      <div
        className="p-4 pt-8 h-full flex flex-col"
        onDoubleClick={handleDoubleClick}
      >
        {editando ? (
          <div className="flex-1 flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={tituloEdit}
              onChange={(e) => setTituloEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={`w-full font-semibold bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none text-sm ${cor.text}`}
              placeholder="Título"
            />
            <textarea
              value={conteudoEdit}
              onChange={(e) => setConteudoEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={`w-full flex-1 bg-transparent resize-none text-sm ${cor.textLight} focus:outline-none ${tamanhoConfig.contentLines}`}
              placeholder="Conteúdo da nota..."
            />
            <p className={`text-xs ${cor.textMuted}`}>
              Ctrl+Enter para salvar • ESC para cancelar
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <h3
                className={`font-semibold mb-2 pr-24 line-clamp-2 text-sm ${cor.text}`}
              >
                {nota.titulo}
              </h3>
              <p
                className={`text-sm whitespace-pre-wrap ${tamanhoConfig.contentLines} ${cor.textLight}`}
              >
                {nota.conteudo}
              </p>
            </div>

            {/* Footer */}
            <div
              className={`mt-2 pt-2 border-t border-black/10 flex items-center justify-between`}
            >
              <p className={`text-xs ${cor.textMuted}`}>
                {new Date(nota.updatedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
              <div className="flex gap-1">
                {nota.fixada && <Pin size={12} className="text-red-600" />}
                {nota.lembrete && <Bell size={12} className="text-blue-600" />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente: Modal de Formulário de Nota (formato compacto e responsivo)
function NotaFormModal({
  nota,
  corSelecionada,
  onCorChange,
  onSave,
  onClose,
  salvando,
}) {
  const [titulo, setTitulo] = useState(nota?.titulo || "");
  const [conteudo, setConteudo] = useState(nota?.conteudo || "");
  const [erro, setErro] = useState("");

  // Usar cor da nota sendo editada ou cor selecionada
  const corNota = nota?.cor || corSelecionada;
  const cor = CORES_NOTAS.find((c) => c.id === corNota) || CORES_NOTAS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro("O título é obrigatório");
      return;
    }
    await onSave({ titulo: titulo.trim(), conteudo: conteudo.trim() });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "calc(100vh - 2rem)",
          backgroundColor: cor.bg,
          border: `2px solid ${cor.border}`,
        }}
      >
        {/* Efeito de nota adhesiva */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-black/10 rounded-full blur-sm"></div>

        {/* Header com cor e título */}
        <div
          className="p-3 sm:p-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${cor.border}` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Indicador de cor */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: cor.accent }}
            ></div>
            <h3
              className="text-base sm:text-lg font-bold truncate"
              style={{ color: cor.text }}
            >
              {nota ? "✏️ Editando" : "📝 Nova Nota"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
            disabled={salvando}
          >
            <X size={18} style={{ color: cor.text }} />
          </button>
        </div>

        {/* Form compacto */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ height: `calc(100vh - 8rem)` }}
        >
          {/* Seletor de Cores - Compacto */}
          <div
            className="px-3 sm:px-4 py-2 flex items-center gap-2"
            style={{
              borderBottom: `1px solid ${cor.border}`,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Palette size={14} className="text-gray-700 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-700">Cor:</span>
            <div className="flex gap-1.5 ml-auto">
              {CORES_NOTAS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCorChange(c.id)}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border-2 transition-all flex-shrink-0 hover:scale-110"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    ...(corNota === c.id
                      ? {
                          boxShadow: "0 0 0 2px #3b82f6, 0 0 0 4px white",
                          transform: "scale(1.10)",
                        }
                      : {}),
                  }}
                  title={c.label}
                  disabled={salvando}
                />
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="px-3 sm:px-4 py-3">
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setErro("");
              }}
              placeholder="Título da nota..."
              className="w-full px-3 py-2.5 border border-gray-300 focus:border-blue-400 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all disabled:opacity-50 font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
              disabled={salvando}
              autoFocus
            />
            {erro && (
              <p className="text-xs text-red-700 mt-1.5 flex items-center gap-1">
                ⚠️ {erro}
              </p>
            )}
          </div>

          {/* Conteúdo - Área scrollável */}
          <div className="flex-1 px-3 sm:px-4 pb-3 min-h-0">
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva o conteúdo aqui..."
              className="w-full h-full px-3 py-2.5 border border-gray-300 focus:border-blue-400 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all disabled:opacity-50 resize-none leading-relaxed overflow-y-auto"
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                minHeight: "120px",
              }}
              disabled={salvando}
            />
          </div>

          {/* Ações */}
          <div
            className="px-3 sm:px-4 py-3 flex gap-2"
            style={{
              borderTop: `1px solid ${cor.border}`,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-sm py-2"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 text-sm py-2"
              loading={salvando}
            >
              {nota ? "💾 Salvar" : "✨ Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
