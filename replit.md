# Dieu veille sur nos enfants - Childcare Service Application

## Overview

A mobile-first web application for a Gabonese childcare and home assistance service. The platform connects parents seeking childcare services with qualified nannies, provides service information, and is prepared for mobile payment integration. It is built as a Progressive Web App (PWA) suitable for mobile installation and app store publishing. The project's vision is to streamline childcare and home assistance services, offering market potential for efficient, reliable connections between service providers and families.

## Recent Changes (November 2025)

### Replit Environment Setup (November 8, 2025)
- **Replit Integration Complete**: Application successfully configured for Replit environment
  - **PostgreSQL Database**: Using Replit's built-in Neon PostgreSQL database
  - **Workflow Configuration**: Dev workflow running on port 5000 with Vite HMR
  - **Security Configuration**: 
    - Helmet CSP disabled in development for Vite compatibility
    - Rate limiting adjusted to 500 req/15min in dev (100 in production)
    - Session management configured for Replit's reverse proxy
  - **Database Schema**: Drizzle migrations applied successfully
  - **Admin User**: Default admin created (username: admin, password: admin123)
  - **Development Server**: Running on `0.0.0.0:5000` with `allowedHosts: true` for Replit proxy
  - **Deployment Ready**: Configured for Replit Autoscale deployment
    - Build command: `npm run build`
    - Start command: `npm start`
    - Frontend and backend bundled together for production
  - Status: ✅ Fully functional in Replit environment

## Recent Changes (October 2025)

