/**
 * useResponsive.simple.test.js - Simplified tests for useResponsive hook
 * 
 * Tests core functionality without Mantine dependencies
 * 
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
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
  
  // Mock theme breakpoints (Mantine defaults)
  global.theme = {
    breakpoints: {
      sm: 768,
      lg: 1200,
    }
  };
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

describe('useResponsive Hook (Simplified)', () => {
  test('should return correct initial state for desktop', () => {
    // Setup desktop viewport
    window.innerWidth = 1200;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive());

    // Check core properties
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(800);
    expect(typeof result.current.getBreakpoint).toBe('function');
  });

  test('should return correct state for mobile', () => {
    // Setup mobile viewport
    window.innerWidth = 375;
    window.innerHeight = 667;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  test('getBreakpoint function should work', () => {
    const { result } = renderHook(() => useResponsive());

    // Test breakpoint detection
    expect(result.current.getBreakpoint(300)).toBe('mobile');
    expect(result.current.getBreakpoint(800)).toBe('tablet');
    expect(result.current.getBreakpoint(1200)).toBe('desktop');
  });

  test('should add resize event listener on mount', () => {
    renderHook(() => useResponsive());

    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  test('should add orientationchange event listener on mount', () => {
    renderHook(() => useResponsive());

    expect(window.addEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
  });

  test('should update state on window resize', () => {
    // Initial desktop state
    window.innerWidth = 1200;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive());

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

  test('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useResponsive());

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
});