import { 
  filterNavigationItems, 
  getFlattenedItems, 
  searchNavigationItems 
} from './navigationUtils';

// Mock menu groups data similar to menuConfig.js
const mockMenuGroups = [
  {
    label: "Principal",
    items: [
      { text: "Dashboard", path: "/dashboard" },
      { text: "Clientes", path: "/clientes", badge: true },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { text: "Cálculos", path: "/calculos" },
      { 
        text: "Simples Nacional", 
        path: "/ferramentas/simples",
        submenu: [
          { text: "Consulta Simples", path: "/ferramentas/simples/consulta" },
          { text: "Comprovante PDF", path: "/ferramentas/simples/comprovante" },
        ]
      },
    ],
  },
];

describe('navigationUtils', () => {
  describe('filterNavigationItems', () => {
    test('returns all items when search term is empty', () => {
      const result = filterNavigationItems(mockMenuGroups, '');
      expect(result).toEqual(mockMenuGroups);
    });

    test('returns all items when search term is null or undefined', () => {
      expect(filterNavigationItems(mockMenuGroups, null)).toEqual(mockMenuGroups);
      expect(filterNavigationItems(mockMenuGroups, undefined)).toEqual(mockMenuGroups);
    });

    test('filters items by search term (case insensitive)', () => {
      const result = filterNavigationItems(mockMenuGroups, 'clientes');
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Principal');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Clientes');
    });

    test('filters submenu items by search term', () => {
      const result = filterNavigationItems(mockMenuGroups, 'consulta');
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Ferramentas');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Simples Nacional');
      expect(result[0].items[0].submenu).toHaveLength(1);
      expect(result[0].items[0].submenu[0].text).toBe('Consulta Simples');
    });

    test('returns empty array when no items match', () => {
      const result = filterNavigationItems(mockMenuGroups, 'xyz123');
      expect(result).toEqual([]);
    });

    test('handles items with matching main text and submenu', () => {
      const result = filterNavigationItems(mockMenuGroups, 'simples');
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Ferramentas');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Simples Nacional');
      // Should include both submenu items since main item matches
      expect(result[0].items[0].submenu).toHaveLength(2);
    });

    test('trims search term', () => {
      const result = filterNavigationItems(mockMenuGroups, '  clientes  ');
      expect(result).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Clientes');
    });
  });

  describe('getFlattenedItems', () => {
    test('returns empty array for empty input', () => {
      expect(getFlattenedItems([])).toEqual([]);
      expect(getFlattenedItems(null)).toEqual([]);
      expect(getFlattenedItems(undefined)).toEqual([]);
    });

    test('flattens navigation items including submenus', () => {
      const result = getFlattenedItems(mockMenuGroups);
      
      // Should have 6 items: 2 from Principal, 2 from Ferramentas (Cálculos, Simples Nacional), 
      // and 2 submenu items from Simples Nacional
      expect(result).toHaveLength(6);
      
      // Check specific items
      const texts = result.map(item => item.text);
      expect(texts).toContain('Dashboard');
      expect(texts).toContain('Clientes');
      expect(texts).toContain('Cálculos');
      expect(texts).toContain('Simples Nacional');
      expect(texts).toContain('Consulta Simples');
      expect(texts).toContain('Comprovante PDF');
    });

    test('preserves item properties', () => {
      const result = getFlattenedItems(mockMenuGroups);
      
      const clientesItem = result.find(item => item.text === 'Clientes');
      expect(clientesItem).toBeDefined();
      expect(clientesItem.path).toBe('/clientes');
      expect(clientesItem.badge).toBe(true);
    });
  });

  describe('searchNavigationItems', () => {
    test('returns empty array when search term is empty', () => {
      const result = searchNavigationItems(mockMenuGroups, '');
      expect(result).toEqual([]);
    });

    test('returns empty array when search term is null or undefined', () => {
      expect(searchNavigationItems(mockMenuGroups, null)).toEqual([]);
      expect(searchNavigationItems(mockMenuGroups, undefined)).toEqual([]);
    });

    test('returns search results grouped by category', () => {
      const result = searchNavigationItems(mockMenuGroups, 'clientes');
      
      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('Principal');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Clientes');
    });

    test('includes only matching submenu items in results', () => {
      const result = searchNavigationItems(mockMenuGroups, 'consulta');
      
      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('Ferramentas');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Simples Nacional');
      expect(result[0].items[0].submenu).toHaveLength(1);
      expect(result[0].items[0].submenu[0].text).toBe('Consulta Simples');
    });

    test('includes main item when it matches, with all submenu items', () => {
      const result = searchNavigationItems(mockMenuGroups, 'simples');
      
      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('Ferramentas');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Simples Nacional');
      // Should include both submenu items since main item matches
      expect(result[0].items[0].submenu).toHaveLength(2);
    });

    test('handles multiple matching items across groups', () => {
      // Add another item with "simples" in a different group
      const extendedGroups = [
        ...mockMenuGroups,
        {
          label: "Outros",
          items: [
            { text: "Guia Simples", path: "/guia-simples" },
          ],
        },
      ];
      
      const result = searchNavigationItems(extendedGroups, 'simples');
      
      expect(result).toHaveLength(2);
      expect(result[0].group).toBe('Ferramentas');
      expect(result[1].group).toBe('Outros');
    });

    test('returns empty array when no matches found', () => {
      const result = searchNavigationItems(mockMenuGroups, 'xyz123');
      expect(result).toEqual([]);
    });

    test('is case insensitive', () => {
      const result = searchNavigationItems(mockMenuGroups, 'CLIENTES');
      expect(result).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Clientes');
    });

    test('trims search term', () => {
      const result = searchNavigationItems(mockMenuGroups, '  clientes  ');
      expect(result).toHaveLength(1);
      expect(result[0].items[0].text).toBe('Clientes');
    });
  });
});