### Render Deployment Configuration (October 20, 2025)
- **Production Deployment Ready**: Application fully configured for deployment on Render
  - **render.yaml**: Infrastructure as Code configuration
    - Web service (Node.js, Frankfurt region)
    - PostgreSQL database (PostgreSQL 16, Frankfurt region)
    - Environment variables (NODE_ENV, DATABASE_URL, SESSION_SECRET, ENABLE_OBJECT_STORAGE)
    - Auto-deployment on Git push
  - **.env.example**: Complete documentation of required environment variables
    - Database connection (DATABASE_URL)
    - Session security (SESSION_SECRET)
    - PostgreSQL credentials (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
  - **scripts/migrate.ts**: Database migration script using Drizzle Kit
    - Validates DATABASE_URL before migration
    - Executes `drizzle-kit push --force` to sync schema
    - Lists all created tables and setup instructions
  - **DEPLOY.md**: Complete deployment guide (60+ pages)
    - Step-by-step Render setup (GitHub, PostgreSQL, Web Service)
    - Environment variables configuration
    - Database initialization
    - Testing and verification procedures
    - Troubleshooting guide
    - Production security checklist
  - **Build Validation**: Production build tested successfully
    - Frontend: Vite build → `dist/public/` (614 KB bundle)
    - Backend: esbuild → `dist/index.js` (72 KB)
    - Static serving verified via `server/vite.ts` serveStatic()
  - Architect-reviewed and validated ✅
  - Ready for deployment: `https://dieu-veille-nos-enfants.onrender.com`

### Duplicate Employee Prevention with Optimistic Cache Updates (October 20, 2025)
- **Critical Fix - Duplicate Employee Prevention**: Resolved issue where rapid clicks created multiple duplicate employees
  - **Problem**: User clicking "Accepter" multiple times created 4-5 identical employee records
  - **Root Cause**: Buttons reappeared after processing because `invalidateQueries()` doesn't force immediate UI refresh
  - **Solution**: Implemented optimistic cache updates with `queryClient.setQueryData()`
  - Implementation details:
    - **Optimistic Update in `onMutate`**:
      - `queryClient.cancelQueries()` - Cancels in-flight queries to avoid conflicts
      - `queryClient.getQueryData()` - Snapshots current state for rollback
      - `queryClient.setQueryData()` - **Immediately updates status in cache** (no network latency)
      - Returns `{ previousApplications }` context for error recovery
    - **Instant UI Response**:
      - Status changes from "traité" to "accepté"/"refusé" **instantly** in cache
      - Buttons disappear immediately (only shown when `statut === "traite"`)
      - No waiting for server response or network round-trip
    - **Rollback in `onError`**:
      - Restores snapshot with `queryClient.setQueryData()` if API fails
      - Ensures UI consistency even on errors
    - **Button locking**: `processingApplicationId` state prevents rapid clicks during async processing
  - Impact: Buttons disappear instantly after first click, making duplicate submissions impossible
  - Applied to both acceptApplicationMutation and rejectApplicationMutation
  - Architect-reviewed and validated ✅

- **Auto-Refresh Implementation**: Forms now trigger automatic UI updates in admin dashboard
  - parent-form.tsx: Added cache invalidation for `/api/parent-requests` after submission
  - nanny-form.tsx: Added cache invalidation for `/api/nanny-applications` after submission
  - All admin mutations already had `queryClient.invalidateQueries()` for proper auto-refresh
  - Impact: Admin dashboard automatically shows new candidatures/demandes without manual page refresh
  - Solves issue where 50+ submissions would require 50+ manual refreshes
  
- **Document Transfer Fix**: Documents now properly visible in employee dossiers
  - Root cause: UI was displaying `employeeApplication.documents` (undefined) instead of `selectedEmployee.documents`
  - Fixed admin.tsx to use correct variable
  - Backend already copied documents correctly (server/routes.ts)
  - Documents uploaded during candidature now appear in employee dossier after acceptance
  - E2E tested: Upload document → Submit candidature → Accept → Document visible in employee dossier ✅

### Payment Configuration System (October 20, 2025)
- **Payment Provider Management**: Administrators can now configure mobile payment providers
  - New `/admin/payment-config` page for managing payment methods
  - Support for 3 providers: Airtel Money, Moov Money, and CinetPay
  - Each provider has:
    - Activation toggle (actif/inactif status)
    - API key field (masked by default with show/hide toggle)
    - API secret field (masked by default with show/hide toggle)
    - Config JSON field for additional parameters (URLs, merchant IDs, etc.)
  - Database table `payment_configs` with fields: provider, actif, api_key, api_secret, config_json, date_modification
  - API endpoints:
    - GET `/api/payment-configs` - List all configurations
    - GET `/api/payment-configs/:provider` - Get specific provider config
    - PUT `/api/payment-configs/:provider` - Update provider configuration
  - Security features:
    - All routes protected by authentication
    - API keys masked in UI (showing only last 4 characters)
    - Secure password-type inputs with visibility toggle
  - E2E tested: Activate/deactivate providers, save configurations, verify persistence

### Admin Profile Editing (October 16, 2025)
- **Profile Edit Feature**: Administrators can now edit their own profile information
  - PUT `/api/admin/profile` - Update username, nom (full name), and email
  - Edit mode toggle with "Modifier" button in profile page
  - Form validation using `updateAdminProfileSchema` (Zod)
  - Session automatically refreshed after successful update
  - Success toast notification on save
  - E2E tested: Edit profile → Save → Verify updated values → Restore original
  - React warning fixed: moved setValue calls to useEffect

### Delete Workflows + Object Storage (October 16, 2025)
- **Deletion System**: Complete delete workflows with confirmation dialogs
  - DELETE `/api/employees/:id` - Remove employees with AlertDialog confirmation
  - DELETE `/api/nanny-applications/:id` - Remove candidatures (accepted/rejected only)
  - "Retirer l'employé" button in employee dialog (red, destructive)
  - "Supprimer la candidature" button for terminal status candidatures
  - Both deletions require explicit confirmation via AlertDialog
  - Success toasts and cache invalidation after deletion
  - E2E tested: Accept candidature → Create employee → Delete candidature → Delete employee

- **Object Storage Integration (Optional)**:
  - Disabled by default (uses base64 encoding for documents)
  - Can be enabled via `ENABLE_OBJECT_STORAGE=true` + Replit bucket creation
  - Route `/api/upload` - Stores in Object Storage or base64 based on availability
  - Route `/api/download/:path(*)` - Downloads from Object Storage
  - Legacy document handling: Documents without storedPath prefixed with "legacy-"
  - View/download functions detect legacy docs and show graceful error toasts
  - No crashes on missing/corrupted documents

- **Document Safety**: 
  - parseDocuments() ensures all documents have storedPath
  - Legacy documents (base64) never routed to Object Storage
  - viewDocument() and downloadDocument() guard against invalid paths
  - Controlled error messages instead of 404 crashes

### Accept/Reject Candidature Bug Fix (October 16, 2025)
- **Issue Fixed**: Resolved 400 error when accepting/rejecting nanny candidatures
  - Root cause: Frontend sent status values with accents ("accepté", "refusé") but backend expected unaccented values ("accepte", "refuse")
  - Fixed acceptApplicationMutation to send "accepte" instead of "accepté"
  - Fixed rejectApplicationMutation to send "refuse" instead of "refusé"
- **UI Enhancement**: Terminal statuses now displayed as colored badges
  - Accepted candidatures show green "Accepté" badge (read-only)
  - Rejected candidatures show red "Refusé" badge (read-only)
  - In-progress statuses use dropdown: "En examen", "En attente", "Traité"
  - Accept/Reject actions must use dedicated buttons (complete workflow with employee creation)
- **Payment Form Fix**: Changed all "periode" references to "motif" for consistency with backend schema
- **Testing**: E2E tests confirm Accept/Reject workflows return 200 without errors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite for development and bundling
- Wouter for client-side routing
- Tailwind CSS for styling, supplemented by shadcn/ui (Radix UI primitives)
- TanStack Query (React Query) for server state management

**Design System:**
- Green and orange color palette (Green: hsl 145, 63%, 49%; Orange: hsl 25, 95%, 53%; Accent: hsl 35, 90%, 65%; Background: hsl 145, 25%, 97%).
- Custom fonts (Inter, Poppins, Quicksand).
- Mobile-first responsive design with bottom navigation.
- PWA readiness with `manifest.json`.
- Visual enhancements include hero images with gradient overlays, improved card shadows, and smooth CSS animations (staggered slide-up, hover effects).

**Core Features:**
- Dynamic loading of services, contact information, and forfait options from API.
- Comprehensive form validation with French error messages.
- Admin navigation accessible to authenticated users.

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript.
- RESTful API endpoints under `/api`.

**Data Validation:**
- Zod schemas for shared client/server validation.
- Runtime validation on API requests.

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless.
- Drizzle ORM for type-safe operations.
- Drizzle Kit for migration management.

**Schema Design:**
- `parent_requests`: Childcare service requests.
- `nanny_applications`: Caregiver applications.
- `contact_messages`: General inquiries.
- `notifications`: Admin notifications.
- `payments`: Payment records (future use).
- `payment_configs`: Payment provider configurations (Airtel Money, Moov Money, CinetPay).
- `prestations`: Service packages.
- `parametres_site`: Editable site contact information.
- `employees`: Employee records.
- `paiements_employes`: Employee payment history.

**Storage Implementation:**
- Production: PostgreSQL via `DbStorage`.
- Development/Testing: In-memory `MemStorage`.
- Client-side: IndexedDB for offline persistence.

### Authentication and Authorization

**Admin Authentication:**
- Passport.js with local strategy.
- Bcryptjs for password hashing (10 salt rounds).
- Express sessions with secure cookie configuration.
- Default admin credentials (username="admin", password="admin123") to be changed in production.
- Admin users stored in `admin_users` table.

**Session Management:**
- Cookie-based sessions (7-day expiration).
- Secure flags (`httpOnly`, `secure`, `sameSite=lax`) in production.
- `SESSION_SECRET` required in production.

**Protected Routes:**
- Admin dashboard and management endpoints require authentication.
- Public API endpoints are open.

### System Features

**Admin Dashboard:**
- Statistics cards.
- Tabbed interface with collapsible detail cards.
- Real-time status management for parent requests, nanny applications, and contact messages.
- CRUD interface for managing service packages (prestations) and site parameters.
- Employee management, including acceptance of nanny applications and payment creation.
- Payment provider configuration page for managing API keys and settings.
- Admin profile page for user info and password changes.

**Notification System:**
- In-app notifications in the admin dashboard with badge counter and popover list.
- Auto-generated notifications for new requests, applications, messages, and matches.
- `notifications` table stores notification details.

**Matching System:**
- Algorithm in `shared/matching.ts` calculates compatibility scores (0-100%) based on service type, location, experience, and availability.
- Admin matching page displays suggestions, details, and call-to-action buttons.
- Automatic match notifications for scores ≥ 50%.

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
- Secure storage of API credentials with masked display.
- Database-backed configuration management.
- Ready for integration with payment provider APIs.

**Utilities:**
- `date-fns`
- `clsx`, `tailwind-merge`, `class-variance-authority`
- `nanoid`

**Service Data:**
- `prestations` export from the schema for a predefined service catalog.