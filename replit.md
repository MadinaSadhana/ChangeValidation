# Change Request Management System

## Overview

This is a modern full-stack web application designed to streamline the Pre and Post Change Validation process for IT change management. The application replaces manual Excel-based tracking with an automated, real-time system that enables Change Managers to efficiently coordinate application checkouts across multiple environments and teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Middleware**: Session-based authentication, JSON parsing, and request logging

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (specifically configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (change_manager, application_owner, admin)
- **Security**: Secure session cookies with HTTP-only flags

### Core Business Logic

#### Change Request Management
- Auto-generated change request IDs with comprehensive tracking
- Support for different change types (P1, P2, Emergency, Standard)
- Scheduled change windows with start/end date-time tracking
- Multi-application impact tracking with SPOC (Single Point of Contact) assignments

#### Validation Workflow
- Pre-change and post-change validation status tracking
- Status options: Pending, Completed, Not Applicable
- Comment system for detailed observations
- File attachment support for validation proof (screenshots, logs)

#### User Management
- Three distinct user roles with different access levels
- Application SPOC assignments for ownership clarity
- Email and contact information tracking

### Frontend Components

#### Dashboard Views
- **Change Manager Dashboard**: Overview of all change requests with filtering and search
- **Application Owner View**: Focused view of assigned applications requiring validation
- **Statistics Cards**: Real-time metrics and progress indicators

#### Interactive Features
- Modal-based change request creation with form validation
- Real-time status updates with optimistic UI updates
- File upload components with drag-and-drop support
- Responsive design optimized for both desktop and mobile

## Data Flow

### Request Creation Flow
1. Change Manager creates new change request via modal form
2. System auto-generates unique change request ID
3. Selected applications and their SPOCs are associated with the request
4. Notification system alerts relevant application owners

### Validation Update Flow
1. Application owners receive notifications about pending validations
2. SPOCs log in and update validation statuses for their applications
3. Comments and attachments can be added for audit purposes
4. Change Manager dashboard reflects real-time progress
5. System tracks completion status across all assigned applications

### Reporting and Analytics Flow
- Historical data storage for trend analysis
- Statistics generation for dashboard displays
- Search and filtering capabilities across all change requests
- Export functionality for external reporting needs

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework
- **react**: Frontend UI library
- **@tanstack/react-query**: Server state management

### UI and Design Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **date-fns**: Date manipulation and formatting

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Performant form handling

### Authentication and Session Management
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation in watch mode
- Replit-specific development tools and cartographer integration
- Environment variable-based configuration

### Production Build Process
1. Vite builds optimized client-side bundle
2. esbuild compiles server code with external package resolution
3. Static assets served from Express with appropriate caching headers
4. Single-command deployment with `npm run build && npm start`

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session security via `SESSION_SECRET` for cookie signing
- Replit-specific authentication configuration
- Development vs production mode detection

### Scaling Considerations
- Stateless server design enables horizontal scaling
- PostgreSQL connection pooling for database efficiency
- Session storage in database rather than memory for multi-instance support
- CDN-ready static asset serving for global distribution

## Current Application State

### Enhanced Dashboard Features (January 19, 2025)
- **Application-Split Table Structure**: Main dashboard now displays one row per application per change request:
  - **CR ID**: Change request identifier (shown only on first application row)
  - **CR Description**: Title with schedule information (shown only on first application row)
  - **Priority**: Change type badge showing priority level (P1, P2, Emergency, Standard) - positioned as 3rd column
  - **Overall Status**: Calculated status per change request showing completion progress
  - **Application Name**: Individual application name only
  - **Pre-Application Checkout Status**: Individual application pre-change validation status badge only
  - **Post-Application Checkout Status**: Individual application post-change validation status badge only
  - **Actions**: Sticky column with View Details buttons for navigation
  - Color-coded badges: Gray for Completed, Blue for In Progress, Light Gray for Pending, Gray for N/A
  - Support for "Not Applicable" status handling with individual application-level tracking
- **Simplified Layout**: Removed CR Creation Date and CR Completion Date columns from main view for cleaner display
- **Application Owner Information**: Available in View Details page only, not cluttering main dashboard table
- **Overall Status Summary Header**: Enhanced summary cards showing total change requests and overall completion status:
  - **In Progress Status**: Change requests with validations currently being worked on (orange indicators with animated pulse)
  - **Pending Status**: Change requests with validations awaiting action (yellow indicators)  
  - **Completed Status**: Change requests with all validations completed (green indicators)
  - Total count display with color-coded status indicators and descriptive badges
- **Overall Status Column**: New table column showing calculated overall status per change request:
  - **Completed**: Only when ALL applications have both Pre and Post validations completed
  - **In Progress**: When any application has validations currently in progress
  - **Pending**: When any application has validations awaiting action
  - Status is shown only on first row of each change request for clean display

### Data Flow Architecture Fixed (January 19, 2025)
- **Backend Storage Layer**: Fixed critical database column mapping issue using camelCase instead of snake_case
- **API Response Structure**: Status fields (preChangeStatus, postChangeStatus) now properly flow from storage to frontend
- **Frontend Status Calculation**: Summary header correctly processes status data to display accurate counts
- **Real-time Status Updates**: System now displays correct statistics: 8 Completed, 11 In Progress, 3 Pending change requests
- **Data Integrity**: Complete end-to-end data flow from PostgreSQL → Drizzle ORM → Express API → React Query → UI components
- **SPOC Integration**: Backend now joins user data to provide realistic SPOC names (Sarah Johnson, David Martinez, etc.)
- **UI Cleanup**: Removed date/time information from CR Description column for cleaner table display

### Sample Data Created (January 19, 2025)
- **Applications**: 15 diverse applications with realistic SPOC assignments
  - Customer Portal, Payment Gateway, Analytics Dashboard (SPOC: Sarah Johnson)  
  - Inventory Management System, Email Service Platform, Mobile App Backend (SPOC: David Martinez)
  - Notification Service, File Storage System, Content Management System (SPOC: Emily Thompson)
  - Audit Logging Service, Third-party Integration Hub, User Authentication Service (SPOC: Robert Williams)
  - Database Management Portal, API Gateway, Monitoring & Alerting System (SPOC: Jessica Davis)

- **Change Requests**: 14 comprehensive change requests demonstrating all scenarios
  - **Emergency**: CR-2025-001237 (SQL Injection Hotfix), CR-2025-001255 (Critical Performance Fix - In Progress)
  - **P1 Priority**: CR-2025-001235 (Security Patch), CR-2025-001238 (Load Balancer), CR-2025-001242 (Mobile Auth Fix), CR-2025-001243 (SSL Renewal), CR-2025-001245 (Data Migration), CR-2025-001251 (Security Certificate Renewal - Completed), CR-2025-001252 (Database Migration Phase 2 - In Progress)
  - **P2 Priority**: CR-2025-001234 (Database Schema), CR-2025-001240 (API Rate Limiting), CR-2025-001254 (Legacy System Decommission - Completed)
  - **Standard**: CR-2025-001236 (Performance Optimization), CR-2025-001239 (Email Templates), CR-2025-001241 (Database Indexing), CR-2025-001244 (Feature Flag Cleanup), CR-2025-001253 (Network Infrastructure Upgrade - Pending)

- **Validation Status Diversity**: Comprehensive status matrix demonstrating all system capabilities
  - **Fully Completed Change Requests**: CR-2025-001251 (Security Certificate Renewal), CR-2025-001254 (Legacy System Decommission)
  - **In-Progress Change Requests**: CR-2025-001252 (Database Migration), CR-2025-001255 (Emergency Performance Fix)
  - **Pending Change Requests**: CR-2025-001253 (Network Infrastructure Upgrade) - all validations awaiting start
  - **Mixed Status Applications**: Realistic combinations of completed, in-progress, and pending statuses
  - **Emergency Scenarios**: Active critical fixes with time-sensitive validations
  - **Diverse Validation States**: Applications demonstrating various completion and work-in-progress scenarios

### Analytics Dashboard (Removed January 19, 2025)
- **Analytics feature removed per user request** - simplified navigation and codebase
- **Focused on core functionality** - change request management and validation tracking
- **Cleaned up codebase** - removed analytics routes, components, and sample data generation

### User Configuration
- Primary user (45228804) configured as Change Manager role
- Full access to create change requests and monitor all validations
- Analytics dashboard provides comprehensive insights into change management performance
- Sample data enables immediate testing of all system features including advanced reporting
- Dashboard displays enhanced validation status columns for comprehensive change tracking