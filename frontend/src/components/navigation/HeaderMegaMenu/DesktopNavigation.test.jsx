import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import DesktopNavigation from './DesktopNavigation';
import { menuGroups } from '../../../data/menuConfig';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <MantineProvider>
        {component}
      </MantineProvider>
    </BrowserRouter>
  );
};

describe('DesktopNavigation', () => {
  test('renders without crashing', () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });

  test('renders all menu groups', () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    menuGroups.forEach((group, index) => {
      const navGroup = screen.getByTestId(`nav-group-${index}`);
      expect(navGroup).toBeInTheDocument();
      expect(navGroup).toHaveTextContent(group.label);
    });
  });

  test('has proper ARIA attributes for accessibility', () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    expect(firstNavGroup).toHaveAttribute('aria-haspopup', 'true');
    expect(firstNavGroup).toHaveAttribute('aria-expanded', 'false');
    expect(firstNavGroup).toHaveAttribute('aria-controls', 'mega-menu-0');
    expect(firstNavGroup).toHaveAttribute('role', 'button');
    expect(firstNavGroup).toHaveAttribute('tabIndex', '0');
  });

  test('opens mega menu on hover with delay', async () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Hover over the menu
    fireEvent.mouseEnter(firstNavGroup);
    
    // Wait for the delay (150ms)
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  test('closes mega menu on mouse leave with delay', async () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Open menu
    fireEvent.mouseEnter(firstNavGroup);
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    }, { timeout: 200 });
    
    // Close menu
    fireEvent.mouseLeave(firstNavGroup);
    
    // Wait for the delay (200ms)
    await waitFor(() => {
      expect(screen.queryByTestId('mega-menu-0')).not.toBeInTheDocument();
    }, { timeout: 300 });
  });

  test('keyboard navigation with Arrow keys', async () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    const secondNavGroup = screen.getByTestId('nav-group-1');
    
    // Focus first menu
    fireEvent.focus(firstNavGroup);
    
    // Test ArrowRight to navigate to next menu
    fireEvent.keyDown(firstNavGroup, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-1')).toBeInTheDocument();
    });
    
    // Test ArrowLeft to navigate to previous menu
    fireEvent.keyDown(secondNavGroup, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    });
  });

  test('keyboard navigation with Enter and Escape', async () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Test Enter to open menu
    fireEvent.keyDown(firstNavGroup, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    });
    
    // Test Escape to close menu
    fireEvent.keyDown(firstNavGroup, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('mega-menu-0')).not.toBeInTheDocument();
    });
  });

  test('keyboard navigation within mega menu', async () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Open menu
    fireEvent.keyDown(firstNavGroup, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    });
    
    // Test ArrowDown to focus first item
    fireEvent.keyDown(firstNavGroup, { key: 'ArrowDown' });
    
    // The first item should be focused
    const firstItem = screen.getByTestId('nav-item-0-0');
    expect(document.activeElement).toBe(firstItem);
    
    // Test ArrowUp to focus last item (would need more complex test for circular navigation)
  });

  test('clicking navigation item navigates to correct path', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
    
    // Re-import with mock
    jest.isolateModules(() => {
      const { render, screen, fireEvent } = require('@testing-library/react');
      const { MantineProvider } = require('@mantine/core');
      const { BrowserRouter } = require('react-router-dom');
      const DesktopNavigation = require('./DesktopNavigation').default;
      
      render(
        <BrowserRouter>
          <MantineProvider>
            <DesktopNavigation menuGroups={menuGroups} />
          </MantineProvider>
        </BrowserRouter>
      );
      
      // Open menu
      const firstNavGroup = screen.getByTestId('nav-group-0');
      fireEvent.click(firstNavGroup);
      
      // Click first item
      const firstItem = screen.getByTestId('nav-item-0-0');
      fireEvent.click(firstItem);
      
      // Should navigate to dashboard path
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('renders submenu items when present', () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    // Open a menu group that has submenus (Ferramentas group has submenus)
    const ferramentasGroup = screen.getByTestId('nav-group-1');
    fireEvent.click(ferramentasGroup);
    
    // Check for submenu items
    const simplesNacionalItem = screen.getByTestId('nav-item-1-2'); // Simples Nacional has submenu
    expect(simplesNacionalItem).toBeInTheDocument();
    
    // Check that submenu items are rendered
    const submenuItem = screen.getByTestId('submenu-item-1-2-0');
    expect(submenuItem).toBeInTheDocument();
    expect(submenuItem).toHaveTextContent('Consulta Simples');
  });

  test('has visible focus indicators for keyboard navigation', () => {
    renderWithProviders(<DesktopNavigation menuGroups={menuGroups} />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Focus should show outline
    fireEvent.focus(firstNavGroup);
    expect(firstNavGroup).toHaveStyle('outline: 2px solid');
  });

  test('handles empty menu groups gracefully', () => {
    renderWithProviders(<DesktopNavigation menuGroups={[]} />);
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });
});