import { createTheme } from "@mantine/core";
import baseTheme from "../theme.js";

const scale = (palette, keys) => keys.map((key) => palette[key]);

const blue = scale(baseTheme.colors.primary, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const gray = scale(baseTheme.colors.secondary, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const cyan = scale(baseTheme.colors.accent, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const red = scale(baseTheme.colors.destructive, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const green = scale(baseTheme.colors.success, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const yellow = scale(baseTheme.colors.warning, [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]);

const dark = [
  "#f8fafc",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#020617",
];

export const layoutTokens = {
  headerHeight: 64,
  sidebarCollapsedWidth: 88,
  sidebarExpandedWidth: 280,
  mobileDrawerWidth: 320,
};

export const hubMantineTheme = createTheme({
  primaryColor: "blue",
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "700",
  },
  colors: {
    blue,
    gray,
    cyan,
    red,
    green,
    yellow,
    dark,
  },
  components: {
    AppShell: {
      defaultProps: {
        padding: 0,
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: "subtle",
        radius: "md",
      },
    },
    Avatar: {
      defaultProps: {
        radius: "md",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Drawer: {
      defaultProps: {
        radius: "lg",
        withinPortal: true,
        overlayProps: {
          opacity: 0.45,
          blur: 4,
        },
      },
    },
    Menu: {
      defaultProps: {
        shadow: "lg",
        radius: "md",
        withinPortal: true,
      },
    },
    NavLink: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
      },
    },
    Popover: {
      defaultProps: {
        shadow: "lg",
        radius: "md",
        withinPortal: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        withinPortal: true,
      },
    },
  },
});

export default hubMantineTheme;
