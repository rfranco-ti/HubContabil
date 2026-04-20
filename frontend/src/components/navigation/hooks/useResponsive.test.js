/**
 * useResponsive.test.js - Tests for useResponsive hook
 * 
 * Tests viewport detection, breakpoint calculation, and event listeners
 * 
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import useResponsive from './useResponsive';

// Mock window object for testing
const mockWindow = {
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Setup before each test
beforeEach(() => {
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
  });
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Test wrapper component with MantineProvider
 */
const TestWrapper = ({ children }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
);

describe('useResponsive Hook', () => {
  test('should return correct initial state for desktop', () => {
    // Setup desktop viewport
    window.innerWidth = 1200;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: 'desktop',
      width: 1200,
      height: 800,
      getBreakpoint: expect.any(Function),
    });
  });

  test('should return correct state for tablet', () => {
    // Setup tablet viewport
    window.innerWidth = 900;
    window.innerHeight = 600;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.width).toBe(900);
    expect(result.current.height).toBe(600);
  });

  test('should return correct state for mobile', () => {
    // Setup mobile viewport
    window.innerWidth = 375;
    window.innerHeight = 667;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  test('getBreakpoint function should return correct breakpoint names', () => {
    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(result.current.getBreakpoint(300)).toBe('mobile');
    expect(result.current.getBreakpoint(700)).toBe('mobile');
    expect(result.current.getBreakpoint(800)).toBe('tablet');
    expect(result.current.getBreakpoint(1000)).toBe('tablet');
    expect(result.current.getBreakpoint(1200)).toBe('desktop');
    expect(result.current.getBreakpoint(1920)).toBe('desktop');
  });

  test('should add resize event listener on mount', () => {
    renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  test('should add orientationchange event listener on mount', () => {
    renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    expect(window.addEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
  });

  test('should update state on window resize', () => {
    // Initial desktop state
    window.innerWidth = 1200;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    // Verify initial state
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.width).toBe(1200);

    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      // Trigger resize event
      const resizeHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )[1];
      resizeHandler();
    });

    // State should be updated
    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  test('should handle orientation change on mobile devices', () => {
    // Initial portrait mode
    window.innerWidth = 375;
    window.innerHeight = 667;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    // Verify initial state
    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(375);

    // Simulate orientation change to landscape
    act(() => {
      window.innerWidth = 667;
      window.innerHeight = 375;
      // Trigger orientationchange event
      const orientationHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'orientationchange'
      )[1];
      orientationHandler();
    });

    // State should be updated after timeout
    setTimeout(() => {
      expect(result.current.width).toBe(667);
      expect(result.current.height).toBe(375);
    }, 150);
  });

  test('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
  });

  test('should handle server-side rendering (no window object)', () => {
    // Temporarily remove window object
    const originalWindow = global.window;
    delete global.window;

    const { result } = renderHook(() => useResponsive(), {
      wrapper: TestWrapper,
    });

    // Should return default desktop values
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(800);

    // Restore window object
    global.window = originalWindow;
  });
});