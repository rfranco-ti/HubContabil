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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <span className="ml-3 text-slate-500">Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header com Navegação de Pastas e Upload */}
      <div className="space-y-4 mb-6">
        {/* Breadcrumb e Botões */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {pastaSelecionada && (
              <button
                onClick={handleVoltarPasta}
                className="flex items-center text-slate-500 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft size={18} className="mr-1" />
                Voltar
              </button>
            )}
            <h2 className="text-lg font-black text-slate-800 flex items-center">
              <FolderOpen size={20} className="mr-2 text-primary-600" />
              {pastaSelecionada ? "Documentos na Pasta" : "Todos Documentos"} (
              {documentos.length})
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNovaPasta(true)}
              className="flex items-center bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold px-3 py-2 rounded-lg transition-colors"
            >
              <Folder size={16} className="mr-1.5" />
              Nova Pasta
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-1.5" />
              {showUploadForm ? "Cancelar" : "Novo Documento"}
            </button>
          </div>
        </div>

        {/* Breadcrumb de Navegação Aninhada */}
        {getBreadcrumbPath().length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 rounded-lg px-4 py-2">
            <button
              onClick={() => {
                setHistoricoNavegacao([]);
                setPastaSelecionada(null);
              }}
              className="hover:text-primary-600 transition-colors"
            >
              📁 Todas
            </button>
            <span className="text-slate-300">/</span>
            {getBreadcrumbPath().map((pasta, index, arr) => (
              <span key={pasta.id} className="flex items-center gap-2">
                <button
                  onClick={() => handleNavegarBreadcrumb(pasta.id, index)}
                  className="hover:text-primary-600 transition-colors font-medium"
                >
                  {pasta.nome}
                </button>
                {index < arr.length - 1 && (
                  <span className="text-slate-300">/</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Busca de Pastas */}
        {!pastaSelecionada && (
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar pastas..."
              value={buscaPastas}
              onChange={(e) => setBuscaPastas(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        )}

        {/* Lista de Pastas (se não houver pasta selecionada) */}
        {!pastaSelecionada && pastas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pastasFiltradas.map((pasta) => (
              <div
                key={pasta._id}
                className="relative bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleNavegarPasta(pasta._id)}
              >
                <div className="flex flex-col items-center text-center">
                  <Folder
                    size={40}
                    className="text-primary-400 mb-2 group-hover:text-primary-500"
                  />
                  <p className="text-sm font-bold text-slate-700 truncate w-full">
                    {pasta.nome}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {pasta.descricao || "Sem descrição"}
                  </p>
                  <p className="text-xs text-primary-600 mt-2 font-bold bg-primary-50 px-2 py-1 rounded-full">
                    📄 {getDocumentosCount(pasta._id)}{" "}
                    {getDocumentosCount(pasta._id) === 1 ? "doc" : "docs"}
                  </p>
                </div>

                {/* Menu de Ações da Pasta */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPastaMenuOpen(
                        pastaMenuOpen === pasta._id ? null : pasta._id,
                      );
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {pastaMenuOpen === pasta._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setPastaMenuOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditandoPasta(pasta._id);
                            setPastaMenuOpen(null);
                          }}
                          className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 size={12} className="mr-2" />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletarPasta(pasta._id, pasta.nome);
                            setPastaMenuOpen(null);
                          }}
                          className="w-full flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} className="mr-2" />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-700 mb-4">
            Enviar Novo Documento
          </h3>

          {/* Info de Limites */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">
                📁 {selectedFiles.length} / {MAX_FILES} arquivos selecionados
              </span>
              <span className="text-blue-600">Máx: 10MB por arquivo</span>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-primary-500 bg-primary-50"
                : selectedFiles.length >= MAX_FILES
                  ? "border-red-300 bg-red-50 cursor-not-allowed"
                  : "border-slate-300 hover:border-primary-400 hover:bg-slate-100"
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
            <Upload
              size={48}
              className={`mx-auto mb-3 ${
                selectedFiles.length >= MAX_FILES
                  ? "text-red-400"
                  : "text-slate-400"
              }`}
            />
            <p
              className={`font-medium ${
                selectedFiles.length >= MAX_FILES
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
            >
              {selectedFiles.length >= MAX_FILES
                ? "Limite máximo de arquivos atingido"
                : "Arraste e solte arquivos aqui"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              ou clique para selecionar
            </p>
            <p className="text-xs text-slate-400 mt-2">
              PDF, PNG, JPG, DOC, DOCX (máx. 10MB)
            </p>
          </div>

          {/* Preview de Imagens */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-slate-700 mb-2 text-sm">
                🖼️ Imagens ({imagePreviews.length})
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-full object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => removePreview(index, true)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {preview.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview de PDFs */}
          {pdfPreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-slate-700 mb-2 text-sm">
                📄 PDFs ({pdfPreviews.length})
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {pdfPreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    {preview.isThumbnail && preview.url ? (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
                        <File className="text-red-500" size={40} />
                      </div>
                    )}
                    <button
                      onClick={() => removePreview(index, false)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {preview.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Queue com Prioridade */}
          {uploadQueue.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-700 text-sm flex items-center">
                  📋 Fila de Upload ({uploadQueue.length})
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={togglePause}
                    disabled={uploadQueue.length === 0}
                    className="flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  >
                    {isPaused ? (
                      <PlayCircle size={14} className="mr-1" />
                    ) : (
                      <PauseCircle size={14} className="mr-1" />
                    )}
                    {isPaused ? "Retomar" : "Pausar"}
                  </button>
                  <button
                    onClick={clearCompleted}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    Limpar Concluídos
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadQueue.map((item, _index) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-sm font-medium truncate">
                          {item.file.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : item.priority === "low"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.priority === "high"
                            ? "🔴 Alta"
                            : item.priority === "low"
                              ? "⚪ Baixa"
                              : "🔵 Normal"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            item.status === "completed"
                              ? "text-emerald-600"
                              : item.status === "error"
                                ? "text-red-600"
                                : item.status === "cancelled"
                                  ? "text-amber-600"
                                  : "text-slate-500"
                          }`}
                        >
                          {item.status === "completed" && "✅ "}
                          {item.status === "error" && "❌ "}
                          {item.status === "cancelled" && "⏸️ "}
                          {item.status === "uploading" && "⏳ "}
                          {item.status === "pending" && "⏳ "}
                          {item.status === "completed"
                            ? "Concluído"
                            : item.status === "error"
                              ? "Erro"
                              : item.status === "cancelled"
                                ? "Cancelado"
                                : item.status === "uploading"
                                  ? "Enviando..."
                                  : "Aguardando..."}
                        </span>
                        {item.status === "error" && (
                          <button
                            onClick={() => retryUpload(item.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                          >
                            🔄 Retry
                          </button>
                        )}
                        {(item.status === "pending" ||
                          item.status === "uploading") && (
                          <button
                            onClick={() => cancelUpload(item.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-bold"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all ${
                          item.status === "completed"
                            ? "bg-emerald-500"
                            : item.status === "error"
                              ? "bg-red-500"
                              : item.status === "cancelled"
                                ? "bg-amber-500"
                                : "bg-primary-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle size={10} className="mr-1" />
                        {item.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Tipo
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="documento">Documento</option>
                <option value="nota_fiscal">Nota Fiscal</option>
                <option value="contrato">Contrato</option>
                <option value="certidao">Certidão</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Pasta
              </label>
              <select
                value={pastaSelecionada || ""}
                onChange={(e) => setPastaSelecionada(e.target.value || null)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sem pasta</option>
                {pastas.map((pasta) => (
                  <option key={pasta._id} value={pasta._id}>
                    {pasta.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: NF Janeiro 2024"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {uploading && (
              <button
                onClick={handleCancelAllUploads}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center"
              >
                <PauseCircle size={18} className="mr-2" />
                Cancelar Todos
              </button>
            )}
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFiles([]);
                setUploadProgress([]);
              }}
              disabled={uploading}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? "Enviando..." : "Cancelar"}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Enviar ({selectedFiles.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Barra de Progresso dos Uploads */}
      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
            <Upload size={20} className="mr-2 text-primary-600" />
            Progresso dos Uploads
          </h3>
          <div className="space-y-3">
            {uploadProgress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 truncate flex-1">
                    {item.name}
                  </span>
                  <span
                    className={`ml-4 text-xs font-bold ${
                      item.status === "success"
                        ? "text-emerald-600"
                        : item.status === "error"
                          ? "text-red-600"
                          : item.status === "cancelled"
                            ? "text-amber-600"
                            : "text-slate-500"
                    }`}
                  >
                    {item.status === "success" && "✅ "}
                    {item.status === "error" && "❌ "}
                    {item.status === "cancelled" && "⏸️ "}
                    {item.status === "uploading" && "⏳ "}
                    {item.status === "pending" && "⏳ "}
                    {item.status === "success"
                      ? "Concluído"
                      : item.status === "error"
                        ? "Erro"
                        : item.status === "cancelled"
                          ? "Cancelado"
                          : item.status === "uploading"
                            ? "Enviando..."
                            : "Aguardando..."}
                  </span>
                </div>
                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${
                      item.status === "success"
                        ? "bg-emerald-500"
                        : item.status === "error"
                          ? "bg-red-500"
                          : item.status === "cancelled"
                            ? "bg-amber-500"
                            : "bg-primary-500"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.error && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {item.error}
                  </p>
                )}
                {(item.status === "error" || item.status === "cancelled") && (
                  <button
                    onClick={() => handleRetryUpload(index)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                  >
                    🔄 Tentar novamente
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Nova Pasta */}
      {showNovaPasta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <Folder size={20} className="mr-2 text-primary-600" />
                Nova Pasta
              </h3>
              <button
                onClick={() => setShowNovaPasta(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nome da Pasta *
                </label>
                <input
                  type="text"
                  value={novaPastaNome}
                  onChange={(e) => setNovaPastaNome(e.target.value)}
                  placeholder="Ex: Notas Fiscais 2024"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novaPastaDescricao}
                  onChange={(e) => setNovaPastaDescricao(e.target.value)}
                  placeholder="Ex: NFs de entrada"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNovaPasta(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriarPasta}
                  disabled={criandoPasta || !novaPastaNome.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {criandoPasta ? "Criando..." : "Criar Pasta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      {documentos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum documento enviado</p>
          <p className="text-sm text-slate-400 mt-1">
            Clique em "Novo Documento" para enviar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {documentos.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail ou Ícone */}
                  {doc.thumbnail_path ? (
                    <img
                      src={`http://localhost:3000${doc.thumbnail_path}`}
                      alt={doc.nome_original}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="text-3xl">{getTipoIcon(doc.tipo)}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800">
                        {doc.nome_original}
                      </h4>
                      {doc.ocr_realizado && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          OCR
                        </span>
                      )}
                    </div>
                    {doc.descricao && (
                      <p className="text-sm text-slate-500 mb-2">
                        {doc.descricao}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>{formatTamanho(doc.tamanho)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.createdAt)}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {doc.tipo.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      doc.mimetype === "application/pdf"
                        ? setShowPdfViewer(doc)
                        : handleDownload(doc)
                    }
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={
                      doc.mimetype === "application/pdf"
                        ? "Visualizar PDF"
                        : "Baixar"
                    }
                  >
                    {doc.mimetype === "application/pdf" ? (
                      <File size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Baixar"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowMoverDoc(showMoverDoc === doc._id ? null : doc._id)
                    }
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Mover para outra pasta"
                  >
                    <Move size={18} />
                  </button>
                  <button
                    onClick={() => handleOcr(doc._id)}
                    disabled={ocrLoading === doc._id}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Executar OCR"
                  >
                    {ocrLoading === doc._id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Menu de Mover Documento */}
                  {showMoverDoc === doc._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMoverDoc(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20 min-w-[200px] max-h-64 overflow-y-auto">
                        <p className="text-xs font-bold text-slate-500 px-3 py-1 uppercase">
                          Mover para:
                        </p>
                        <button
                          onClick={() => handleMoverDocumento(doc._id, null)}
                          className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Folder size={12} className="mr-2" />
                          Sem pasta
                        </button>
                        {todasPastas.map((pasta) => (
                          <button
                            key={pasta._id}
                            onClick={() =>
                              handleMoverDocumento(doc._id, pasta._id)
                            }
                            className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Folder
                              size={12}
                              className="mr-2 text-primary-400"
                            />
                            {pasta.nome}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Visualização de OCR */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{selectedDoc.nome_original}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                {selectedDoc.ocr_texto || "Nenhum texto extraído."}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de PDF */}
      {showPdfViewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <File className="text-primary-600" size={24} />
                <div>
                  <h3 className="font-bold text-slate-800">
                    {showPdfViewer.nome_original}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatDate(showPdfViewer.createdAt)} •{" "}
                    {formatTamanho(showPdfViewer.tamanho)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`http://localhost:3000${showPdfViewer.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </a>
                <button
                  onClick={() => setShowPdfViewer(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-100">
              <iframe
                src={`http://localhost:3000${showPdfViewer.path}#toolbar=0`}
                className="w-full h-full"
                title="Visualizador de PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de Editar Pasta
function EditarPastaModal({ pastaId, onClose, onSaved }) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar dados da pasta
    documentosAPI.pastas
      .getById(pastaId)
      .then((res) => {
        setNome(res.data.nome);
      })
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center">
            <Edit2 size={20} className="mr-2 text-amber-600" />
            Editar Pasta
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Nome da Pasta *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={loading || !nome.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
