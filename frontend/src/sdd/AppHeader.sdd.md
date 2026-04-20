# SDD: App Header with Menus

## 1. Overview
The App Header is the primary navigation hub, providing structured access to system modules via traditional dropdown menus, global search, notifications, and theme management. The application uses a horizontal navigation pattern without a sidebar.

## 2. Functional Requirements
- **Navigation (Dropdown Menus):**
    - Individual menu buttons for each category (e.g., Accounting, Tools).
    - Each button triggers a Mantine `Menu` dropdown.
    - Animation: `SlideDown` transition.
- **Global Search:**
    - Triggered by `Ctrl + K` or clicking the search icon.
    - Modal-based interface with fuzzy search.
- **Notifications:**
    - Real-time notification bell with unread count badge.
    - Modal display for notification list.
    - API-ready structure.
- **Theme Toggle:**
    - Light/Dark mode switch with persistence.
- **User Profile:**
    - Avatar, name, and logout dropdown.

## 3. Technical Specification (Mantine UI)
- **Base Component:** `AppShell.Header`
- **Menu Structure:** Multiple `Menu` components grouped in a `Group`.
- **Search Modal:** `Modal` + `SearchBar` component.
- **Notification Modal:** `Modal` + `NotificationModal` component.
- **Transitions:** `slide-down` duration 200ms.
- **Layout:** `AppShell` configured with `header` only (no `navbar`).

## 4. Design Tokens
- **Primary:** `blue-5` (#0F52BA).
- **Background:** `var(--bg-surface)`.
- **Border:** `var(--border-default)`.

## 5. Accessibility
- Keyboard navigation (Tab, Enter, Arrows for menus).
- `aria-label` on all functional icons.
