/**
 * ============================================
 * HubContabil - Frontend Configuration
 * ============================================
 * Configurações globais do frontend
 * Paleta de cores, temas e constantes
 * ============================================
 */

// ============================================
// PALETA DE CORES OFICIAL
// ============================================

/**
 * Cores primárias - Azul HubContabil
 * Usado em: Botões principais, links, ícones ativos, badges
 */
export const PRIMARY = {
  50: '#eff6ff',   // Backgrounds muito claros
  100: '#dbeafe',  // Ícones, badges background
  200: '#bfdbfe',  // Bordas sutis
  300: '#93c5fd',  // Hover states claros
  400: '#60a5fa',  // Elementos secundários
  500: '#3b82f6',  // Botões secundários
  600: '#2563eb',  // COR PRINCIPAL - Botões, links ativos
  700: '#1d4ed8',  // Hover de botões principais
  800: '#1e40af',  // Elementos escuros
  900: '#1e3a8a',  // Textos importantes
  950: '#172554',  // Azul muito escuro
};

/**
 * Cores neutras - Slate
 * Usado em: Sidebar, textos, bordas, backgrounds
 */
export const SLATE = {
  50: '#f8fafc',   // Background da página
  100: '#f1f5f9',  // Hover suave, rows alternadas
  200: '#e2e8f0',  // Bordas de cards, tabelas
  300: '#cbd5e1',  // Bordas de inputs
  400: '#94a3b8',  // Textos secundários, ícones inativos
  500: '#64748b',  // Textos terciários, labels
  600: '#475569',  // Ícones, textos médios
  700: '#334155',  // Textos principais
  800: '#1e293b',  // Sidebar accent, hover escuro
  900: '#0f172a',  // SIDEBAR BACKGROUND
  950: '#020617',  // Slate muito escuro
};

/**
 * Cores de sucesso - Green
 * Usado em: Status ativo, sucesso, confirmações
 */
export const SUCCESS = {
  50: '#f0fdf4',   // Backgrounds success claros
  100: '#dcfce7',  // Badges success
  200: '#bbf7d0',  // Bordas success
  300: '#86efac',  // Ícones success
  400: '#4ade80',  // Elementos success
  500: '#22c55e',  // Botões success
  600: '#16a34a',  // Ícones, textos success
  700: '#15803d',  // Textos success escuros
  800: '#166534',  // Backgrounds success escuros
  900: '#14532d',  // Success muito escuro
};

/**
 * Cores de aviso - Yellow
 * Usado em: Status pendente, alertas, warnings
 */
export const WARNING = {
  50: '#fffbeb',   // Backgrounds warning claros
  100: '#fef3c7',  // Badges warning
  200: '#fde68a',  // Bordas warning
  300: '#fcd34d',  // Ícones warning
  400: '#fbbf24',  // Elementos warning
  500: '#f59e0b',  // Botões warning
  600: '#d97706',  // Ícones, textos warning
  700: '#b45309',  // Textos warning escuros
  800: '#92400e',  // Backgrounds warning escuros
  900: '#78350f',  // Warning muito escuro
};

/**
 * Cores de erro - Red
 * Usado em: Status inativo, erros, ações destrutivas
 */
export const DESTRUCTIVE = {
  50: '#fef2f2',   // Backgrounds error claros
  100: '#fee2e2',  // Badges error
  200: '#fecaca',  // Bordas error
  300: '#fca5a5',  // Ícones error
  400: '#f87171',  // Elementos error
  500: '#ef4444',  // Botões error
  600: '#dc2626',  // Ícones, textos error
  700: '#b91c1c',  // Textos error escuros
  800: '#991b1b',  // Backgrounds error escuros
  900: '#7f1d1d',  // Error muito escuro
};

/**
 * Cores de informação - Cyan
 * Usado em: Status informativo, alerts info
 */
export const INFO = {
  50: '#ecfeff',   // Backgrounds info claros
  100: '#cffafe',  // Badges info
  200: '#a5f3fc',  // Bordas info
  300: '#67e8f9',  // Ícones info
  400: '#22d3ee',  // Elementos info
  500: '#06b6d4',  // Botões info
  600: '#0891b2',  // Ícones, textos info
  700: '#0e7490',  // Textos info escuros
  800: '#155e75',  // Backgrounds info escuros
  900: '#164e63',  // Info muito escuro
};

