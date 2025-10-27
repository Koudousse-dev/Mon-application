# Design Guidelines: Gabon Childcare Admin Dashboard

## Design Approach
**System-Based Approach** - Following Material Design principles adapted for data-intensive admin interfaces. This utility-focused application prioritizes clarity, efficiency, and structured information hierarchy for managing childcare services.

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Primary Green: 145 63% 49% (buttons, active states, key actions)
- Primary Green Hover: 145 63% 42%
- Primary Green Light: 145 63% 95% (backgrounds, subtle accents)

**Secondary Colors:**
- Orange Accent: 25 95% 53% (notifications, urgent actions, badges)
- Orange Light: 25 95% 95% (warning backgrounds)

**Neutrals:**
- Background Base: 145 25% 97% (main background)
- White: 0 0% 100% (cards, modals, table rows)
- Gray 50: 145 10% 98%
- Gray 100: 145 10% 95%
- Gray 300: 145 5% 85%
- Gray 500: 145 5% 60%
- Gray 700: 145 5% 40%
- Gray 900: 145 5% 15% (primary text)

**Semantic Colors:**
- Success: 145 63% 49% (reuse primary)
- Warning: 45 95% 55%
- Error: 0 70% 50%
- Info: 210 90% 50%

### B. Typography

**Font Families:**
- Headings: Poppins (600 weight for major headings, 500 for subheadings)
- Body: Inter (400 regular, 500 medium, 600 semibold)

**Type Scale:**
- H1: text-3xl md:text-4xl, font-semibold (Dashboard titles)
- H2: text-2xl md:text-3xl, font-semibold (Section headers)
- H3: text-xl md:text-2xl, font-medium (Card titles, modal headers)
- H4: text-lg md:text-xl, font-medium (Subsection titles)
- Body Large: text-base md:text-lg (Emphasis text)
- Body: text-sm md:text-base (Default text)
- Body Small: text-xs md:text-sm (Labels, captions)

### C. Layout System

**Spacing Primitives:** Use Tailwind units: 2, 3, 4, 6, 8, 12, 16, 20, 24
- Micro spacing: p-2, gap-2 (tight elements)
- Component spacing: p-4, gap-4, m-4 (cards, buttons)
- Section spacing: p-6 md:p-8, gap-6 md:gap-8 (containers)
- Page spacing: p-6 md:p-12, gap-8 md:gap-12 (major sections)

**Grid System:**
- Mobile: Single column, full width
- Tablet (md:): 2-column layouts for cards, grid-cols-2
- Desktop (lg:): 3-4 column grids, grid-cols-3 lg:grid-cols-4
- Container max-width: max-w-7xl mx-auto

### D. Component Library

**Navigation:**
- Top Bar: Fixed header with logo, admin profile, notifications badge (orange), logout
- Mobile: Hamburger menu, slide-in drawer navigation
- Desktop: Sidebar navigation with icon + label, collapsible sections

**Data Tables:**
- Alternating row colors: white / gray-50
- Hover state: green-light background
- Column headers: gray-700 text, semibold, sticky positioning
- Actions column: Icon buttons with tooltips (edit, delete, view)
- Pagination: Bottom-right, green primary buttons for active page
- Responsive: Card layout on mobile, full table on tablet+

**Cards:**
- White background, subtle shadow (shadow-sm), rounded-lg
- Header: green-light background, p-4, title + action buttons
- Body: p-4 md:p-6
- Stats cards: Large number (text-3xl, primary green), label below (gray-500)
- Service cards: Icon/image top, title, description, action buttons

**Forms & Modals:**
- Modal overlay: dark overlay (bg-black/50), backdrop-blur-sm
- Modal container: white, rounded-xl, max-w-2xl, p-6 md:p-8
- Form groups: space-y-4
- Labels: text-sm font-medium, gray-700, mb-2
- Inputs: border-gray-300, rounded-lg, p-3, focus:ring-2 focus:ring-primary focus:border-primary
- Dropdowns: Same as inputs, chevron-down icon
- Checkboxes/Radio: Green primary accent
- Error states: Red border, error text below in red

**Buttons:**
- Primary: Green background, white text, px-6 py-3, rounded-lg, shadow-sm
- Secondary: White background, green text, green border, px-6 py-3, rounded-lg
- Danger: Red background, white text (delete actions)
- Icon buttons: p-2, rounded-md, hover:bg-gray-100
- Size variants: sm (px-4 py-2 text-sm), base (px-6 py-3), lg (px-8 py-4 text-lg)

**Status Badges:**
- Rounded-full, px-3 py-1, text-xs font-medium
- Active service: green background, dark green text
- Pending: orange background, dark orange text
- Cancelled: red background, dark red text
- Completed: gray background, gray text

**Dashboard Widgets:**
- Overview cards grid: 2x2 on mobile, 4 columns on desktop
- Quick actions panel: Rounded cards with icon, title, description
- Recent activity feed: Timeline with icons, timestamps
- Charts: Line/bar charts with green/orange color scheme

### E. Animations

**Minimal, Purposeful Motion:**
- Modal entry: fade + scale (duration-200)
- Drawer navigation: slide-in-right (duration-300)
- Table row hover: background color transition (duration-150)
- Button states: transform scale-95 active state
- No scroll animations or complex transitions

## Images

**Dashboard Hero/Header:**
- No large hero image needed for admin interface
- Optional: Small decorative illustration in empty states (e.g., "No services found" - friendly childcare-themed illustration, 240x240px)
- Service type icons: Use icon library (Heroicons) for service categories (calendar for regular care, clock for occasional, book for homework help)

**Profile/Avatar:**
- Admin profile photo in top navigation (circular, 40x40px)
- Default avatar fallback with initials on green background

## Key Principles

1. **Information Density:** Efficiently display service data, child records, and scheduling information without overwhelming users
2. **Action Clarity:** Every CRUD operation has clear visual affordance with confirmation steps for destructive actions
3. **Mobile Optimization:** Touch-friendly targets (min 44px), simplified navigation, responsive tables transform to cards
4. **Status Visibility:** Clear service status indicators, notification badges, real-time updates visual feedback
5. **Accessibility:** WCAG AA contrast ratios, keyboard navigation, screen reader labels, focus indicators