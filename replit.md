# Dieu veille sur nos enfants - Childcare Service Application

## Overview
A mobile-first Progressive Web Application (PWA) designed for a Gabonese childcare and home assistance service. The platform connects parents with qualified nannies, provides service information, and integrates mobile payment options. The project aims to streamline childcare and home assistance, offering an efficient and reliable connection between service providers and families with significant market potential.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18 (TypeScript), Vite, Wouter (routing), Tailwind CSS (with shadcn/ui), TanStack Query (server state).
**Design System:** Green and orange color palette, custom fonts (Inter, Poppins, Quicksand), mobile-first responsive design with bottom navigation, PWA readiness, visual enhancements including hero images, improved shadows, and smooth CSS animations.
**Core Features:** Dynamic loading of services, contact info, and forfait options; comprehensive form validation with French error messages; authenticated admin navigation.

### Backend Architecture
**Server Framework:** Express.js with TypeScript, providing RESTful API endpoints under `/api`.
**Data Validation:** Zod schemas for shared client/server validation, ensuring runtime validation on API requests.

### Data Storage Solutions
**Database:** PostgreSQL (Neon serverless) managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations.
**Schema Design:** Includes `parent_requests`, `nanny_applications`, `contact_messages`, `notifications`, `payments`, `payment_configs`, `prestations`, `parametres_site`, `employees`, `paiements_employes`, `push_subscriptions`, and `banner_images`.
**Storage Implementation:** `DbStorage` for production (PostgreSQL) and `MemStorage` for development/testing. IndexedDB for client-side offline persistence.
**Automatic Migrations:** Production deployments run `npm run db:push` before server startup to automatically sync database schema. Drizzle config uses `strict: false` for non-interactive CI/CD deployments.

### Authentication and Authorization
**Admin Authentication:** Passport.js with local strategy, Bcryptjs for password hashing (10 salt rounds), Express sessions with secure cookie configuration. Default admin credentials are "admin"/"admin123". Admin users are stored in the `admin_users` table.
**Session Management:** Cookie-based sessions (7-day expiration) with secure flags (`httpOnly`, `secure`, `sameSite=lax`) in production. Requires `SESSION_SECRET`.
**Protected Routes:** Admin dashboard and management endpoints require authentication; public API endpoints are open.

### System Features
**Admin Dashboard:** Statistics cards, tabbed interface with collapsible detail cards, real-time status management for requests and applications, CRUD for services and site parameters, employee management (including nanny application acceptance and payment creation), payment provider configuration, admin profile editing, and push notification management toggle.
**Notification System:** 
- **In-app notifications**: Badge counter and popover list in admin dashboard for new requests, applications, messages, and matches.
- **Push notifications**: Web Push API integration allowing admins to receive real-time notifications on their devices (phone/desktop) for new parent requests, nanny applications, and contact messages. Features include:
  - Service Worker registration for offline notification handling
  - Subscription management via admin dashboard toggle
  - Automatic cleanup of expired subscriptions
  - Secured VAPID keys (environment variables required in production)
  - Browser notification permission requests
**Matching System:** Algorithm in `shared/matching.ts` calculates compatibility scores based on various criteria. Displays suggestions and call-to-action buttons. Generates notifications for high-scoring matches.
**Banner Image Management:** Admin-editable hero banners for parent form, nanny form, and contact pages with:
- Secure upload with react-easy-crop integration for image cropping
- Deterministic file naming (parent-form.jpg, nanny-form.jpg, contact.jpg) with physical file overwriting
- Cache-busting via automatic version incrementing (`?v=X` query parameter) on each upload
- Stored in PostgreSQL `banner_images` table with base64 encoding and version tracking
- Immediate UI updates without browser cache flash (version-based cache invalidation)
**Splash Screen:** Professional loading screen with 0-100% progress animation displayed on app startup, featuring:
- Branded gradient background (green to orange)
- Animated logo and progress bar
- Framer Motion animations for smooth transitions
- 2-second loading duration with fade-out effect

## External Dependencies

**UI Component Libraries:**
- Radix UI primitives
- shadcn/ui
- Embla Carousel
- Lucide React (icons)
- cmdk (command palette)

**Database & ORM:**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Drizzle ORM (`drizzle-orm`)
- Drizzle Kit

**Form & Validation:**
- React Hook Form
- Zod
- `@hookform/resolvers`
- `drizzle-zod`

**Payment Integration:**
- Admin configuration interface for Airtel Money, Moov Money, and CinetPay.
- Secure storage and display of API credentials.
- Database-backed configuration management.

**Utilities:**
- `date-fns`
- `clsx`, `tailwind-merge`, `class-variance-authority`
- `nanoid`