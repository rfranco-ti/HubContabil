import { render, screen } from '@testing-library/react';
import HeaderMegaMenu from './HeaderMegaMenu';

// Simple mock for Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(() => false),
}));

// Mock for Mantine core
jest.mock('@mantine/core', () => ({
  Header: ({ children, ...props }) => <div data-testid="mantine-header" {...props}>{children}</div>,
  Container: ({ children, ...props }) => <div data-testid="mantine-container" {...props}>{children}</div>,
  Group: ({ children, ...props }) => <div data-testid="mantine-group" {...props}>{children}</div>,
  Box: ({ children, ...props }) => <div data-testid="mantine-box" {...props}>{children}</div>,
  useMantineTheme: () => ({
    breakpoints: { sm: '768px', lg: '1200px' },
    colorScheme: 'light',
    colors: {
      dark: ['#000', '#111', '#222', '#333', '#444', '#555', '#666', '#777', '#888', '#999'],
      gray: ['#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0', '#909090', '#808080', '#707070', '#606060'],
      blue: ['#0000ff'],
      white: '#ffffff',
    },
    fontSizes: { lg: '18px' },
    radius: { md: '8px' },
    shadows: { md: '0 4px 6px rgba(0,0,0,0.1)' },
    spacing: { md: '16px' },
  }),
  useMantineColorScheme: () => ({
    colorScheme: 'light',
    toggleColorScheme: jest.fn(),
  }),
}));

// Mock DesktopNavigation
jest.mock('./DesktopNavigation', () => ({
  __esModule: true,
  default: () => <div data-testid="desktop-navigation">DesktopNavigation</div>,
}));

// Mock menuConfig
jest.mock('../../../data/menuConfig', () => ({
  menuGroups: [
    { label: 'Principal', items: [{ text: 'Dashboard', path: '/dashboard' }] },
  ],
}));

describe('HeaderMegaMenu - Basic Tests', () => {
  test('renders without crashing', () => {
    render(<HeaderMegaMenu />);
    expect(screen.getByTestId('header-mega-menu')).toBeInTheDocument();
  });

  test('displays logo', () => {
    render(<HeaderMegaMenu />);
    expect(screen.getByText('HubContábil')).toBeInTheDocument();
  });

  test('renders desktop navigation when not mobile', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query.includes('max-width')) return false; // Not mobile
      return false;
    });
    
    render(<HeaderMegaMenu />);
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });

  test('renders theme toggle button', () => {
    render(<HeaderMegaMenu />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('has proper ARIA attributes', () => {
    render(<HeaderMegaMenu />);
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('aria-label');
    expect(themeToggle).toHaveAttribute('role', 'button');
    expect(themeToggle).toHaveAttribute('tabIndex', '0');
  });
});