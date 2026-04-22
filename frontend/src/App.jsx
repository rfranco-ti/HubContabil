import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/Toaster";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

// Configuração do TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Páginas carregadas imediatamente (críticas para first paint)
import Login from "./pages/Login";

// Lazy load todas as outras páginas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clientes = lazy(() => import("./pages/clientes/ListaClientes"));
const NovoCliente = lazy(() => import("./pages/NovoCliente"));
const PesquisaEmpresas = lazy(() => import("./pages/pesquisa/PesquisaEmpresas"));
const VisualizacaoEmpresa = lazy(() => import("./pages/pesquisa/VisualizacaoEmpresa"));
const DetalheCliente = lazy(() => import("./pages/clientes/DetalheCliente"));
const Robos = lazy(() => import("./pages/Robos"));
const RoboSimples = lazy(() => import("./pages/RoboSimples"));
const RoboSefaz = lazy(() => import("./pages/RoboSefaz"));
const DetalheSefaz = lazy(() => import("./pages/DetalheSefaz"));
const Documentos = lazy(() => import("./pages/Documentos"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Calendario = lazy(() => import("./pages/Calendario"));
const TodasPesquisas = lazy(() => import("./pages/TodasPesquisas"));
const ConsultaSimples = lazy(() => import("./pages/ConsultaSimples"));
const ComprovanteSimples = lazy(() => import("./pages/ComprovanteSimples"));
const BuscaCnaes = lazy(() => import("./pages/BuscaCnaes"));
const BuscaCnaesMei = lazy(() => import("./pages/BuscaCnaesMei"));
const ChatBot = lazy(() => import("./pages/ChatBot"));
const CertificadosDigitais = lazy(() => import("./pages/CertificadosDigitais"));
const StickyNotes = lazy(() => import("./pages/StickyNotes"));
const EditorModelos = lazy(() => import("./pages/EditorModelos"));
const GeradorDocumentos = lazy(() => import("./pages/GeradorDocumentos"));
const LogsSistema = lazy(() => import("./pages/LogsSistema"));
const PainelAdmin = lazy(() => import("./pages/PainelAdmin"));
const Calculos = lazy(() => import("./pages/Calculos"));
const SimuladorRescisao = lazy(() => import("./pages/calculos/SimuladorRescisao"));
const CalculadoraFatorR = lazy(() => import("./pages/calculos/CalculadoraFatorR"));
const CalculadoraHorasExtras = lazy(
  () => import("./pages/calculos/CalculadoraHorasExtras"),
);
const CalculadoraSalarioLiquido = lazy(
  () => import("./pages/calculos/CalculadoraSalarioLiquido"),
);
const CalculadoraFerias = lazy(
  () => import("./pages/calculos/CalculadoraFerias"),
);
const CalculadoraDecimoTerceiro = lazy(
  () => import("./pages/calculos/CalculadoraDecimoTerceiro"),
);
const CalculadoraInsalubridadePericulosidade = lazy(
  () => import("./pages/calculos/CalculadoraInsalubridadePericulosidade"),
);
const CalculadoraISS = lazy(
  () => import("./pages/calculos/CalculadoraISS"),
);
const CalculadoraICMSBahia = lazy(
  () => import("./pages/calculos/CalculadoraICMSBahia"),
);
const CalculadoraIRPF = lazy(
  () => import("./pages/calculos/CalculadoraIRPF"),
);
const ConsultaIptu = lazy(
  () => import("./pages/calculos/ConsultaIptu"),
);
const ConsultaFichaCadastral = lazy(
  () => import("./pages/calculos/ConsultaFichaCadastral"),
);
const SimuladorAposentadoria = lazy(
  () => import("./pages/calculos/SimuladorAposentadoria"),
);
const CalculadoraDepreciacao = lazy(
  () => import("./pages/calculos/CalculadoraDepreciacao"),
);
const SimuladorLucroReal = lazy(
  () => import("./pages/calculos/SimuladorLucroReal"),
);
const CalculadoraPISCOFINS = lazy(
  () => import("./pages/calculos/CalculadoraPISCOFINS"),
);
const SimuladorSimplesNacional = lazy(
  () => import("./pages/calculos/SimuladorSimplesNacional"),
);
const SimuladorLucroPresumido = lazy(
  () => import("./pages/calculos/SimuladorLucroPresumido"),
);
const Error403 = lazy(() => import("./pages/Error403"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-gray-500 font-medium text-sm">Carregando...</p>
      </div>
    </div>
  );
}

// Lazy route helper
function LazyRoute({ children, fallback = <PageLoader /> }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<LazyRoute><Error403 /></LazyRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <LazyRoute>
                    <Dashboard />
                  </LazyRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <LazyRoute>
                    <Clientes />
                  </LazyRoute>
                }
              />
              <Route
                path="/clientes/novo"
                element={
                  <LazyRoute>
                    <NovoCliente />
                  </LazyRoute>
                }
              />
              <Route
                path="/clientes/:cnpj"
                element={
                  <LazyRoute>
                    <DetalheCliente />
                  </LazyRoute>
                }
              />
              <Route
                path="/pesquisa"
                element={
                  <LazyRoute>
                    <TodasPesquisas />
                  </LazyRoute>
                }
              />
              <Route
                path="/pesquisa/empresas"
                element={
                  <LazyRoute>
                    <PesquisaEmpresas />
                  </LazyRoute>
                }
              />
              <Route
                path="/calendario"
                element={
                  <LazyRoute>
                    <Calendario />
                  </LazyRoute>
                }
              />
              <Route
                path="/empresa/:cnpj"
                element={
                  <LazyRoute>
                    <VisualizacaoEmpresa />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos"
                element={
                  <LazyRoute>
                    <Robos />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos/simples-nacional"
                element={
                  <LazyRoute>
                    <RoboSimples />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos/sefaz-ba"
                element={
                  <LazyRoute>
                    <RoboSefaz />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos/sefaz-ba/detalhes"
                element={
                  <LazyRoute>
                    <DetalheSefaz />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos/iptu-salvador"
                element={
                  <LazyRoute>
                    <ConsultaIptu />
                  </LazyRoute>
                }
              />
              <Route
                path="/robos/ficha-cadastral"
                element={
                  <LazyRoute>
                    <ConsultaFichaCadastral />
                  </LazyRoute>
                }
              />
              <Route
                path="/documentos"
                element={
                  <LazyRoute>
                    <Documentos />
                  </LazyRoute>
                }
              />
              <Route
                path="/certificados"
                element={
                  <LazyRoute>
                    <CertificadosDigitais />
                  </LazyRoute>
                }
              />
              <Route
                path="/notas"
                element={
                  <LazyRoute>
                    <StickyNotes />
                  </LazyRoute>
                }
              />
              <Route
                path="/gerador-documentos"
                element={
                  <LazyRoute>
                    <ErrorBoundary
                      fallback={<p>Erro ao carregar gerador de documentos</p>}
                    >
                      <GeradorDocumentos />
                    </ErrorBoundary>
                  </LazyRoute>
                }
              />
              <Route
                path="/gerador-documentos/:templateId"
                element={
                  <LazyRoute>
                    <ErrorBoundary
                      fallback={<p>Erro ao carregar gerador de documentos</p>}
                    >
                      <GeradorDocumentos />
                    </ErrorBoundary>
                  </LazyRoute>
                }
              />
              <Route
                path="/editor-modelos"
                element={
                  <LazyRoute>
                    <ErrorBoundary
                      fallback={<p>Erro ao carregar editor de modelos</p>}
                    >
                      <EditorModelos />
                    </ErrorBoundary>
                  </LazyRoute>
                }
              />
              <Route
                path="/configs"
                element={
                  <LazyRoute>
                    <Configuracoes />
                  </LazyRoute>
                }
              />
              <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="/logs"
                  element={
                    <LazyRoute>
                      <LogsSistema />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <LazyRoute>
                      <PainelAdmin />
                    </LazyRoute>
                  }
                />
              </Route>
              <Route
                path="/simulador-rescisao"
                element={
                  <LazyRoute>
                    <SimuladorRescisao />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos"
                element={
                  <LazyRoute>
                    <Calculos />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/rescisao"
                element={
                  <LazyRoute>
                    <SimuladorRescisao />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/horas-extras"
                element={
                  <LazyRoute>
                    <CalculadoraHorasExtras />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/salario-liquido"
                element={
                  <LazyRoute>
                    <CalculadoraSalarioLiquido />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/ferias"
                element={
                  <LazyRoute>
                    <CalculadoraFerias />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/decimo-terceiro"
                element={
                  <LazyRoute>
                    <CalculadoraDecimoTerceiro />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/insalubridade-periculosidade"
                element={
                  <LazyRoute>
                    <CalculadoraInsalubridadePericulosidade />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/iss-retencao"
                element={
                  <LazyRoute>
                    <CalculadoraISS />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/icms-bahia"
                element={
                  <LazyRoute>
                    <CalculadoraICMSBahia />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/irpf"
                element={
                  <LazyRoute>
                    <CalculadoraIRPF />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/aposentadoria"
                element={
                  <LazyRoute>
                    <SimuladorAposentadoria />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/depreciacao"
                element={
                  <LazyRoute>
                    <CalculadoraDepreciacao />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/lucro-real"
                element={
                  <LazyRoute>
                    <SimuladorLucroReal />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/pis-cofins"
                element={
                  <LazyRoute>
                    <CalculadoraPISCOFINS />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/simples-nacional"
                element={
                  <LazyRoute>
                    <SimuladorSimplesNacional />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/simples/consulta"
                element={
                  <LazyRoute>
                    <ConsultaSimples />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/simples/comprovante"
                element={
                  <LazyRoute>
                    <ComprovanteSimples />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/busca-cnaes"
                element={
                  <LazyRoute>
                    <BuscaCnaes />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/busca-cnaes-mei"
                element={
                  <LazyRoute>
                    <BuscaCnaesMei />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/fator-r"
                element={
                  <LazyRoute>
                    <CalculadoraFatorR />
                  </LazyRoute>
                }
              />
              <Route
                path="/ferramentas/chat"
                element={
                  <LazyRoute>
                    <ChatBot />
                  </LazyRoute>
                }
              />
              <Route
                path="/calculos/lucro-presumido"
                element={
                  <LazyRoute>
                    <SimuladorLucroPresumido />
                  </LazyRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
