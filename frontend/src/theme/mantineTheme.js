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
    fontWeight: "600",
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
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
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
  },
});

export default hubMantineTheme;
