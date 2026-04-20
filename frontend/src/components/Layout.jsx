import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { AppHeader } from "./layout/AppHeader";
import { AppSidebar } from "./layout/AppSidebar";
import { layoutTokens } from "../theme/mantineTheme";

const STORAGE_KEY = "sidebar-collapsed";
const MOBILE_BREAKPOINT = "(max-width: 47.99em)";

function getInitialCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function Layout() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, false);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileNavbarOpened, setMobileNavbarOpened] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== "b") {
        return;
      }

      event.preventDefault();

      if (isMobile) {
        setMobileNavbarOpened((value) => !value);
        return;
      }

      setCollapsed((value) => {
        const next = !value;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // localStorage pode estar indisponível em modo privado
        }
        return next;
      });
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileNavbarOpened((value) => !value);
      return;
    }

    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignora falha de persistência
      }
      return next;
    });
  };

  const closeMobileNavbar = () => setMobileNavbarOpened(false);

  const navbarWidth = collapsed
    ? layoutTokens.sidebarCollapsedWidth
    : layoutTokens.sidebarExpandedWidth;

  return (
    <AppShell
      header={{ height: layoutTokens.headerHeight }}
      navbar={
        isMobile
          ? undefined
          : { width: navbarWidth, breakpoint: "sm" }
      }
      padding={0}
      styles={(theme) => ({
        main: {
          minHeight: "100vh",
          background:
            theme.colorScheme === "dark"
              ? `linear-gradient(180deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[9]} 100%)`
              : `linear-gradient(180deg, ${theme.colors.gray[0]} 0%, ${theme.white} 100%)`,
        },
      })}
    >
      <AppHeader
        isMobile={isMobile}
        burgerOpened={isMobile ? mobileNavbarOpened : !collapsed}
        onBurgerClick={toggleSidebar}
      />

      {!isMobile && (
        <AppSidebar
          collapsed={collapsed}
          isMobile={false}
          onToggleCollapsed={toggleSidebar}
        />
      )}

      {isMobile && (
        <AppSidebar
          isMobile
          onClose={closeMobileNavbar}
          opened={mobileNavbarOpened}
        />
      )}

      <AppShell.Main>
        <Box p={{ base: "sm", sm: "md", lg: "lg" }}>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
