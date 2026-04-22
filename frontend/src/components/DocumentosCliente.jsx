import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Loader2,
  Plus,
  X,
  File,
  FolderOpen,
  Folder,
  ArrowLeft,
  Edit2,
  MoreVertical,
  Search,
  Move,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { documentosAPI } from "../services/api";
import { formatDate } from "../utils/masks";
import { toast } from "sonner";
import { 
  Box, 
  Text as MantineText, 
  Badge, 
  Button, 
  Group, 
  Stack, 
  ThemeIcon,
  SimpleGrid,
  Card,
  Title,
  TextInput,
  ActionIcon,
  Tooltip,
  Paper,
  Divider,
  ScrollArea,
  Menu,
  Modal,
  Transition,
  Breadcrumbs,
  Anchor,
  Loader,
  Progress,
  Container
} from "@mantine/core";

export default function DocumentosCliente({ clienteId, clienteNome: _clienteNome }) {
  const [documentos, setDocumentos] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [todasPastas, setTodasPastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("documento");
  const [descricao, setDescricao] = useState("");
  const [pastaSelecionada, setPastaSelecionada] = useState(null);
  const [historicoNavegacao, setHistoricoNavegacao] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showNovaPasta, setShowNovaPasta] = useState(false);
  const [novaPastaNome, setNovaPastaNome] = useState("");
  const [novaPastaDescricao, setNovaPastaDescricao] = useState("");
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(null);
  const [pastaMenuOpen, setPastaMenuOpen] = useState(null);
  const [editandoPasta, setEditandoPasta] = useState(null);
  const [buscaPastas, setBuscaPastas] = useState("");
  const [showMoverDoc, setShowMoverDoc] = useState(null);

  // Upload com progresso
  const [uploadProgress, setUploadProgress] = useState([]);
  const [cancelTokens, setCancelTokens] = useState({});
  const _abortControllerRef = useRef(null);

  // Drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef(null);

  // Preview de imagens
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);

  // Upload queue com prioridade
  const [uploadQueue, setUploadQueue] = useState([]); // [{file, priority, status, progress}]
  const [isProcessing, setIsProcessing] = useState(false);

  // Pause/Resume
  const [isPaused, setIsPaused] = useState(false);
  const [_pausedUploads, _setPausedUploads] = useState(new Set());

  // Constantes de upload
  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  useEffect(() => {
    fetchTodasPastas();
    fetchPastas();
    fetchDocumentos();
  }, [clienteId, pastaSelecionada]);

  const fetchTodasPastas = async () => {
    try {
      const response = await documentosAPI.pastas.listar(clienteId);
      setTodasPastas(response.data);
    } catch (err) {
      console.error("Erro ao buscar todas pastas:", err);
    }
  };

  const fetchPastas = async () => {
    try {
      const response = await documentosAPI.pastas.listar(clienteId, {
        pastaPaiId: pastaSelecionada || "null",
      });
      setPastas(response.data);
    } catch (err) {
      console.error("Erro ao buscar pastas:", err);
    }
  };

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const response = await documentosAPI.getByCliente(clienteId);
      let docs = response.data;

      // Filtra por pasta se houver uma selecionada
      if (pastaSelecionada) {
        docs = docs.filter((doc) => doc.pasta === pastaSelecionada);
      }

      setDocumentos(docs);
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Breadcrumb: calcula caminho completo até a pasta atual
  const getBreadcrumbPath = () => {
    if (!pastaSelecionada) return [];

    const path = [];
    let currentId = pastaSelecionada;
    let iterations = 0;

    while (currentId && iterations < 10) {
      const pasta = todasPastas.find((p) => p._id === currentId);
      if (!pasta) break;

      path.unshift({ id: pasta._id, nome: pasta.nome });
      currentId = pasta.pasta_pai;
      iterations++;
    }

    return path;
  };

  const handleNavegarPasta = (pastaId) => {
    setHistoricoNavegacao(
      [...historicoNavegacao, pastaSelecionada].filter(Boolean),
    );
    setPastaSelecionada(pastaId);
  };

  const handleVoltarPasta = () => {
    if (historicoNavegacao.length > 0) {
      const anterior = historicoNavegacao[historicoNavegacao.length - 1];
      setHistoricoNavegacao(historicoNavegacao.slice(0, -1));
      setPastaSelecionada(anterior);
    } else {
      setPastaSelecionada(null);
    }
  };

  const handleNavegarBreadcrumb = (pastaId, index) => {
    const novoHistorico = historicoNavegacao.slice(0, index);
    setHistoricoNavegacao(novoHistorico);
    setPastaSelecionada(pastaId);
  };

  const handleCriarPasta = async () => {
    if (!novaPastaNome.trim()) return;

    try {
      setCriandoPasta(true);
      await documentosAPI.pastas.criar({
        clienteId,
        nome: novaPastaNome,
        descricao: novaPastaDescricao,
        pastaPaiId: pastaSelecionada,
      });
      setNovaPastaNome("");
      setNovaPastaDescricao("");
      setShowNovaPasta(false);
      await fetchPastas();
      await fetchTodasPastas();
    } catch (err) {
      toast.error("Erro ao criar pasta.");
      console.error(err);
    } finally {
      setCriandoPasta(false);
    }
  };

  const handleMoverDocumento = async (documentoId, novaPastaId) => {
    try {
      await documentosAPI.update(documentoId, { pasta: novaPastaId || null });
      setShowMoverDoc(null);
      await fetchDocumentos();
      toast.success("Documento movido com sucesso!");
    } catch (_err) {
      toast.error("Erro ao mover documento.");
    }
  };

  const getDocumentosCount = (pastaId) => {
    return documentos.filter((doc) => doc.pasta === pastaId).length;
  };

  const pastasFiltradas = pastas.filter((pasta) =>
    pasta.nome.toLowerCase().includes(buscaPastas.toLowerCase()),
  );

  const handleDeletarPasta = async (pastaId, pastaNome) => {
    if (!confirm(`Tem certeza que deseja excluir a pasta "${pastaNome}"?`))
      return;

    try {
      await documentosAPI.pastas.delete(pastaId);
      await fetchPastas();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao excluir pasta.");
    }
  };

  const _handleEditarPasta = async (pastaId, novoNome) => {
    if (!novoNome.trim()) return;

    try {
      await documentosAPI.pastas.update(pastaId, { nome: novoNome });
      setEditandoPasta(null);
      await fetchPastas();
    } catch (_err) {
      toast.error("Erro ao editar pasta.");
    }
  };

  const _handleVoltarPastas = () => {
    setPastaSelecionada(null);
  };

  // Upload com Queue e Prioridade
  const currentUploadController = useRef(null);

  const _addToQueue = (priority = "normal") => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newItems = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      priority,
      status: "pending",
      progress: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} arquivo(s) adicionado(s) à fila`);
  };

  const processQueue = async () => {
    if (isProcessing || uploadQueue.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);

    // Ordena por prioridade: alto > normal > baixo
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const sortedQueue = [...uploadQueue].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );

    for (let i = 0; i < sortedQueue.length; i++) {
      if (isPaused) break;

      const item = sortedQueue[i];
      if (item.status === "completed" || item.status === "cancelled") continue;

      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)),
      );

      // Cria AbortController para este upload
      currentUploadController.current = new AbortController();

      try {
        const formData = new FormData();
        formData.append("documento", item.file);
        formData.append("clienteId", clienteId);
        formData.append("tipo", tipoDocumento);
        formData.append("descricao", descricao);
        if (pastaSelecionada) {
          formData.append("pastaId", pastaSelecionada);
        }

        await documentosAPI.upload(
          formData,
          (progress) => {
            // Verifica se foi pausado durante o upload
            if (isPaused) {
              currentUploadController.current?.abort();
            }
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress } : q)),
            );
          },
          currentUploadController.current.signal,
        );

        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "completed", progress: 100 } : q,
          ),
        );
        toast.success(`${item.file.name} enviado com sucesso!`);
      } catch (error) {
        if (error.name === "AbortError" || isPaused) {
          // Upload foi pausado
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "paused", progress: q.progress }
                : q,
            ),
          );
          toast.info("Upload pausado");
          break; // Sai do loop
        }
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: error.message }
              : q,
          ),
        );
        toast.error(`Erro ao enviar ${item.file.name}`);
      } finally {
        currentUploadController.current = null;
      }
    }

    setIsProcessing(false);
    await fetchDocumentos();
    await fetchTodasPastas();
    setSelectedFiles([]);
    setImagePreviews([]);
    setPdfPreviews([]);
    setUploadProgress([]);
    setShowUploadForm(false);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      processQueue();
    } else {
      setIsPaused(true);
      // Aborta o upload atual imediatamente
      currentUploadController.current?.abort();
      toast.info("Upload pausado");
    }
  };

  const cancelUpload = (id) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "cancelled" } : q)),
    );
    toast.info("Upload cancelado");
  };

  const retryUpload = (id) => {
    const item = uploadQueue.find((q) => q.id === id);
    if (item) {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: "pending", progress: 0, error: null }
            : q,
        ),
      );
      processQueue();
    }
  };

  const clearCompleted = () => {
    setUploadQueue((prev) =>
      prev.filter((q) => q.status !== "completed" && q.status !== "cancelled"),
    );
    toast.success("Fila limpa");
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    toast.info("Iniciando uploads...");

    // Inicializa progresso para cada arquivo
    const initialProgress = selectedFiles.map((file) => ({
      name: file.name,
      progress: 0,
      status: "uploading",
      error: null,
    }));
    setUploadProgress(initialProgress);

    const newCancelTokens = {};

    // Uploads em paralelo com Promise.all
    const uploadPromises = selectedFiles.map((file, index) => {
      const abortController = new AbortController();
      newCancelTokens[index] = abortController;

      const formData = new FormData();
      formData.append("documento", file);
      formData.append("clienteId", clienteId);
      formData.append("tipo", tipoDocumento);
      formData.append("descricao", descricao);
      if (pastaSelecionada) {
        formData.append("pastaId", pastaSelecionada);
      }

      return new Promise((resolve) => {
        documentosAPI
          .upload(formData, (progress) => {
            setUploadProgress((prev) =>
              prev.map((p, idx) => (idx === index ? { ...p, progress } : p)),
            );
          })
          .then(() => {
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === index ? { ...p, progress: 100, status: "success" } : p,
              ),
            );
            resolve({ index, success: true });
          })
          .catch((error) => {
            if (error.name === "AbortError") {
              setUploadProgress((prev) =>
                prev.map((p, idx) =>
                  idx === index ? { ...p, status: "cancelled" } : p,
                ),
              );
              resolve({ index, success: false, cancelled: true });
            } else {
              setUploadProgress((prev) =>
                prev.map((p, idx) =>
                  idx === index
                    ? { ...p, status: "error", error: error.message }
                    : p,
                ),
              );
              resolve({ index, success: false, error: error.message });
            }
          });
      });
    });

    // Aguarda todos uploads completarem
    await Promise.all(uploadPromises);

    setCancelTokens({});
    setUploading(false);

    // Recarrega documentos após uploads
    await fetchDocumentos();
    await fetchTodasPastas();

    // Limpa formulário
    setSelectedFiles([]);
    setImagePreviews([]);
    setPdfPreviews([]);
    setUploadProgress([]);
    setShowUploadForm(false);

    toast.success("Todos os uploads concluídos!");
  };

  const _handleCancelUpload = (index) => {
    if (cancelTokens[index]) {
      cancelTokens[index].abort();
      setUploadProgress((prev) =>
        prev.map((p, idx) =>
          idx === index ? { ...p, status: "cancelled" } : p,
        ),
      );
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type.startsWith("application/msword") ||
        file.type.includes("wordprocessingml"),
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      generatePreviews(files);
    }
  };

  // Validação de arquivos
  const validateFiles = (files) => {
    const errors = [];
    const validFiles = [];

    // Verifica limite total de arquivos
    if (selectedFiles.length + files.length > MAX_FILES) {
      errors.push(
        `Máximo de ${MAX_FILES} arquivos permitidos. Você já tem ${selectedFiles.length} arquivo(s).`,
      );
      return { validFiles, errors };
    }

    files.forEach((file) => {
      // Verifica tamanho
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name}: Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Máximo: 10MB`,
        );
        return;
      }

      // Verifica tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(
          `${file.name}: Tipo de arquivo não permitido (${file.type})`,
        );
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const { validFiles, errors } = validateFiles(files);

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      generatePreviews(validFiles);
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }

    // Reset input file
    e.target.value = "";
  };

  const generatePreviews = async (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    // Generate image previews
    const imagePreviews = imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: "image",
    }));

    setImagePreviews((prev) => [...prev, ...imagePreviews]);

    // Generate PDF thumbnails with lazy load
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 0.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);

        setPdfPreviews((prev) => [
          ...prev,
          {
            name: file.name,
            url: thumbnailUrl,
            type: "pdf",
            isThumbnail: true,
          },
        ]);
      } catch (error) {
        // Fallback para ícone se falhar
        setPdfPreviews((prev) => [
          ...prev,
          {
            name: file.name,
            url: null,
            type: "pdf",
            isThumbnail: false,
          },
        ]);
        console.error("Erro ao gerar thumbnail PDF:", file.name, error);
      }
    }
  };

  const removePreview = (index, isImage = true) => {
    if (isImage) {
      URL.revokeObjectURL(imagePreviews[index].url);
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Cleanup de thumbnail PDF (canvas URL)
      if (pdfPreviews[index].url && pdfPreviews[index].isThumbnail) {
        URL.revokeObjectURL(pdfPreviews[index].url);
      }
      setPdfPreviews((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Cleanup de URLs e canvas ao desmontar componente
  useEffect(() => {
    return () => {
      // Cleanup image URLs
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
      // Cleanup PDF thumbnail URLs (canvas)
      pdfPreviews.forEach((preview) => {
        if (preview.url && preview.isThumbnail) {
          URL.revokeObjectURL(preview.url);
        }
      });
      // Limpa localStorage da fila
      localStorage.removeItem("uploadQueue");
    };
  }, []);

  // Persistir fila no localStorage
  useEffect(() => {
    if (uploadQueue.length > 0) {
      // Salva apenas metadados (não o arquivo)
      const queueData = uploadQueue.map((item) => ({
        id: item.id,
        fileName: item.file.name,
        fileSize: item.file.size,
        priority: item.priority,
        status: item.status,
        progress: item.progress,
      }));
      localStorage.setItem("uploadQueue", JSON.stringify(queueData));
    }
  }, [uploadQueue]);

  // Carregar fila do localStorage ao montar
  useEffect(() => {
    const savedQueue = localStorage.getItem("uploadQueue");
    if (savedQueue) {
      try {
        JSON.parse(savedQueue);
        // Nota: não podemos restaurar os arquivos, apenas o estado da fila
        // Usuário precisa re-selecionar os arquivos
        toast.info(
          "Fila de uploads restaurada. Selecione os arquivos novamente.",
        );
      } catch (_e) {
        localStorage.removeItem("uploadQueue");
      }
    }
  }, []);

  const handleCancelAllUploads = () => {
    Object.values(cancelTokens).forEach((controller) => {
      if (controller) controller.abort();
    });
    setUploadProgress((prev) =>
      prev.map((p) =>
        p.status === "uploading" || p.status === "pending"
          ? { ...p, status: "cancelled" }
          : p,
      ),
    );
  };

  const handleRetryUpload = async (index) => {
    const file = selectedFiles[index];
    if (!file) return;

    setUploadProgress((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? { ...p, status: "uploading", progress: 0, error: null }
          : p,
      ),
    );

    try {
      const abortController = new AbortController();
      const newCancelTokens = { ...cancelTokens, [index]: abortController };
      setCancelTokens(newCancelTokens);

      const formData = new FormData();
      formData.append("documento", file);
      formData.append("clienteId", clienteId);
      formData.append("tipo", tipoDocumento);
      formData.append("descricao", descricao);
      if (pastaSelecionada) {
        formData.append("pastaId", pastaSelecionada);
      }

      await documentosAPI.upload(formData, (progress) => {
        setUploadProgress((prev) =>
          prev.map((p, i) => (i === index ? { ...p, progress } : p)),
        );
      });

      setUploadProgress((prev) =>
        prev.map((p, idx) =>
          idx === index ? { ...p, progress: 100, status: "success" } : p,
        ),
      );

      await fetchDocumentos();
    } catch (error) {
      setUploadProgress((prev) =>
        prev.map((p, idx) =>
          idx === index ? { ...p, status: "error", error: error.message } : p,
        ),
      );
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentosAPI.download(doc._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.nome_original);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erro ao baixar:", err);
      toast.error("Erro ao baixar documento.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;

    try {
      await documentosAPI.delete(id);
      await fetchDocumentos();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Erro ao excluir documento.");
    }
  };

  const handleOcr = async (id) => {
    try {
      setOcrLoading(id);
      await documentosAPI.ocr(id);
      toast.success("OCR realizado com sucesso! Texto extraído salvo.");
      await fetchDocumentos();
    } catch (err) {
      console.error("Erro ao executar OCR:", err);
      toast.error("Erro ao executar OCR. Apenas imagens e PDFs são suportados.");
    } finally {
      setOcrLoading(null);
    }
  };

  const formatTamanho = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "nota_fiscal":
        return "📄";
      case "contrato":
        return "📋";
      case "certidao":
        return "📜";
      default:
        return "📁";
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" py={50}>
        <Loader size="xl" color="blue" variant="bars" />
        <MantineText c="dimmed" fw={500}>Carregando documentos...</MantineText>
      </Stack>
    );
  }

  const breadcrumbs = [
    <Anchor key="root" size="sm" fw={700} onClick={() => { setHistoricoNavegacao([]); setPastaSelecionada(null); }}>
      <Group gap={4}><FolderOpen size={16} /> Todos Documentos</Group>
    </Anchor>,
    ...getBreadcrumbPath().map((p, i) => (
      <Anchor key={p.id} size="sm" fw={500} onClick={() => handleNavegarBreadcrumb(p.id, i)}>
        {p.nome}
      </Anchor>
    ))
  ];

  return (
    <Box>
      {/* Header com Navegação de Pastas e Upload */}
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Breadcrumbs separator="/" separatorMargin="md">
              {breadcrumbs}
            </Breadcrumbs>
            <MantineText size="xs" c="dimmed" fw={500}>
              Exibindo {documentos.length} documento(s) {pastaSelecionada ? 'nesta pasta' : ''}
            </MantineText>
          </Stack>

          <Group gap="sm">
            <Button 
              variant="light" 
              color="slate" 
              leftSection={<Folder size={16} />}
              onClick={() => setShowNovaPasta(true)}
              radius="md"
            >
              Nova Pasta
            </Button>
            <Button 
              variant="filled" 
              color="blue" 
              leftSection={showUploadForm ? <X size={16} /> : <Plus size={16} />}
              onClick={() => setShowUploadForm(!showUploadForm)}
              radius="md"
            >
              {showUploadForm ? "Cancelar" : "Novo Documento"}
            </Button>
          </Group>
        </Group>

        {!pastaSelecionada && (
          <TextInput
            placeholder="Buscar pastas..."
            leftSection={<Search size={18} />}
            value={buscaPastas}
            onChange={(e) => setBuscaPastas(e.target.value)}
            className="max-w-md"
            radius="md"
          />
        )}
      </Stack>

      {/* Lista de Pastas (se não houver pasta selecionada) */}
      {!pastaSelecionada && pastas.length > 0 && (
        <Box mb="xl">
          <MantineText size="xs" fw={900} c="dimmed" mb="md" className="uppercase tracking-widest">Pastas</MantineText>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
            {pastasFiltradas.map((pasta) => (
              <Card 
                key={pasta._id} 
                padding="md" 
                radius="lg" 
                withBorder 
                className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group bg-white dark:bg-slate-800"
                onClick={() => handleNavegarPasta(pasta._id)}
              >
                <Stack align="center" gap="xs">
                  <div className="relative">
                    <ThemeIcon size={56} variant="light" color="blue" radius="xl">
                      <Folder size={32} />
                    </ThemeIcon>
                    <Badge 
                      size="xs" 
                      variant="filled" 
                      color="blue" 
                      className="absolute -top-1 -right-1"
                    >
                      {getDocumentosCount(pasta._id)}
                    </Badge>
                  </div>

                  <MantineText size="sm" fw={800} className="truncate w-full text-center">
                    {pasta.nome}
                  </MantineText>
                  
                  {pasta.descricao && (
                    <MantineText size="xs" c="dimmed" className="truncate w-full text-center" lineClamp={1}>
                      {pasta.descricao}
                    </MantineText>
                  )}
                </Stack>

                {/* Menu de Ações da Pasta */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Menu shadow="md" width={150} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                      <Menu.Item 
                        leftSection={<Edit2 size={14} />} 
                        onClick={() => setEditandoPasta(pasta._id)}
                      >
                        Editar
                      </Menu.Item>
                      <Menu.Item 
                        color="red" 
                        leftSection={<Trash2 size={14} />}
                        onClick={() => handleDeletarPasta(pasta._id, pasta.nome)}
                      >
                        Excluir
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {showUploadForm && (
        <Card withBorder padding="xl" radius="lg" mb="xl" className="bg-slate-50/50 dark:bg-slate-800/50">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4} className="text-slate-800 dark:text-slate-200">Enviar Novo Documento</Title>
              <Badge variant="light" size="lg" color="blue">
                {selectedFiles.length} / {MAX_FILES} arquivos selecionados
              </Badge>
            </Group>

            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                  : selectedFiles.length >= MAX_FILES
                    ? "border-red-300 bg-red-50 dark:bg-red-900/10 cursor-not-allowed"
                    : "border-slate-300 hover:border-blue-400 dark:border-slate-600 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={selectedFiles.length >= MAX_FILES}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <Upload size={48} className={`mx-auto mb-3 ${selectedFiles.length >= MAX_FILES ? "text-red-400" : "text-blue-400"}`} />
              <MantineText fw={700} size="lg" c={selectedFiles.length >= MAX_FILES ? "red.6" : "slate.7"}>
                {selectedFiles.length >= MAX_FILES ? "Limite máximo de arquivos atingido" : "Arraste e solte arquivos aqui"}
              </MantineText>
              <MantineText size="sm" c="dimmed" mt={4}>ou clique para selecionar (PDF, PNG, JPG, DOC - Máx 10MB)</MantineText>
            </div>

            {/* Previews */}
            <Group gap="xs">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Paper radius="md" withBorder className="overflow-hidden w-20 h-20">
                    <img src={preview.url} alt="" className="w-full h-full object-cover" />
                  </Paper>
                  <ActionIcon 
                    variant="filled" 
                    color="red" 
                    size="xs" 
                    radius="xl" 
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePreview(index, true)}
                  >
                    <X size={10} />
                  </ActionIcon>
                </div>
              ))}
              {pdfPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Paper radius="md" withBorder className="overflow-hidden w-20 h-20 bg-red-50 flex items-center justify-center">
                    {preview.isThumbnail ? <img src={preview.url} alt="" className="w-full h-full object-cover" /> : <File size={32} className="text-red-500" />}
                  </Paper>
                  <ActionIcon 
                    variant="filled" 
                    color="red" 
                    size="xs" 
                    radius="xl" 
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePreview(index, false)}
                  >
                    <X size={10} />
                  </ActionIcon>
                </div>
              ))}
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label="Tipo de Documento"
                value={tipoDocumento}
                onChange={setTipoDocumento}
                data={[
                  { value: 'documento', label: 'Documento' },
                  { value: 'nota_fiscal', label: 'Nota Fiscal' },
                  { value: 'contrato', label: 'Contrato' },
                  { value: 'certidao', label: 'Certidão' },
                  { value: 'outro', label: 'Outro' }
                ]}
                radius="md"
              />
              <TextInput
                label="Descrição"
                placeholder="Ex: NF Janeiro 2024"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                radius="md"
              />
            </SimpleGrid>

            <Group justify="flex-end" pt="md">
              <Button variant="subtle" color="gray" onClick={() => setShowUploadForm(false)} radius="md">Cancelar</Button>
              <Button 
                variant="filled" 
                color="blue" 
                onClick={handleUpload} 
                loading={uploading} 
                disabled={selectedFiles.length === 0}
                radius="md"
                leftSection={<Upload size={16} />}
              >
                Enviar {selectedFiles.length} arquivo(s)
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {/* Progress */}
      {uploadProgress.length > 0 && (
        <Card withBorder radius="lg" mb="xl" padding="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <MantineText fw={700} size="sm">Progresso dos Uploads</MantineText>
              {uploading && <Button variant="subtle" size="compact-xs" color="red" onClick={handleCancelAllUploads}>Cancelar Todos</Button>}
            </Group>
            {uploadProgress.map((item, idx) => (
              <Box key={idx}>
                <Group justify="space-between" mb={4}>
                  <MantineText size="xs" fw={500} className="truncate max-w-[200px]">{item.name}</MantineText>
                  <MantineText size="xs" fw={700} c={item.status === 'success' ? 'teal' : item.status === 'error' ? 'red' : 'blue'}>
                    {item.status === 'success' ? 'Concluído' : item.status === 'error' ? 'Erro' : `${item.progress}%`}
                  </MantineText>
                </Group>
                <Progress value={item.progress} color={item.status === 'success' ? 'teal' : item.status === 'error' ? 'red' : 'blue'} size="sm" radius="xl" striped={item.status === 'uploading'} animated={item.status === 'uploading'} />
              </Box>
            ))}
          </Stack>
        </Card>
      )}

      {/* Modal de Nova Pasta */}
      <Modal 
        opened={showNovaPasta} 
        onClose={() => setShowNovaPasta(false)} 
        title={<Group gap={4}><Folder size={20} className="text-blue-600" /> Nova Pasta</Group>}
        radius="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Nome da Pasta"
            placeholder="Ex: Notas Fiscais 2024"
            value={novaPastaNome}
            onChange={(e) => setNovaPastaNome(e.target.value)}
            radius="md"
            autoFocus
          />
          <TextInput
            label="Descrição"
            placeholder="Ex: NFs de entrada"
            value={novaPastaDescricao}
            onChange={(e) => setNovaPastaDescricao(e.target.value)}
            radius="md"
          />
          <Group justify="flex-end" pt="md">
            <Button variant="subtle" color="gray" onClick={() => setShowNovaPasta(false)}>Cancelar</Button>
            <Button 
              color="blue" 
              onClick={handleCriarPasta} 
              loading={criandoPasta} 
              disabled={!novaPastaNome.trim()}
              radius="md"
            >
              Criar Pasta
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Editar Pasta */}
      {editandoPasta && (
        <EditarPastaModal
          pastaId={editandoPasta}
          onClose={() => setEditandoPasta(null)}
          onSaved={() => {
            setEditandoPasta(null);
            fetchPastas();
          }}
        />
      )}

      {/* Lista de Documentos */}
      <Box mt="xl">
        <MantineText size="xs" fw={900} c="dimmed" mb="md" className="uppercase tracking-widest">Documentos</MantineText>
        {documentos.length === 0 ? (
          <Paper withBorder radius="lg" p={50} className="bg-slate-50/50 dark:bg-slate-800/50 border-dashed">
            <Stack align="center" gap="xs">
              <FileText size={48} className="text-slate-300" />
              <MantineText fw={700} c="slate.6">Nenhum documento enviado</MantineText>
              <MantineText size="sm" c="dimmed">Clique em "Novo Documento" para começar</MantineText>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="sm">
            {documentos.map((doc) => (
              <Card 
                key={doc._id} 
                withBorder 
                radius="lg" 
                padding="md" 
                className="hover:shadow-md transition-all bg-white dark:bg-slate-800"
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group align="flex-start" wrap="nowrap" flex={1}>
                    {doc.thumbnail_path ? (
                      <Paper radius="md" withBorder className="overflow-hidden w-16 h-16 flex-shrink-0">
                        <img src={`http://localhost:3000${doc.thumbnail_path}`} alt="" className="w-full h-full object-cover" />
                      </Paper>
                    ) : (
                      <ThemeIcon size={64} variant="light" color="slate" radius="md" className="flex-shrink-0">
                        <MantineText size="xl">{getTipoIcon(doc.tipo)}</MantineText>
                      </ThemeIcon>
                    )}
                    
                    <Box style={{ minWidth: 0 }} flex={1}>
                      <Group gap="xs" mb={4}>
                        <MantineText fw={800} size="md" className="truncate">{doc.nome_original}</MantineText>
                        {doc.ocr_realizado && <Badge size="xs" color="teal" variant="light">OCR</Badge>}
                      </Group>
                      
                      {doc.descricao && <MantineText size="sm" c="dimmed" mb={4} lineClamp={1}>{doc.descricao}</MantineText>}
                      
                      <Group gap="md">
                        <MantineText size="xs" c="dimmed" fw={600}>{formatTamanho(doc.tamanho)}</MantineText>
                        <MantineText size="xs" c="dimmed">•</MantineText>
                        <MantineText size="xs" c="dimmed" fw={600}>{formatDate(doc.createdAt)}</MantineText>
                        <MantineText size="xs" c="dimmed">•</MantineText>
                        <Badge size="xs" variant="outline" color="gray" className="capitalize">{doc.tipo.replace("_", " ")}</Badge>
                      </Group>
                    </Box>
                  </Group>

                  <Group gap={8}>
                    <Tooltip label={doc.mimetype === "application/pdf" ? "Visualizar PDF" : "Baixar"}>
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        radius="md" 
                        size="lg"
                        onClick={() => doc.mimetype === "application/pdf" ? setShowPdfViewer(doc) : handleDownload(doc)}
                      >
                        {doc.mimetype === "application/pdf" ? <Eye size={18} /> : <Download size={18} />}
                      </ActionIcon>
                    </Tooltip>
                    
                    <Menu shadow="md" width={200} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="light" color="gray" radius="md" size="lg">
                          <MoreVertical size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Download size={16} />} onClick={() => handleDownload(doc)}>Download</Menu.Item>
                        <Menu.Item leftSection={<Move size={16} />} onClick={() => setShowMoverDoc(doc._id)}>Mover para...</Menu.Item>
                        <Menu.Item 
                          leftSection={ocrLoading === doc._id ? <Loader size="xs" /> : <Search size={16} />} 
                          onClick={() => handleOcr(doc._id)}
                          disabled={ocrLoading === doc._id}
                        >
                          Executar OCR
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item color="red" leftSection={<Trash2 size={16} />} onClick={() => handleDelete(doc._id)}>Excluir</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>

                {/* Inline Mover Folder Picker */}
                {showMoverDoc === doc._id && (
                  <Box mt="md" p="sm" className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200">
                    <Group justify="space-between" mb="xs">
                      <MantineText size="xs" fw={700} c="dimmed">MOVER PARA:</MantineText>
                      <ActionIcon size="xs" variant="subtle" onClick={() => setShowMoverDoc(null)}><X size={12} /></ActionIcon>
                    </Group>
                    <ScrollArea.Autosize mah={150}>
                      <Stack gap={4}>
                        <Button 
                          variant="subtle" 
                          color="gray" 
                          size="xs" 
                          fullWidth 
                          justify="flex-start" 
                          leftSection={<Folder size={12} />}
                          onClick={() => handleMoverDocumento(doc._id, null)}
                        >
                          Sem pasta
                        </Button>
                        {todasPastas.map((pasta) => (
                          <Button 
                            key={pasta._id}
                            variant="subtle" 
                            color="blue" 
                            size="xs" 
                            fullWidth 
                            justify="flex-start" 
                            leftSection={<Folder size={12} />}
                            onClick={() => handleMoverDocumento(doc._id, pasta._id)}
                          >
                            {pasta.nome}
                          </Button>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  </Box>
                )}
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Modal de Visualização de OCR */}
      <Modal 
        opened={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        title={selectedDoc?.nome_original}
        size="lg"
        radius="lg"
      >
        <Paper withBorder p="md" className="bg-slate-50 dark:bg-slate-900">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
            {selectedDoc?.ocr_texto || "Nenhum texto extraído."}
          </pre>
        </Paper>
      </Modal>

      {/* Modal de Visualização de PDF */}
      <Modal 
        opened={!!showPdfViewer} 
        onClose={() => setShowPdfViewer(null)} 
        title={showPdfViewer?.nome_original}
        size="70%"
        radius="lg"
        padding={0}
        styles={{ body: { height: '80vh', display: 'flex', flexDirection: 'column' } }}
      >
        <Box flex={1} bg="slate.1">
          <iframe
            src={showPdfViewer ? `http://localhost:3000${showPdfViewer.path}#toolbar=0` : ''}
            className="w-full h-full border-none"
            title="Visualizador de PDF"
          />
        </Box>
        <Group p="md" justify="flex-end" className="bg-slate-50 border-t border-slate-200">
          <Button 
            variant="filled" 
            color="blue" 
            component="a" 
            href={showPdfViewer ? `http://localhost:3000${showPdfViewer.path}` : '#'} 
            download 
            leftSection={<Download size={16} />}
          >
            Download
          </Button>
        </Group>
      </Modal>
      </Box>
  );
}

function EditarPastaModal({ pastaId, onClose, onSaved }) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    documentosAPI.pastas.getById(pastaId)
      .then((res) => setNome(res.data.nome))
      .catch((err) => {
        console.error(err);
        onClose();
      });
  }, [pastaId]);

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    try {
      setLoading(true);
      await documentosAPI.pastas.update(pastaId, { nome });
      onSaved();
    } catch (_err) {
      toast.error("Erro ao editar pasta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Editar Pasta" centered radius="lg">
      <Stack gap="md">
        <TextInput
          label="Nome da Pasta"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          radius="md"
          autoFocus
        />
        <Group justify="flex-end" pt="md">
          <Button variant="subtle" color="gray" onClick={onClose}>Cancelar</Button>
          <Button color="amber" onClick={handleSalvar} loading={loading} radius="md">Salvar</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
