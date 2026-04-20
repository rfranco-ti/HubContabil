/**
 * useResponsive - Custom hook for viewport detection with event listeners
 * 
 * Implements responsive breakpoint detection with window resize listeners
 * Provides mobile/tablet/desktop detection based on Mantine breakpoints
 * 
 * @returns {Object} Responsive state and methods
 * @property {boolean} isMobile - True if viewport width < 768px (sm breakpoint)
 * @property {boolean} isTablet - True if viewport width between 768px and 1200px
 * @property {boolean} isDesktop - True if viewport width >= 1200px (lg breakpoint)
 * @property {string} breakpoint - Current breakpoint name ('mobile', 'tablet', 'desktop')
 * @property {number} width - Current viewport width
 * @property {number} height - Current viewport height
 * @property {Function} getBreakpoint - Returns breakpoint name for given width
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 * 
 * // Use in components:
 * {isMobile && <MobileNavigation />}
 * {isDesktop && <DesktopNavigation />}
 */
import { useState, useEffect, useCallback } from 'react';
import { useMantineTheme } from '@mantine/core';

export default function useResponsive() {
  const theme = useMantineTheme();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  /**
   * Get breakpoint name for a given width
   * @param {number} width - Viewport width
   * @returns {string} Breakpoint name ('mobile', 'tablet', 'desktop')
   */
  const getBreakpoint = useCallback((width) => {
    if (width < theme.breakpoints.sm) {
      return 'mobile';
    } else if (width < theme.breakpoints.lg) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }, [theme.breakpoints.sm, theme.breakpoints.lg]);

  /**
   * Calculate responsive state based on current window size
   */
  const calculateResponsiveState = useCallback(() => {
    const { width } = windowSize;
    const breakpoint = getBreakpoint(width);
    
    return {
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      breakpoint,
      width: windowSize.width,
      height: windowSize.height,
      getBreakpoint: (w) => getBreakpoint(w),
    };
  }, [windowSize, getBreakpoint]);

  // Handle window resize events
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Update window size state
     */
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Add orientation change listener for mobile devices
    const handleOrientationChange = () => {
      // Use setTimeout to ensure dimensions are updated after orientation change
      setTimeout(handleResize, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return calculateResponsiveState();
}