# 🎨 HubContabil Design System

> **Central Directive:** Design as Visual Code. Every UI decision is a technical contract between experience, performance, and maintainability.
> **Core Principle:** Mantine-First. All components must leverage Mantine UI's primitives to ensure consistency and accessibility.

---

## 1. 🌈 Color Palette (Sapphire Blue Base)

Our palette is built around **Sapphire Blue (#0F52BA)**, providing a professional and trustworthy accounting atmosphere.

### 1.1 Primary Colors (Sapphire Blue)
Used for primary actions, links, and active states.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `blue-0` | `#E6EEF8` | Subtle backgrounds, badges |
| `blue-1` | `#C2D6EE` | Hover states for list items |
| `blue-2` | `#9DBFE4` | Focus rings |
| `blue-3` | `#78A7DA` | Decorative elements |
| `blue-4` | `#538FD0` | Secondary button hovers |
| `blue-5` | `#0F52BA` | **Primary Color** - Main buttons, links |
| `blue-6` | `#0C4295` | Primary button hover / Pressed |
| `blue-7` | `#093270` | Text on light backgrounds (dark mode) |
| `blue-8` | `#06214B` | Dark gradients |
| `blue-9` | `#031126` | Header background (dark mode) |

### 1.2 Neutral Colors (Slate)
Used for backgrounds, borders, and text hierarchy.

| Token | Light Hex | Dark Hex | Usage |
| :--- | :--- | :--- | :--- |
| `gray-0` | `#F8FAFC` | `#0F172A` | Page background |
| `gray-1` | `#F1F5F9` | `#1E293B` | Surface background (Cards, Header) |
| `gray-2` | `#E2E8F0` | `#334155` | Subtle borders |
| `gray-3` | `#CBD5E1` | `#475569` | Input borders |
| `gray-4` | `#94A3B8` | `#64748B` | Placeholders |
| `gray-5` | `#64748B` | `#94A3B8` | Inactive icons |
| `gray-6` | `#475569` | `#CBD5E1` | Secondary text |
| `gray-7` | `#334155` | `#E2E8F0` | Paragraph text |
| `gray-8` | `#1E293B` | `#F1F5F9` | Titles |
| `gray-9` | `#0F172A` | `#F8FAFC` | Primary text |

### 1.3 Feedback Colors
| Type | Light Hex | Dark Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | `#10B981` | `#34D399` | Confirmations, success states |
| **Warning** | `#F59E0B` | `#FBBF24` | Alerts, pending validations |
| **Error** | `#EF4444` | `#F87171` | Deletions, validation failures |
| **Info** | `#3B82F6` | `#60A5FA` | Informational messages |

---

## 2. 🏗 Component Architecture (Mantine UI)

We use **Mantine UI v7+** as our foundational component library.

### 2.1 Application Tokens
| Token | Light Mode | Dark Mode | Application |
| :--- | :--- | :--- | :--- |
| `--bg-page` | `gray-0` | `gray-9` | Main application background |
| `--bg-surface` | `white` | `gray-1` | Cards, Header |
| `--bg-elevated` | `white` | `gray-2` | Modals, Dropdowns |
| `--border-default` | `gray-2` | `gray-2` | Standard borders |
| `--text-primary` | `gray-9` | `gray-0` | Primary content text |
| `--text-secondary` | `gray-6` | `gray-4` | Labels, descriptions |

### 2.2 Navigation (Double Navbar)
- **Slim Sidebar:** Left-aligned icons for top-level module selection.
- **Detail Panel:** Dynamic secondary panel showing module-specific links.
- **Search:** Keyboard shortcut `Ctrl + K`. Modal-based global search.
- **Notifications:** Bell icon with dynamic unread indicator in the header.
- **Theme:** Persistent toggle between Light and Dark modes in the header.

---

## 3. 📱 Responsiveness & Layout
- **Mobile-First:** 360px is the base.
- **Breakpoints:** Mantine defaults (xs: 576, sm: 768, md: 992, lg: 1200, xl: 1408).
- **Safe Zones:** Interactive targets must be at least 44x44px.

---

## 4. ⌨️ Accessibility (A11y)
- **WCAG 2.1 AA Compliance:** Minimum contrast ratio 4.5:1.
- **Keyboard Navigation:** Full focus management for modals and menus.
- **ARIA Labels:** Mandatory for all icon-only buttons.

---

## 5. 🚀 Performance
- **Code Splitting:** Route-based lazy loading.
- **Image Optimization:** Modern formats (WebP/AVIF).
- **Bundle Size:** Keep main bundle < 100kb (gzipped).
