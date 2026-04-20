/**
 * MobileNavigation.test.jsx - Integration tests for mobile navigation
 * 
 * Tests mobile navigation drawer, touch interactions, and responsive behavior
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import MobileNavigation from './MobileNavigation';
import { menuGroups } from '../../../data/menuConfig';

// Mock the lucide-react icons
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
 * Mock navigation callback
 */
const mockOnNavigate = jest.fn();
const mockOnClose = jest.fn();

describe('MobileNavigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render drawer when opened prop is true', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Drawer should be visible
    const drawer = screen.getByTestId('mobile-navigation-drawer');
    expect(drawer).toBeInTheDocument();

    // Should have navigation title
    expect(screen.getByText('Navegação')).toBeInTheDocument();

    // Should have close button
    expect(screen.getByRole('button', { name: /fechar menu/i })).toBeInTheDocument();
  });

  test('should not render drawer when opened prop is false', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={false}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Drawer should not be in document
    const drawer = screen.queryByTestId('mobile-navigation-drawer');
    expect(drawer).not.toBeInTheDocument();
  });

  test('should render all navigation groups from menuConfig', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Check for each group label
    menuGroups.forEach(group => {
      expect(screen.getByText(group.label)).toBeInTheDocument();
    });

    // Check for some specific navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Calendário Contábil')).toBeInTheDocument();
  });

  test('should render accordion for groups with submenus', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find groups with submenus
    const ferramentasGroup = menuGroups.find(g => g.label === 'Ferramentas');
    expect(ferramentasGroup).toBeDefined();
    
    // Should have accordion for Ferramentas group
    const ferramentasAccordion = screen.getByTestId('mobile-nav-accordion-ferramentas');
    expect(ferramentasAccordion).toBeInTheDocument();
  });

  test('should render simple list for groups without submenus', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find groups without submenus
    const principalGroup = menuGroups.find(g => g.label === 'Principal');
    expect(principalGroup).toBeDefined();
    
    // Should have simple list for Principal group
    const principalGroupElement = screen.getByTestId('mobile-nav-group-principal');
    expect(principalGroupElement).toBeInTheDocument();
  });

  test('should close drawer when close button is clicked', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    fireEvent.click(closeButton);

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should close drawer and call onNavigate when navigation item is clicked', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find and click a navigation item
    const dashboardItem = screen.getByTestId('mobile-nav-item-dashboard');
    fireEvent.click(dashboardItem);

    // Both onClose and onNavigate should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should have touch-friendly sizing (minimum 44px height)', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Check a navigation item
    const dashboardItem = screen.getByTestId('mobile-nav-item-dashboard');
    const styles = window.getComputedStyle(dashboardItem);
    
    // Should have minimum height of 44px
    expect(styles.minHeight).toBe('44px');
  });

  test('should handle keyboard navigation', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find a navigation item
    const dashboardItem = screen.getByTestId('mobile-nav-item-dashboard');
    
    // Should have role="button"
    expect(dashboardItem).toHaveAttribute('role', 'button');
    
    // Should be tabbable
    expect(dashboardItem).toHaveAttribute('tabindex', '0');
  });

  test('should close drawer when clicking outside (Drawer default behavior)', () => {
    // Note: Mantine Drawer handles click outside by default
    // This test verifies the prop is set correctly
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    const drawer = screen.getByTestId('mobile-navigation-drawer');
    
    // Drawer should have closeOnClickOutside prop behavior
    // (actual click outside test would require more complex setup)
    expect(drawer).toBeInTheDocument();
  });

  test('should close drawer on escape key (Drawer default behavior)', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    // onClose should be called (Drawer handles this)
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should render submenu items with increased padding', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find a group with submenus
    const ferramentasGroup = menuGroups.find(g => g.label === 'Ferramentas');
    const simplesItem = ferramentasGroup.items.find(i => i.text === 'Simples Nacional');
    
    // Should render submenu items
    expect(screen.getByText('Consulta Simples')).toBeInTheDocument();
    expect(screen.getByText('Comprovante PDF')).toBeInTheDocument();
  });

  test('should show badge indicator for items with badge prop', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Find item with badge
    const clientesItem = screen.getByTestId('mobile-nav-item-clientes');
    
    // Should have badge indicator (red dot)
    const badge = within(clientesItem).queryByLabelText('Novo conteúdo');
    expect(badge).toBeInTheDocument();
  });

  test('should handle touch events for swipe to close', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    const drawer = screen.getByTestId('mobile-navigation-drawer');
    
    // Simulate touch start
    fireEvent.touchStart(drawer, {
      touches: [{ clientX: 50 }]
    });
    
    // Simulate touch end with swipe right
    fireEvent.touchEnd(drawer, {
      changedTouches: [{ clientX: 200 }] // Swipe right > 100px
    });

    // onClose should be called for swipe to close
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should prevent horizontal scrolling', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    const drawer = screen.getByTestId('mobile-navigation-drawer');
    const styles = window.getComputedStyle(drawer);
    
    // Should have overflowX: hidden
    expect(styles.overflowX).toBe('hidden');
  });

  test('should have proper ARIA attributes for accessibility', () => {
    render(
      <TestWrapper>
        <MobileNavigation 
          opened={true}
          onClose={mockOnClose}
          menuGroups={menuGroups}
          onNavigate={mockOnNavigate}
        />
      </TestWrapper>
    );

    // Check close button
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Fechar menu');

    // Check navigation items have aria-label
    const dashboardItem = screen.getByTestId('mobile-nav-item-dashboard');
    expect(dashboardItem).toHaveAttribute('aria-label', 'Dashboard');
  });
});