/**
 * @typedef {Object} NavigationItem
 * @property {string} text - Display text
 * @property {React.ComponentType} icon - Icon component
 * @property {string} path - Route path
 * @property {boolean} [badge] - Optional badge indicator
 * @property {NavigationItem[]} [submenu] - Optional submenu items
 */

/**
 * @typedef {Object} NavigationGroup
 * @property {string} label - Group label (e.g., "Principal")
 * @property {NavigationItem[]} items - Navigation items in group
 */

/**
 * @typedef {Object} UserPreferences
 * @property {'light' | 'dark' | 'system'} theme - Theme preference
 * @property {boolean} notificationsEnabled - Notification settings
 * @property {boolean} [sidebarCollapsed] - Legacy sidebar state
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} nome - Full name
 * @property {string} email - Email address
 * @property {string} cargo - Job title/role
 * @property {string} [avatar] - Optional avatar URL
 * @property {boolean} isAdmin - Admin privileges
 * @property {UserPreferences} preferences - User preferences
 */

/**
 * @typedef {'info' | 'warning' | 'error' | 'success'} NotificationType
 */

/**
 * @typedef {Object} NotificationAction
 * @property {string} label - Action label
 * @property {string} url - Action URL
 * @property {Function} [onClick] - Action callback
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Notification ID
 * @property {NotificationType} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {Date} timestamp - When notification was created
 * @property {boolean} read - Whether notification has been read
 * @property {NotificationAction} [action] - Optional action
 */

/**
 * @typedef {Object} MegaMenuDropdownProps
 * @property {string} title - Menu title
 * @property {NavigationGroup[]} groups - Navigation groups to display
 * @property {boolean} isOpen - Whether dropdown is open
 * @property {Function} onClose - Close callback
 * @property {'left' | 'center' | 'right'} [position] - Dropdown position
 */

/**
 * @typedef {Object} HeaderMegaMenuProps
 * @property {UserProfile} [user] - Current user information
 * @property {Notification[]} [notifications] - User notifications
 * @property {'light' | 'dark'} [initialTheme] - Current theme
 * @property {Function} [onThemeToggle] - Theme toggle callback
 * @property {Function} [onLogout] - Logout callback
 */

// Export types for use in JSDoc comments
export const navigationTypes = {
  NavigationItem: /** @type {NavigationItem} */ ({}),
  NavigationGroup: /** @type {NavigationGroup} */ ({}),
  UserProfile: /** @type {UserProfile} */ ({}),
  UserPreferences: /** @type {UserPreferences} */ ({}),
  Notification: /** @type {Notification} */ ({}),
  MegaMenuDropdownProps: /** @type {MegaMenuDropdownProps} */ ({}),
  HeaderMegaMenuProps: /** @type {HeaderMegaMenuProps} */ ({}),
};