import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { menuGroups } from '../../../data/menuConfig';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn();
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useMediaQuery: (query) => mockUseMediaQuery(query),
}));

// Mock keyboard shortcuts
const mockRegisterSearchShortcut = jest.fn();
const mockRegisterEscapeShortcut = jest.fn();
jest.mock('../hooks/useKeyboardShortcuts', () => ({
  __esModule: true,
  default: () => ({
    registerSearchShortcut: mockRegisterSearchShortcut,
    registerEscapeShortcut: mockRegisterEscapeShortcut,
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

describe('SearchBar', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false); // Default to desktop
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockRegisterSearchShortcut.mockClear();
    mockRegisterEscapeShortcut.mockClear();
    
    // Mock cleanup functions
    mockRegisterSearchShortcut.mockReturnValue(() => {});
    mockRegisterEscapeShortcut.mockReturnValue(() => {});
  });

  test('renders without crashing', () => {
    renderWithProviders(<SearchBar />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  test('displays search input with placeholder', () => {
    renderWithProviders(<SearchBar />);
    expect(screen.getByPlaceholderText('Buscar navegação...')).toBeInTheDocument();
  });

  test('shows keyboard shortcut hint on desktop', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    renderWithProviders(<SearchBar />);
    
    // Should show Ctrl+K or Cmd+K hint
    const shortcutHint = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'kbd' && (content === 'Ctrl' || content === '⌘' || content === 'K');
    });
    expect(shortcutHint).toBeInTheDocument();
  });

  test('shows mobile search button when on mobile and search not open', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile
    renderWithProviders(<SearchBar />);
    
    expect(screen.getByTestId('mobile-search-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Abrir busca')).toBeInTheDocument();
  });

  test('opens search modal when mobile search button is clicked', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile
    renderWithProviders(<SearchBar />);
    
    const searchButton = screen.getByTestId('mobile-search-button');
    fireEvent.click(searchButton);
    
    // Should now show search input
    expect(screen.getByPlaceholderText('Buscar navegação...')).toBeInTheDocument();
  });

  test('registers keyboard shortcuts on mount', () => {
    renderWithProviders(<SearchBar />);
    
    expect(mockRegisterSearchShortcut).toHaveBeenCalledTimes(1);
    expect(mockRegisterEscapeShortcut).toHaveBeenCalledTimes(1);
  });

  test('filters navigation items in real-time', async () => {
    renderWithProviders(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'Clientes' } });
    
    // Should show search results
    await waitFor(() => {
      // Check if any search results are shown
      const resultsText = screen.queryByText((content, element) => {
        return element.textContent.includes('resultados encontrados');
      });
      expect(resultsText).toBeInTheDocument();
    });
    
    // Should show the matching item
    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  test('shows search history when available', async () => {
    // Mock search history in localStorage
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['Clientes', 'Cálculos']));
    
    renderWithProviders(<SearchBar />);
    
    // Click on search input to show suggestions
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    fireEvent.focus(searchInput);
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Histórico de busca')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Cálculos')).toBeInTheDocument();
  });

  test('shows search suggestions', async () => {
    renderWithProviders(<SearchBar />);
    
    // Click on search input to show suggestions
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    fireEvent.focus(searchInput);
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Sugestões')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Cálculos')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Calendário')).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', () => {
    renderWithProviders(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Should show clear button
    const clearButton = screen.getByLabelText('Limpar busca');
    fireEvent.click(clearButton);
    
    // Search input should be cleared
    expect(searchInput.value).toBe('');
  });

  test('groups search results by category', async () => {
    renderWithProviders(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    
    // Type search term that matches items in different groups
    fireEvent.change(searchInput, { target: { value: 'Simples' } });
    
    await waitFor(() => {
      // Should show results grouped by category
      expect(screen.getByText('Ferramentas')).toBeInTheDocument();
    });
  });

  test('handles submenu items in search results', async () => {
    renderWithProviders(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    
    // Type search term that matches a submenu item
    fireEvent.change(searchInput, { target: { value: 'Consulta' } });
    
    await waitFor(() => {
      // Should show both main items and submenu items
      expect(screen.getByText('Consulta Simples')).toBeInTheDocument();
    });
  });

  test('adds search term to history when searching', () => {
    // Mock empty search history
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithProviders(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    
    // Type search term and press Enter
    fireEvent.change(searchInput, { target: { value: 'Test Search' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    
    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'searchHistory',
      JSON.stringify(['Test Search'])
    );
  });

  test('closes search when Escape key is pressed', () => {
    // Mock the escape shortcut callback
    let escapeCallback;
    mockRegisterEscapeShortcut.mockImplementation((callback) => {
      escapeCallback = callback;
      return () => {};
    });
    
    // Set mobile mode
    mockUseMediaQuery.mockReturnValue(true);
    
    renderWithProviders(<SearchBar />);
    
    // Open search (on mobile)
    const searchButton = screen.getByTestId('mobile-search-button');
    fireEvent.click(searchButton);
    
    // Trigger escape callback
    act(() => {
      escapeCallback({ preventDefault: jest.fn() });
    });
    
    // Search should be closed (mobile button should be visible again)
    expect(screen.getByTestId('mobile-search-button')).toBeInTheDocument();
  });

  test('handles click outside to close search', async () => {
    renderWithProviders(<SearchBar />);
    
    // Open search by focusing input (triggers suggestions)
    const searchInput = screen.getByPlaceholderText('Buscar navegação...');
    fireEvent.focus(searchInput);
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Sugestões')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Suggestions should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Sugestões')).not.toBeInTheDocument();
    });
  });
});