# Overview

This is a comprehensive civic grievance redressal system called "Jansunwai" for Indore Smart City. The application enables citizens to submit complaints about civic issues and allows government officials to manage and track the resolution of these complaints. The system features role-based access control with separate dashboards for citizens and officials, complaint tracking, feedback mechanisms, and analytics capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture:
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a feature-based folder structure with reusable components, custom hooks, and utility functions. Protected routes ensure authenticated access to dashboard areas.

## Backend Architecture
The backend follows a RESTful API design using Express.js:
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Management**: Express sessions with PostgreSQL store
- **Password Security**: Node.js crypto module with scrypt for secure password hashing
- **API Structure**: Resource-based endpoints for complaints, users, feedback, and analytics
- **Middleware**: Request logging, JSON parsing, and error handling

## Database Design
The system uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Users Table**: Stores citizen and official accounts with role-based access
- **Complaints Table**: Core complaint data with status tracking and categorization
- **Complaint Updates Table**: Audit trail of status changes and official communications
- **Feedback Table**: Citizen satisfaction ratings and comments post-resolution

The schema supports complaint lifecycle management from submission through resolution, with proper foreign key relationships and data integrity constraints.

## Authentication & Authorization
- **Session-based Authentication**: Secure server-side sessions with PostgreSQL storage
- **Role-based Access Control**: Citizens can only view/edit their own complaints, officials have broader access
- **Password Security**: Industry-standard scrypt hashing with salt for secure password storage
- **Protected Routes**: Frontend route guards ensure authenticated access to sensitive areas

## Key Features
- **Complaint Management**: Full CRUD operations with status tracking and categorization
- **File Attachments**: Support for complaint documentation and evidence
- **Real-time Updates**: Officials can provide status updates visible to complaint authors
- **Feedback System**: Post-resolution satisfaction surveys and ratings
- **Analytics Dashboard**: Complaint statistics and trends for administrative insights
- **Responsive Design**: Mobile-first approach with adaptive layouts

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Styling
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Consistent icon library for UI elements
- **Embla Carousel**: Touch-friendly carousel component

## Development Tools
- **Vite**: Modern build tool with hot module replacement
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Form Handling & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Deployment & Hosting
- **WebSocket Support**: Real-time features with ws library for Neon database
- **Environment Variables**: Secure configuration management for database URLs and session secrets