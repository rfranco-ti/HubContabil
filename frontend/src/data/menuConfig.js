import {
  LayoutDashboard,
  Users,
  Calculator,
  Calendar,
  Bot,
  FileText,
  FileSignature,
  FilePlus,
  StickyNote,
  Settings,
  Wrench,
  BadgeCheck,
  FileDown,
  List,
  Search,
  TrendingUp,
  Percent,
  MessageSquare,
  MapPin,
  Building2,
} from "lucide-react";

export const menuGroups = [
  {
    label: "Principal",
    items: [
      { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { text: "Clientes", icon: Users, path: "/clientes", badge: true },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { text: "Cálculos", icon: Calculator, path: "/calculos" },
      { text: "Simulador Rescisão", icon: Wrench, path: "/simulador-rescisao" },
      {
        text: "Simples Nacional",
        icon: BadgeCheck,
        path: "/ferramentas/simples",
        submenu: [
          {
            text: "Consulta Simples",
            icon: Search,
            path: "/ferramentas/simples/consulta",
          },
          {
            text: "Comprovante PDF",
            icon: FileDown,
            path: "/ferramentas/simples/comprovante",
          },
        ],
      },
      {
        text: "CNAE",
        icon: List,
        path: "/ferramentas/busca-cnaes",
        submenu: [
          {
            text: "Busca CNAEs",
            icon: List,
            path: "/ferramentas/busca-cnaes",
          },
          {
            text: "Busca CNAEs MEI",
            icon: FileText,
            path: "/ferramentas/busca-cnaes-mei",
          },
        ],
      },
      {
        text: "Fator R",
        icon: Percent,
        path: "/ferramentas/fator-r",
        submenu: [
          {
            text: "Calculadora Fator R",
            icon: Calculator,
            path: "/ferramentas/fator-r",
          },
        ],
      },
      { text: "Assistente AI", icon: MessageSquare, path: "/ferramentas/chat" },
    ],
  },
  {
    label: "Calendário",
    items: [
      { text: "Calendário Contábil", icon: Calendar, path: "/calendario" },
    ],
  },
  {
    label: "Automação",
    items: [
      {
        text: "Robôs RPA",
        icon: Bot,
        path: "/robos",
        submenu: [
          { text: "Todos os Robôs", icon: Bot, path: "/robos" },
          {
            text: "Simples Nacional",
            icon: BadgeCheck,
            path: "/robos/simples-nacional",
          },
          { text: "SEFAZ Bahia", icon: FileText, path: "/robos/sefaz-ba" },
          { text: "Consulta IPTU", icon: MapPin, path: "/robos/iptu-salvador" },
          { text: "Ficha Cadastral", icon: Building2, path: "/robos/ficha-cadastral" },
        ],
      },
    ],
  },
  {
    label: "Documentos",
    items: [
      { text: "Documentos", icon: FileText, path: "/documentos" },
      {
        text: "Gerador Docs",
        icon: FileSignature,
        path: "/gerador-documentos",
      },
      { text: "Editor de Modelos", icon: FilePlus, path: "/editor-modelos" },
    ],
  },
  {
    label: "Produtividade",
    items: [{ text: "Mural de Notas", icon: StickyNote, path: "/notas" }],
  },
  {
    label: "Administração",
    items: [{ text: "Configurações", icon: Settings, path: "/configs" }],
  },
];

export const VERSION = "3.0.0";
