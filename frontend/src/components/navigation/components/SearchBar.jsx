/**
 * SearchBar - Integrated search functionality with real-time filtering
 * 
 * Features:
 * - Real-time filtering of navigation items
 * - Keyboard shortcuts (Ctrl+K / Cmd+K)
 * - Search history and suggestions
 * - Mobile-optimized search interface
 * - Search results grouped by navigation category
 * 
 * @returns {JSX.Element}
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TextInput, 
  Box, 
  Group, 
  Text, 
  Divider, 
  Kbd, 
  useMantineTheme,
  Paper,
  ScrollArea,
  ActionIcon,
  Badge,
  rem
} from '@mantine/core';
import { Search, X, Clock, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@mantine/hooks';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { searchNavigationItems } from '../utils/navigationUtils';
import { menuGroups } from '../../../data/menuConfig';

export default function SearchBar() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { registerSearchShortcut, registerEscapeShortcut } = useKeyboardShortcuts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 10))); // Keep only last 10
    }
  }, [searchHistory]);

  // Perform search when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchNavigationItems(menuGroups, searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Add search term to history
  const addToSearchHistory = useCallback((term) => {
    if (!term.trim()) return;
    
    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== term);
      // Add to beginning
      return [term, ...filtered].slice(0, 10); // Keep only last 10
    });
  }, []);

  // Handle search submission
  const handleSearch = useCallback((term) => {
    if (!term.trim()) return;
    
    addToSearchHistory(term);
    setSearchTerm('');
    setIsSearchOpen(false);
    
    // In a real app, you would navigate to the first result or show a search results page
    console.log('Search performed:', term);
  }, [addToSearchHistory]);

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.currentTarget.value);
  }, []);

  // Handle search input key down
  const handleSearchKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  }, [searchTerm, handleSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  }, []);

  // Toggle search modal
  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Close search modal
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target) &&
        isSearchOpen
      ) {
        handleCloseSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, handleCloseSearch]);

  // Register keyboard shortcuts
  useEffect(() => {
    const cleanupSearchShortcut = registerSearchShortcut((event) => {
      event.preventDefault();
      handleToggleSearch();
    });

    const cleanupEscapeShortcut = registerEscapeShortcut((event) => {
      if (isSearchOpen) {
        event.preventDefault();
        handleCloseSearch();
      }
    });

    return () => {
      cleanupSearchShortcut();
      cleanupEscapeShortcut();
    };
  }, [registerSearchShortcut, registerEscapeShortcut, handleToggleSearch, handleCloseSearch, isSearchOpen]);

  // Render search results
  const renderSearchResults = () => {
    if (!searchTerm.trim() || searchResults.length === 0) {
      return null;
    }

    return (
      <Paper 
        shadow="md" 
        p="md" 
        mt="xs"
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: rem(400),
          overflow: 'hidden',
        }}
      >
        <ScrollArea h={rem(350)}>
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            {searchResults.reduce((total, group) => total + group.items.length, 0)} resultados encontrados
          </Text>
          
          {searchResults.map((resultGroup, index) => (
            <Box key={index} mb="md">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">
                {resultGroup.group}
              </Text>
              
              {resultGroup.items.map((item, itemIndex) => (
                <Box
                  key={itemIndex}
                  p="xs"
                  mb="xs"
                  style={{
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                    }
                  }}
                  onClick={() => {
                    addToSearchHistory(item.text);
                    handleCloseSearch();
                    // In a real app, you would navigate to the item.path
                    console.log('Navigating to:', item.path);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && console.log('Navigating to:', item.path)}
                  tabIndex={0}
                  role="button"
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap">
                      {item.icon && (
                        <item.icon size={16} />
                      )}
                      <Text size="sm">{item.text}</Text>
                      {item.badge && (
                        <Badge size="xs" variant="filled" color="red">
                          Novo
                        </Badge>
                      )}
                    </Group>
                    <ChevronRight size={16} />
                  </Group>
                  
                  {item.submenu && item.submenu.length > 0 && (
                    <Box pl="xl" mt="xs">
                      {item.submenu.map((subItem, subIndex) => (
                        <Group
                          key={subIndex}
                          gap="xs"
                          wrap="nowrap"
                          p="xs"
                          mb="xs"
                          style={{
                            borderRadius: theme.radius.xs,
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                            cursor: 'pointer',
                            transition: 'background-color 150ms ease',
                            '&:hover': {
                              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToSearchHistory(subItem.text);
                            handleCloseSearch();
                            // In a real app, you would navigate to the subItem.path
                            console.log('Navigating to submenu:', subItem.path);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              console.log('Navigating to submenu:', subItem.path);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                        >
                          {subItem.icon && (
                            <subItem.icon size={14} />
                          )}
                          <Text size="xs">{subItem.text}</Text>
                        </Group>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
              
              {index < searchResults.length - 1 && <Divider my="md" />}
            </Box>
          ))}
        </ScrollArea>
      </Paper>
    );
  };

  // Render search history/suggestions
  const renderSearchSuggestions = () => {
    if (searchTerm.trim() || searchHistory.length === 0) {
      return null;
    }

    return (
      <Paper 
        shadow="md" 
        p="md" 
        mt="xs"
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: rem(300),
          overflow: 'hidden',
        }}
      >
        <ScrollArea h={rem(250)}>
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            Histórico de busca
          </Text>
          
          {searchHistory.slice(0, 5).map((historyItem, index) => (
            <Group
              key={index}
              gap="xs"
              p="xs"
              mb="xs"
              style={{
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
                '&:hover': {
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
                }
              }}
              onClick={() => {
                setSearchTerm(historyItem);
                searchInputRef.current?.focus();
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(historyItem)}
              tabIndex={0}
              role="button"
            >
              <Clock size={14} />
              <Text size="sm">{historyItem}</Text>
            </Group>
          ))}
          
          <Divider my="md" />
          
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            Sugestões
          </Text>
          
          <Group gap="xs">
            {['Clientes', 'Cálculos', 'Documentos', 'Calendário'].map((suggestion, index) => (
              <Badge
                key={index}
                variant="light"
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSearchTerm(suggestion);
                  searchInputRef.current?.focus();
                }}
                onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(suggestion)}
                tabIndex={0}
                role="button"
              >
                {suggestion}
              </Badge>
            ))}
          </Group>
        </ScrollArea>
      </Paper>
    );
  };

  // Mobile search button (when search is not open)
  if (isMobile && !isSearchOpen) {
    return (
      <ActionIcon
        data-testid="mobile-search-button"
        variant="light"
        size="lg"
        onClick={handleToggleSearch}
        aria-label="Abrir busca"
      >
        <Search size={20} />
      </ActionIcon>
    );
  }

  // Desktop search or mobile search when open
  return (
    <Box 
      ref={searchContainerRef}
      style={{ 
        position: 'relative',
        width: isMobile ? '100%' : isSearchOpen ? '100%' : 'auto',
        maxWidth: isSearchOpen ? '100%' : rem(300),
        transition: 'max-width 200ms ease',
      }}
      data-testid="search-bar"
    >
      <Group gap="xs" wrap="nowrap">
        <TextInput
          ref={searchInputRef}
          placeholder="Buscar navegação..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          leftSection={<Search size={16} />}
          rightSection={
            searchTerm ? (
              <ActionIcon
                size="sm"
                variant="transparent"
                onClick={handleClearSearch}
                aria-label="Limpar busca"
              >
                <X size={14} />
              </ActionIcon>
            ) : null
          }
          style={{ flex: 1 }}
          size={isMobile ? 'md' : 'sm'}
          aria-label="Campo de busca"
          aria-expanded={isSearchOpen}
        />
        
        {!isMobile && !isSearchOpen && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
              '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2],
              }
            }}
            onClick={handleToggleSearch}
            onKeyDown={(e) => e.key === 'Enter' && handleToggleSearch()}
            aria-label="Abrir busca"
            role="button"
            tabIndex={0}
          >
            <Search size={16} />
            <Group gap={4}>
              <Kbd size="xs">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
              </Kbd>
              <Text size="xs" c="dimmed">+</Text>
              <Kbd size="xs">K</Kbd>
            </Group>
          </Box>
        )}
        
        {isMobile && isSearchOpen && (
          <ActionIcon
            variant="light"
            size="lg"
            onClick={handleCloseSearch}
            aria-label="Fechar busca"
          >
            <X size={20} />
          </ActionIcon>
        )}
      </Group>
      
      {/* Search results or suggestions */}
      {(isSearchOpen || searchTerm) && (renderSearchResults() || renderSearchSuggestions())}
    </Box>
  );
}