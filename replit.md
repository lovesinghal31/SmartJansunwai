# Municipal Complaint Management System

## Project Overview
A full-stack municipal complaint management system built with modern web technologies. The application allows citizens to submit complaints, officials to manage them, and provides analytics dashboards.

## Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js + TypeScript
- **Database**: MongoDB with native MongoDB driver
- **UI**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Authentication**: Passport.js with local strategy
- **Internationalization**: i18next

## Key Features
- Citizen complaint submission and tracking
- Official dashboard for complaint management
- Admin analytics and reporting
- Multi-language support (i18next)
- Real-time updates
- Interactive complaint map
- Chatbot integration
- Mobile-responsive design

## Project Structure
```
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and query client
│   └── i18n/          # Internationalization
├── server/
│   ├── index.ts       # Express server setup
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Data storage interface
│   ├── auth.ts        # Authentication setup
│   └── db.ts          # Database configuration
├── shared/
│   └── schema.ts      # Shared type definitions
```

## Development Guidelines
- Client/server separation with API-based communication
- Type-safe development with TypeScript
- Component-based architecture with shadcn/ui
- Database operations through storage interface
- Form validation with Zod schemas

## Recent Changes
- **Migration from Replit Agent**: Project migrated to standard Replit environment (Complete - August 6, 2025)
- **Database Migration**: Successfully migrated from PostgreSQL to MongoDB (Complete - August 6, 2025)
- **Dependencies**: Updated packages - removed Drizzle ORM, added MongoDB driver and Mongoose
- **Schema Update**: Converted PostgreSQL schema to MongoDB documents with proper TypeScript interfaces
- **Storage Layer**: Rewritten storage interface to use MongoDB collections with proper indexing
- **Server Status**: Running on port 5000 with MongoDB connection and automatic admin user creation

## User Preferences
- Clean, modern UI design
- Multi-language support priority
- Security-focused development practices

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `DATABASE_NAME`: MongoDB database name (default: municipal_complaints)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)

## Database Schema
MongoDB collections with TypeScript interfaces defined in `shared/schema.ts`. Collections include:
- users: User accounts with role-based access
- complaints: Citizen complaints with status tracking
- complaint_updates: Status updates and comments
- feedback: Citizen feedback on resolved complaints
- departments: Municipal departments and their SLA settings
- notifications: User notifications
- audit_logs: System audit trail

## Deployment
The application is configured for Replit deployment with proper port binding and static file serving.