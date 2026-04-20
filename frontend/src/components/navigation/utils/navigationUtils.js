/**
 * Navigation utilities for menuConfig.js processing
 * 
 * @typedef {import('../types/navigationTypes').NavigationItem} NavigationItem
 * @typedef {import('../types/navigationTypes').NavigationGroup} NavigationGroup
 */

/**
 * Process menu configuration for navigation
 * @param {NavigationGroup[]} menuConfig - Original menu configuration
 * @returns {NavigationGroup[]} Processed navigation groups
 */
export function processMenuConfig(menuConfig) {
  // Implementation will be added in Task 7.1
  return menuConfig || [];
}

/**
 * Filter navigation items by search term
 * @param {NavigationGroup[]} navigationGroups - Navigation groups to search
 * @param {string} searchTerm - Search term
 * @returns {NavigationGroup[]} Filtered navigation groups
 */
export function filterNavigationItems(navigationGroups, searchTerm) {
  if (!searchTerm || !navigationGroups) return navigationGroups;
  
  const searchTermLower = searchTerm.toLowerCase().trim();
  
  return navigationGroups
    .map(group => {
      // Filter items within the group
      const filteredItems = group.items.filter(item => {
        // Check main item text
        if (item.text.toLowerCase().includes(searchTermLower)) {
          return true;
        }
        
        // Check submenu items if they exist
        if (item.submenu) {
          return item.submenu.some(subItem => 
            subItem.text.toLowerCase().includes(searchTermLower)
          );
        }
        
        return false;
      });
      
      // Only include groups that have matching items
      if (filteredItems.length > 0) {
        return {
          ...group,
          items: filteredItems.map(item => {
            // Check if main item matches
            const mainItemMatches = item.text.toLowerCase().includes(searchTermLower);
            
            // If item has submenu
            if (item.submenu) {
              // If main item matches, include all submenu items
              if (mainItemMatches) {
                return {
                  ...item,
                  // Keep all submenu items
                  submenu: item.submenu
                };
              } else {
                // Otherwise, filter submenu items
                const filteredSubmenu = item.submenu.filter(subItem =>
                  subItem.text.toLowerCase().includes(searchTermLower)
                );
                return {
                  ...item,
                  submenu: filteredSubmenu
                };
              }
            }
            return item;
          })
        };
      }
      
      return null;
    })
    .filter(group => group !== null);
}

/**
 * Get flattened navigation items
 * @param {NavigationGroup[]} navigationGroups - Navigation groups
 * @returns {NavigationItem[]} Flattened navigation items
 */
export function getFlattenedItems(navigationGroups) {
  if (!navigationGroups) return [];
  
  const flattened = [];
  
  navigationGroups.forEach(group => {
    group.items.forEach(item => {
      flattened.push(item);
      
      // Add submenu items if they exist
      if (item.submenu) {
        item.submenu.forEach(subItem => {
          flattened.push(subItem);
        });
      }
    });
  });
  
  return flattened;
}

/**
 * Search navigation items and return results grouped by category
 * @param {NavigationGroup[]} navigationGroups - Navigation groups to search
 * @param {string} searchTerm - Search term
 * @returns {Array<{group: string, items: NavigationItem[]}>} Search results grouped by category
 */
export function searchNavigationItems(navigationGroups, searchTerm) {
  if (!searchTerm || !navigationGroups) return [];
  
  const searchTermLower = searchTerm.toLowerCase().trim();
  const results = [];
  
  navigationGroups.forEach(group => {
    const groupResults = [];
    
    group.items.forEach(item => {
      // Check if main item matches
      const mainItemMatches = item.text.toLowerCase().includes(searchTermLower);
      
      // Check submenu items
      let submenuMatches = [];
      if (item.submenu) {
        submenuMatches = item.submenu.filter(subItem =>
          subItem.text.toLowerCase().includes(searchTermLower)
        );
      }
      
      // If either main item or subitems match, add to results
      if (mainItemMatches || submenuMatches.length > 0) {
        const resultItem = {
          ...item,
          // If main item matches, include all submenu items
          // Otherwise, only include matching submenu items
          submenu: mainItemMatches ? item.submenu : submenuMatches
        };
        groupResults.push(resultItem);
      }
    });
    
    if (groupResults.length > 0) {
      results.push({
        group: group.label,
        items: groupResults
      });
    }
  });
  
  return results;
}

export default {
  processMenuConfig,
  filterNavigationItems,
  getFlattenedItems,
  searchNavigationItems,
};