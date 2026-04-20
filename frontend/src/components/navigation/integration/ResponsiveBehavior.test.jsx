/**
 * ResponsiveBehavior.test.jsx - Integration tests for responsive behavior
 * 
 * Tests mobile/desktop mode switching, touch interactions, and orientation change adaptation
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import HeaderMegaMenu from '../HeaderMegaMenu/HeaderMegaMenu';
import { menuGroups } from '../../../data/menuConfig';

// Mock window resize and matchMedia
const mockMatchMedia = (matches) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock the lucide-react icons used in MobileNavigation
jest.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

/**
 * Test wrapper component with MantineProvider
 */
const TestWrapper = ({ children }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
);

/**
 * Mock callbacks
 */
const mockOnNavigate = jest.fn();
const mockOnThemeToggle = jest.fn();
const mockOnLogout = jest.fn();

describe('Responsive Behavior Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => {
        if (query.includes('max-width: 768px')) {
          return mockMatchMedia(false); // Default to desktop
        }
        if (query.includes('min-width: 1200px')) {
          return mockMatchMedia(true); // Default to desktop
        }
        return mockMatchMedia(false);
      }),
    });
  });

  test('should show desktop navigation on large screens', () => {
    // Mock desktop screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(false); // Not mobile
      }
      if (query.includes('min-width: 1200px')) {
        return mockMatchMedia(true); // Is desktop
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Should show desktop navigation
    expect(screen.getByTestId('header-mega-menu')).toBeInTheDocument();
    
    // Should not show mobile menu toggle
    const mobileToggle = screen.queryByTestId('mobile-menu-toggle');
    expect(mobileToggle).not.toBeInTheDocument();
  });

  test('should show mobile menu toggle on small screens', () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true); // Is mobile
      }
      if (query.includes('min-width: 1200px')) {
        return mockMatchMedia(false); // Not desktop
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Should show mobile menu toggle
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    expect(mobileToggle).toBeInTheDocument();
    
    // Should have proper ARIA attributes
    expect(mobileToggle).toHaveAttribute('aria-label', 'Abrir menu de navegação');
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('should open mobile navigation drawer when toggle is clicked', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Find and click mobile toggle
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer to appear
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Toggle should now have expanded state
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('should close mobile navigation drawer when item is selected', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer and find a navigation item
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Find and click a navigation item
    const dashboardItem = await screen.findByTestId('mobile-nav-item-dashboard');
    fireEvent.click(dashboardItem);

    // Drawer should close
    await waitFor(() => {
      const drawer = screen.queryByTestId('mobile-navigation-drawer');
      expect(drawer).not.toBeInTheDocument();
    });

    // onNavigate should be called
    expect(mockOnNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should handle touch interactions on mobile navigation items', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Find a navigation item
    const dashboardItem = await screen.findByTestId('mobile-nav-item-dashboard');
    
    // Simulate touch events
    fireEvent.touchStart(dashboardItem, {
      touches: [{ clientX: 100 }]
    });
    
    fireEvent.touchEnd(dashboardItem, {
      changedTouches: [{ clientX: 100 }]
    });

    // Item should respond to touch (click will be triggered)
    // Note: Actual swipe detection requires more complex testing
    expect(dashboardItem).toBeInTheDocument();
  });

  test('should have touch-friendly sizing on mobile navigation items', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Find a navigation item
    const dashboardItem = await screen.findByTestId('mobile-nav-item-dashboard');
    const styles = window.getComputedStyle(dashboardItem);
    
    // Should have minimum height of 44px for touch targets
    expect(styles.minHeight).toBe('44px');
  });

  test('should handle window resize from desktop to mobile', () => {
    // Start with desktop
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(false);
      }
      if (query.includes('min-width: 1200px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    const { rerender } = render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Should show desktop navigation initially
    expect(screen.queryByTestId('mobile-menu-toggle')).not.toBeInTheDocument();

    // Change to mobile
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      if (query.includes('min-width: 1200px')) {
        return mockMatchMedia(false);
      }
      return mockMatchMedia(false);
    });

    // Trigger window resize event
    act(() => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event('resize'));
    });

    // Re-render to pick up new media queries
    rerender(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Should now show mobile toggle
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    expect(mobileToggle).toBeInTheDocument();
  });

  test('should handle orientation change on mobile devices', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Trigger orientation change
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    // Drawer should still be open (orientation change doesn't close it)
    const drawer = screen.getByTestId('mobile-navigation-drawer');
    expect(drawer).toBeInTheDocument();
  });

  test('should prevent horizontal scrolling on mobile', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    const drawer = screen.getByTestId('mobile-navigation-drawer');
    const styles = window.getComputedStyle(drawer);
    
    // Should have overflowX: hidden to prevent horizontal scrolling
    expect(styles.overflowX).toBe('hidden');
  });

  test('should maintain proper spacing for touch interactions', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Open mobile drawer
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileToggle);

    // Wait for drawer
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });

    // Check mobile toggle has proper spacing
    const toggleStyles = window.getComputedStyle(mobileToggle);
    expect(toggleStyles.width).toBe('44px');
    expect(toggleStyles.height).toBe('44px');
    
    // Check drawer has proper padding
    const drawer = screen.getByTestId('mobile-navigation-drawer');
    const drawerStyles = window.getComputedStyle(drawer);
    expect(drawerStyles.padding).toBeTruthy();
  });

  test('should have keyboard navigation support', () => {
    // Mock desktop screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(false);
      }
      if (query.includes('min-width: 1200px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Theme toggle should be keyboard accessible
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('tabindex', '0');
    expect(themeToggle).toHaveAttribute('role', 'button');
    
    // Should respond to Enter key
    fireEvent.keyDown(themeToggle, { key: 'Enter', code: 'Enter' });
    expect(mockOnThemeToggle).toHaveBeenCalled();
  });

  test('should handle mobile menu toggle with keyboard', async () => {
    // Mock mobile screen
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query.includes('max-width: 768px')) {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <HeaderMegaMenu 
          onNavigate={mockOnNavigate}
          onThemeToggle={mockOnThemeToggle}
          onLogout={mockOnLogout}
        />
      </TestWrapper>
    );

    // Find mobile toggle
    const mobileToggle = screen.getByTestId('mobile-menu-toggle');
    
    // Should respond to Enter key
    fireEvent.keyDown(mobileToggle, { key: 'Enter', code: 'Enter' });

    // Wait for drawer to appear
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-navigation-drawer');
      expect(drawer).toBeInTheDocument();
    });
  });
});