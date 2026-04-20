import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import HeaderMegaMenu from './HeaderMegaMenu';
import { menuGroups } from '../../../data/menuConfig';

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn();
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useMediaQuery: (query) => mockUseMediaQuery(query),
}));

// Mock useMantineColorScheme
const mockToggleColorScheme = jest.fn();
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  useMantineColorScheme: () => ({
    colorScheme: 'light',
    toggleColorScheme: mockToggleColorScheme,
  }),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <MantineProvider>
        {component}
      </MantineProvider>
    </BrowserRouter>
  );
};

describe('HeaderMegaMenu', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false); // Default to desktop
    mockToggleColorScheme.mockClear();
  });

  test('renders without crashing', () => {
    renderWithProviders(<HeaderMegaMenu />);
    expect(screen.getByTestId('header-mega-menu')).toBeInTheDocument();
  });

  test('displays logo', () => {
    renderWithProviders(<HeaderMegaMenu />);
    expect(screen.getByText('HubContábil')).toBeInTheDocument();
  });

  test('renders desktop navigation when not mobile', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    renderWithProviders(<HeaderMegaMenu />);
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });

  test('renders mobile menu toggle when mobile', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query.includes('max-width')) return true; // Mobile
      return false;
    });
    
    renderWithProviders(<HeaderMegaMenu />);
    expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    expect(screen.getByLabelText('Abrir menu de navegação')).toBeInTheDocument();
  });

  test('renders theme toggle button', () => {
    renderWithProviders(<HeaderMegaMenu />);
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).toHaveAttribute('aria-label', 'Alternar para modo escuro');
  });

  test('theme toggle calls onThemeToggle prop when provided', () => {
    const mockOnThemeToggle = jest.fn();
    renderWithProviders(<HeaderMegaMenu onThemeToggle={mockOnThemeToggle} />);
    
    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);
    
    expect(mockOnThemeToggle).toHaveBeenCalled();
    expect(mockToggleColorScheme).not.toHaveBeenCalled();
  });

  test('theme toggle calls toggleColorScheme when onThemeToggle not provided', () => {
    renderWithProviders(<HeaderMegaMenu />);
    
    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);
    
    expect(mockToggleColorScheme).toHaveBeenCalled();
  });

  test('has proper ARIA labels for interactive elements', () => {
    renderWithProviders(<HeaderMegaMenu />);
    
    // Check theme toggle ARIA label
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('aria-label');
    expect(themeToggle).toHaveAttribute('role', 'button');
    expect(themeToggle).toHaveAttribute('tabIndex', '0');
  });

  test('accepts user prop', () => {
    const mockUser = {
      id: '1',
      nome: 'Test User',
      email: 'test@example.com',
      cargo: 'Developer',
      isAdmin: false,
      preferences: {
        theme: 'light',
        notificationsEnabled: true,
      },
    };
    
    renderWithProviders(<HeaderMegaMenu user={mockUser} />);
    expect(screen.getByTestId('header-mega-menu')).toBeInTheDocument();
  });

  test('accepts notifications prop', () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        timestamp: new Date(),
        read: false,
      },
    ];
    
    renderWithProviders(<HeaderMegaMenu notifications={mockNotifications} />);
    expect(screen.getByTestId('header-mega-menu')).toBeInTheDocument();
  });

  test('desktop navigation renders menu groups from menuConfig', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    renderWithProviders(<HeaderMegaMenu />);
    
    // Check that menu groups are rendered
    menuGroups.forEach((group, index) => {
      const navGroup = screen.getByTestId(`nav-group-${index}`);
      expect(navGroup).toBeInTheDocument();
      expect(navGroup).toHaveTextContent(group.label);
    });
  });

  test('desktop navigation has proper ARIA attributes', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    renderWithProviders(<HeaderMegaMenu />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    expect(firstNavGroup).toHaveAttribute('aria-haspopup', 'true');
    expect(firstNavGroup).toHaveAttribute('aria-expanded', 'false');
    expect(firstNavGroup).toHaveAttribute('aria-controls');
  });

  test('keyboard navigation works on desktop navigation', async () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    renderWithProviders(<HeaderMegaMenu />);
    
    const firstNavGroup = screen.getByTestId('nav-group-0');
    
    // Test Enter key to open menu
    fireEvent.keyDown(firstNavGroup, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByTestId('mega-menu-0')).toBeInTheDocument();
    });
    
    // Test Escape key to close menu
    fireEvent.keyDown(firstNavGroup, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('mega-menu-0')).not.toBeInTheDocument();
    });
  });

  test('responsive breakpoint detection works', () => {
    // Test desktop
    mockUseMediaQuery.mockReturnValue(false);
    const { rerender } = renderWithProviders(<HeaderMegaMenu />);
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu-toggle')).not.toBeInTheDocument();
    
    // Test mobile
    mockUseMediaQuery.mockImplementation(query => {
      if (query.includes('max-width')) return true;
      return false;
    });
    
    rerender(
      <BrowserRouter>
        <MantineProvider>
          <HeaderMegaMenu />
        </MantineProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-navigation')).not.toBeInTheDocument();
  });
});