// ============================================
// CONFIGURAÇÃO DE TEMA
// ============================================

export const THEME = {
  // Backgrounds principais
  background: {
    page: SLATE[50],        // #f8fafc - Fundo da página
    sidebar: SLATE[900],    // #0f172a - Fundo da sidebar
    card: '#ffffff',        // Branco - Fundo de cards
  },

  // Bordas
  border: {
    default: SLATE[200],    // #e2e8f0 - Bordas padrão
    input: SLATE[300],      // #cbd5e1 - Bordas de inputs
    focus: PRIMARY[500],    // #3b82f6 - Bordas em focus
    error: DESTRUCTIVE[300],// #fca5a5 - Bordas em erro
  },

  // Textos
  text: {
    primary: SLATE[900],    // #0f172a - Títulos principais
    secondary: SLATE[600],  // #475569 - Textos secundários
    tertiary: SLATE[500],   // #64748b - Textos terciários, labels
    muted: SLATE[400],      // #94a3b8 - Textos muted
    inverse: '#ffffff',     // Branco - Texto em fundo escuro
  },

  // Estados interativos
  interactive: {
    primary: PRIMARY[600],      // #2563eb - Botão principal
    primaryHover: PRIMARY[700], // #1d4ed8 - Hover principal
    secondary: SLATE[600],      // #475569 - Botão secundário
    secondaryHover: SLATE[700], // #334155 - Hover secundário
    ghost: 'transparent',       // Transparent - Botão ghost
    ghostHover: SLATE[100],     // #f1f5f9 - Hover ghost
  },

  // Status
  status: {
    success: SUCCESS[600],      // #16a34a - Status sucesso
    successBg: SUCCESS[100],    // #dcfce7 - Background sucesso
    warning: WARNING[600],      // #d97706 - Status aviso
    warningBg: WARNING[100],    // #fef3c7 - Background aviso
    error: DESTRUCTIVE[600],    // #dc2626 - Status erro
    errorBg: DESTRUCTIVE[100],  // #fee2e2 - Background erro
    info: INFO[600],            // #0891b2 - Status info
    infoBg: INFO[100],          // #cffafe - Background info
  },

  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    primary: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
  },

  // Border radius
  radius: {
    sm: '0.375rem',   // 6px - Badges pequenos
    md: '0.5rem',     // 8px - Botões, inputs
    lg: '0.75rem',    // 12px - Cards
    xl: '1rem',       // 16px - Modais
    full: '9999px',   // Badges, avatares
  },
};

// ============================================
// CONSTANTES DE LAYOUT
// ============================================

export const LAYOUT = {
  // Header
  header: {
    height: '4rem',           // h-16 (64px)
    zIndex: 50,
  },

  // Sidebar
  sidebar: {
    width: '18rem',           // w-72 (288px)
    zIndex: 40,
    background: SLATE[900],
    border: SLATE[800],
  },

  // Main content
  main: {
    paddingTop: '4rem',       // pt-16 (64px)
    padding: '1.5rem',        // p-6 (24px) desktop
    paddingMobile: '1rem',    // p-4 (16px) mobile
    background: SLATE[50],
  },

  // Espaçamentos
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// ============================================
// TIPOGRAFIA
// ============================================

export const TYPOGRAPHY = {
  // Fontes
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, monospace',
  },

  // Tamanhos
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },

  // Pesos
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Altura de linha
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// ============================================
// TRANSIÇÕES E ANIMAÇÕES
// ============================================

export const ANIMATIONS = {
  // Durações
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Transições padrão
  transition: {
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================
// EXPORTAÇÃO PADRÃO
// ============================================

export default {
  PRIMARY,
  SLATE,
  SUCCESS,
  WARNING,
  DESTRUCTIVE,
  INFO,
  THEME,
  LAYOUT,
  TYPOGRAPHY,
  ANIMATIONS,
};
