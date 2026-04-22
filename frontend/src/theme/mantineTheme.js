import { createTheme } from "@mantine/core";

export const sapphireBlue = [
  "#E6EEF8", // 0
  "#C2D6EE", // 1
  "#9DBFE4", // 2
  "#78A7DA", // 3
  "#538FD0", // 4
  "#0F52BA", // 5 (Primary)
  "#0C4295", // 6
  "#093270", // 7
  "#06214B", // 8
  "#031126", // 9
];

export const slateGray = [
  "#F8FAFC", // 0
  "#F1F5F9", // 1
  "#E2E8F0", // 2
  "#CBD5E1", // 3
  "#94A3B8", // 4
  "#64748B", // 5
  "#475569", // 6
  "#334155", // 7
  "#1E293B", // 8
  "#0F172A", // 9
];

export const layoutTokens = {
  headerHeight: 60,
  navbarSlimWidth: 80,
  navbarDetailWidth: 260,
};

export const hubMantineTheme = createTheme({
  primaryColor: "blue",
  primaryShade: 5,
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
  headings: {
    fontFamily: "Inter, sans-serif",
    fontWeight: "800",
    sizes: {
      h1: { fontSize: "clamp(1.75rem, 5vw, 2.25rem)", lineHeight: "1.2" },
      h2: { fontSize: "clamp(1.5rem, 4vw, 1.875rem)", lineHeight: "1.3" },
      h3: { fontSize: "clamp(1.25rem, 3vw, 1.5rem)", lineHeight: "1.35" },
      h4: { fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)", lineHeight: "1.4" },
      h5: { fontSize: "1.125rem", lineHeight: "1.5" },
    },
  },
  colors: {
    blue: sapphireBlue,
    gray: slateGray,
    // Add semantic colors if needed
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        fw: 600,
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: "md",
        variant: "subtle",
        size: "lg",
      },
      styles: {
        root: {
          // Garante que o ícone não tenha padding excessivo
          padding: 0,
        }
      }
    },
    Card: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
        padding: "lg",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        withBorder: true,
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        variant: "light",
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        overlayProps: {
          blur: 3,
          opacity: 0.55,
        },
      },
    },
    TextInput: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    NumberInput: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    Select: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    PasswordInput: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    Textarea: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    FileInput: {
      defaultProps: { size: "md", radius: "md" },
      styles: { 
        input: { fontWeight: 700 },
        label: { 
          fontWeight: 600, 
          marginBottom: 4,
          fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", // Responsividade fluida sem @media
        }
      },
    },
    Switch: {
      defaultProps: { size: "md", color: "blue" },
      styles: { label: { fontWeight: 500 } },
    },
    Checkbox: {
      defaultProps: { size: "md", color: "blue" },
      styles: { label: { fontWeight: 500 } },
    },
    Tabs: {
      defaultProps: { color: "blue", variant: "pills" },
      styles: {
        tab: { fontWeight: 600 },
      },
    },
    Stepper: {
      defaultProps: { color: "blue", size: "sm" },
      styles: {
        stepIcon: { fontWeight: 700 },
        stepLabel: { fontWeight: 600 },
      },
    },
    Alert: {
      defaultProps: { radius: "md", variant: "light" },
      styles: { title: { fontWeight: 700 } },
    },
    Divider: {
      defaultProps: { color: "gray.2" },
      styles: { label: { fontWeight: 700, color: "var(--mantine-color-gray-5)" } },
    },
    Tooltip: {
      defaultProps: { radius: "sm", withArrow: true },
    },
    Menu: {
      defaultProps: { radius: "md", shadow: "md" },
    },
    Anchor: {
      defaultProps: { underline: "hover", fw: 600 },
    },
    Title: {
      styles: {
        root: { 
          fontWeight: 800, 
          letterSpacing: "-0.02em",
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)", // Responsividade fluida sem @media
        },
      },
    },
    Grid: {
      defaultProps: {
        gutter: "xs",
      },
    },
  },
});

export default hubMantineTheme;
