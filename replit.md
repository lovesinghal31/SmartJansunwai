# Municipal Complaint Management System

## Project Overview
A full-stack municipal complaint management system built with modern web technologies. The application allows citizens to submit complaints, officials to manage them, and provides analytics dashboards.

## Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
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
- **Migration from Replit Agent**: Project migrated to standard Replit environment
- **Dependencies**: Installed missing cross-env and tsx packages

## User Preferences
- Clean, modern UI design
- Multi-language support priority
- Security-focused development practices

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)

## Database Schema
Managed through Drizzle ORM with migrations in `shared/schema.ts`

## Deployment
The application is configured for Replit deployment with proper port binding and static file serving.