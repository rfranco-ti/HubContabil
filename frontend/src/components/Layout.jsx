import { Outlet } from "react-router-dom";
import { AppShell, Box } from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import { DoubleNavbar } from "./DoubleNavbar";
import { layoutTokens } from "../theme/mantineTheme";

const MOBILE_BREAKPOINT = "(max-width: 47.99em)";
const TABLET_BREAKPOINT = "(max-width: 64em) and (min-width: 48em)";

export default function Layout() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, false);
  const isTablet = useMediaQuery(TABLET_BREAKPOINT, false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [minimal, setMinimal] = useState(false);

  useEffect(() => {
    if (isTablet) {
      setMinimal(true);
    } else {
      setMinimal(false);
    }
  }, [isTablet]);

  const handleBurgerClick = () => {
    if (isMobile) {
      toggleMobile();
    } else {
      setMinimal((m) => !m);
    }
  };

  const navbarWidth = minimal ? 80 : 280;

  return (
    <AppShell
      header={{ height: layoutTokens.headerHeight }}
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <AppHeader 
        burgerOpened={isMobile ? mobileOpened : !minimal} 
        toggleBurger={handleBurgerClick} 
      />

      <AppShell.Navbar p={0} style={{ overflow: 'hidden', transition: 'width 0.3s ease' }}>
        <DoubleNavbar 
          onCloseMobile={closeMobile} 
          isMinimal={minimal}
          onToggleMinimal={() => setMinimal(!minimal)}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box 
          p={{ base: "xs", sm: "md", lg: "xl" }} 
          style={{ 
            minHeight: "calc(100vh - 60px)",
            backgroundColor: 'var(--bg-page)',
          }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
