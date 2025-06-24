# Venturas Web Application

## Table of Contents

- [Project Overview](#venturas-web-application)
- [Table of Contents](#table-of-contents)
- [Installation & Setup](#installation--setup)
- [Backend (NestJS)](#backend-nestjs)
  - [Authentication Approach](#authentication-approach)
  - [API Modules & Routes](#api-modules--routes)
  - [Swagger API Documentation](#swagger-api-documentation)
  - [Key Libraries](#key-libraries)
  - [Email Verification & Resend](#email-verification--resend)
  - [Environment Variables](#environment-variables)
  - [Type-Safe Environment Variable Management (`env.ts`)](#type-safe-environment-variable-management-envts)
- [Frontend (React)](#frontend-react)
  - [Pages Overview](#pages-overview)
  - [Key Libraries](#frontend-key-libraries)
  - [How the Pages Work](#how-the-pages-work)
- [Database (MySQL)](#database-mysql)
  - [Schema Overview](#schema-overview)
- [Development Workflow](#development-workflow)
- [Notes](#notes)

# Venturas Web Application Test

A full-stack social media application built with NestJS (backend), React + Vite (frontend), and MySQL (database). This application features user authentication, email verification, post creation (murmurs), likes, follows, and more.

## 📁 Project Structure

```
webapp-test/
├── src/                    # Frontend (React + Vite)
├── server/                 # Backend (NestJS)
├── db/                     # Database (MySQL with Docker)
└── README.md              # This file
```

---

## 🚀 Installation Guide

### Prerequisites

- Node.js (v20.x.x)
- npm/yarn
- Docker & Docker Compose

### 1. Database Setup

```bash
cd db
docker-compose build
docker-compose up -d
```

This will start a MySQL 8.x database on `localhost:3306` with:
- Database: `test`
- Username: `docker`
- Password: `docker`

### 2. Backend Setup

```bash
cd server
npm install
npm run start:dev
```

The backend will run on `http://localhost:4000` with API prefix `/api/v1`

### 3. Frontend Setup

```bash
cd src
yarn install
yarn dev
```

The frontend will run on `http://localhost:3000`

### 4. Environment Variables

Create `.env` files in both `server/` and `src/` directories. See [Environment Variables](#environment-variables) section for details.

---

## 🔧 Backend (NestJS)

### Architecture & Design Decisions

Initially, I attempted to implement a more sophisticated authentication system in NestJS using [Better Auth](https://www.better-auth.com/docs), a comprehensive TypeScript authentication and authorization framework. Better Auth offers features like secure email/password login, session management, rate limiting, social sign-on, 2FA, and a plugin ecosystem for advanced needs. However, due to type errors and integration complications, I simplified the approach for now, but the database structure remains compatible for future Better Auth integration.

The current implementation uses a **Refresh & Access Token Strategy** with the following features:

#### Refresh & Access Token Strategy

- **Access Token**: Short-lived (15 minutes) JWT token for API authentication
- **Refresh Token**: Long-lived (1 day) token stored securely for token renewal
- **Automatic Token Refresh**: Frontend automatically refreshes expired access tokens
- **Secure Storage**: Tokens stored in encrypted localStorage using AES encryption

### Database Schema

The application uses **Drizzle ORM** with MySQL and includes tables prepared for OAuth integration:

```typescript
// Users table with Auth.js compatibility
users: {
  id, name, email, emailVerified, image, hashedPassword, createdAt, updatedAt
}

// OAuth accounts (prepared for future use)
accounts: {
  userId, type, provider, providerAccountId, refresh_token, access_token, ...
}

// Session management
sessions: {
  sessionToken, userId, expires, deviceInfo, ipAddress, ...
}

// Email verification
verificationTokens: {
  identifier, token, expires
}

// Social features
murmurs: {
  id, content, authorId, createdAt, updatedAt, likeCount
}

likes: {
  murmurId, userId, createdAt
}

follows: {
  followerId, followingId, createdAt
}
```

### API Routes & Modules

#### 🔐 Auth Module (`/api/v1/auth`)

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/register` | POST | Register new user | `{ name, email, password }` |
| `/verify-email` | GET | Verify email with token | `?token=xxx` |
| `/login` | POST | User login | `{ email, password }` |
| `/logout` | POST | Logout current session | - |
| `/logout-all` | POST | Logout all sessions | - |
| `/refresh` | POST | Refresh access token | - |
| `/profile` | GET | Get user profile | - |
| `/sessions` | GET | Get all user sessions | - |
| `/sessions/revoke` | POST | Revoke specific session | `{ sessionId }` |

#### 📝 Murmurs Module (`/api/v1`)

| Endpoint | Method | Description | Guards |
|----------|--------|-------------|--------|
| `/murmurs` | GET | Get all murmurs | Optional Auth |
| `/murmurs/:id` | GET | Get specific murmur | Optional Auth |
| `/users/:userId/murmurs` | GET | Get user's murmurs | Optional Auth |
| `/me/timeline` | GET | Get following timeline | Auth Required |
| `/me/murmurs` | POST | Create new murmur | Auth Required |
| `/me/murmurs/:id` | DELETE | Delete own murmur | Auth Required |
| `/murmurs/:id/like` | POST | Like a murmur | Auth Required |
| `/murmurs/:id/like` | DELETE | Unlike a murmur | Auth Required |
| `/users/:id/follow` | POST | Follow a user | Auth Required |
| `/users/:id/follow` | DELETE | Unfollow a user | Auth Required |
| `/users/:userId/follow-counts` | GET | Get follow counts | Optional Auth |
| `/users/:userId/is-following` | GET | Check follow status | Auth Required |

### 📚 Swagger API Documentation

The API includes comprehensive Swagger documentation available at:
```
http://localhost:4000/api-docs
```

### 📦 Key Dependencies & Their Purpose

```json
{
  "@nestjs/common": "NestJS core framework",
  "@nestjs/jwt": "JWT token management",
  "@nestjs/passport": "Authentication strategies",
  "@nestjs/swagger": "API documentation",
  "@nestjs/throttler": "Rate limiting",
  "argon2": "Password hashing (more secure than bcrypt)",
  "drizzle-orm": "Type-safe SQL ORM",
  "mysql2": "MySQL database connector",
  "class-validator": "Request validation",
  "class-transformer": "Object transformation",
  "nestjs-pino": "High-performance logging",
  "helmet": "Security headers",
  "cors": "CORS configuration",
  "cookie-parser": "Cookie parsing middleware",
  "resend": "Email service (currently used)",
  "nanoid": "Unique ID generation",
  "moment": "Date manipulation",
  "crypto-js": "Encryption utilities",
  "zod": "Runtime type validation"
}
```

### 📧 Email Service (Resend)

The application uses **Resend** for email services. However, with the free trial of Resend, emails can only be sent to verified admin emails.

**Limitation**: For user verification emails, since trial accounts can only send to admin emails, **manual email verification in the database is required** for testing additional accounts.

To manually verify a user:
```sql
UPDATE users SET emailVerified = NOW() WHERE email = 'user@example.com';
```

---

## 🖥️ Frontend (React + Vite)

### Technology Stack

- **React 19** with TypeScript
- **Vite** for development and building
- **TailwindCSS v4** for styling
- **Shadcn/ui** for UI components
- **React Router v6** for navigation
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Hook Form** with Zod validation
- **Axios** for HTTP requests

### Pages & Features

#### 🔐 Authentication Pages

1. **Login Page** (`/login`)
   - Email/password authentication
   - Form validation with Zod
   - Automatic redirect after login
   - Remember me functionality

2. **Register Page** (`/register`)
   - User registration with email verification
   - Password confirmation validation
   - Automatic email verification trigger

3. **Verify Email Page** (`/verify-email`)
   - Token-based email verification
   - Automatic verification on page load
   - Success/error handling

#### 🏠 Main Application Pages

4. **Timeline Page** (`/`)
   - Public timeline for unauthenticated users
   - Personalized timeline for authenticated users (following)
   - Infinite scroll pagination
   - Create murmur dialog
   - Real-time like/unlike functionality

5. **Profile Page** (`/profile`)
   - User's own profile and murmurs
   - Profile information display
   - Own murmurs with delete functionality

6. **User Profile Page** (`/user/:id`)
   - View other users' profiles
   - Follow/unfollow functionality
   - User's public murmurs
   - Follow counts display

7. **Murmur Detail Page** (`/murmur/:id`)
   - Single murmur view
   - Like/unlike functionality
   - Delete option for own murmurs

8. **Settings Page** (`/settings`)
   - User profile information
   - Active sessions management
   - Session device information
   - Logout from specific devices

### 🎨 UI Components & Libraries

#### Styling & Design
- **TailwindCSS v4**: Utility-first CSS framework
- **Shadcn/ui**: Modern, accessible React components
- **Lucide React**: Beautiful icon library
- **Class Variance Authority**: Type-safe component variants

#### Form Management
- **React Hook Form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Zod integration for validation
- **Zod**: Runtime type validation and schema definition

#### Data Fetching & State Management
- **TanStack Query**: Server state management with caching, background updates
- **Axios**: HTTP client with interceptors
- **Zustand**: Lightweight state management for auth state

#### UI Enhancement
- **Sonner**: Beautiful toast notifications
- **Date-fns**: Date formatting and manipulation
- **React Router Dom**: Client-side routing

### 🔒 Authentication Flow

1. **Protected Routes**: Automatic redirect to login for unauthenticated users
2. **Token Management**: Automatic token refresh using axios interceptors
3. **Secure Storage**: Encrypted localStorage for sensitive data
4. **Session Management**: Track multiple device sessions

### 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints using Tailwind utilities
- Mobile drawer navigation
- Touch-friendly interactions

---

## 🗄️ Database (MySQL)

### Database Structure

The application uses MySQL 8.x with the following key features:
- **Docker containerization** for easy setup
- **Drizzle ORM** for type-safe database operations
- **Migration system** for schema versioning
- **Connection pooling** for performance

### Tables Overview

1. **users**: Core user information and authentication
2. **accounts**: OAuth provider accounts (prepared for future)
3. **sessions**: User session tracking across devices
4. **verificationTokens**: Email verification tokens
5. **murmurs**: User posts/content
6. **likes**: Murmur like relationships
7. **follows**: User follow relationships

---

## 🔐 Environment Variables

### Backend (.env)

Create `server/.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=mysql://user:password@localhost:3306/venturas
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-key-for-refresh-tokens
MAIL_FROM=admin@yourdomain.com
RESEND_API_KEY=your_resend_api_key

# Token expiration examples:
JWT_ACCESS_TOKEN_EXPIRES_IN=10m         # Access token valid for 10 minutes
JWT_REFRESH_TOKEN_EXPIRES_IN=30d        # Refresh token valid for 30 days
# Or use longer/shorter durations as needed:
# JWT_ACCESS_TOKEN_EXPIRES_IN=2m        # 2 minutes
# JWT_REFRESH_TOKEN_EXPIRES_IN=365d     # 365 days (1 year)
```

#### Frontend Environment Variables

Create a `.env` file in `src/` for the frontend (React):

```env
# All frontend environment variables must be prefixed with VITE_
VITE_API_BASE_URL=http://localhost:4000/api/v1
# Example: VITE_API_BASE_URL can be set to your backend API root

# Add other variables as needed, for example:
# VITE_SOME_PUBLIC_KEY=your-public-key
```

### Example Environment Files

Example files are provided:
- `server/.env.example`
- `src/.env.example`

### Type-Safe Environment Variable Management (`env.ts`)

This project uses **@t3-oss/env-core** and **zod** for type-safe, declarative environment variable management in both backend and frontend.

#### Backend

- All environment variables are defined and validated in [`server/src/lib/env.ts`](server/src/lib/env.ts).
- Uses `createEnv` from `@t3-oss/env-core` and Zod schemas for validation.
- Loads variables from `.env` and throws an error if any are missing or invalid.
- Example usage:
  ```typescript
  import { env } from './lib/env';
  const dbUrl = env.DATABASE_URL;
  ```

#### Frontend

- All environment variables are defined and validated in [`src/lib/env.ts`](src/lib/env.ts).
- Uses `createEnv` from `@t3-oss/env-core` and Zod schemas for validation.
- All frontend variables must be prefixed with `VITE_` (as required by Vite).
- Example usage:
  ```typescript
  import { env } from '../lib/env';
  const apiUrl = env.VITE_API_URL;
  ```

**Benefits:**  
- Type safety and autocompletion for environment variables  
- Fail-fast on missing or invalid variables  
- Consistent approach for both backend and frontend

**Dependencies:**  
- [`@t3-oss/env-core`](https://www.npmjs.com/package/@t3-oss/env-core)  
- [`zod`](https://zod.dev/)

---

## 🧪 Development & Testing

### Available Scripts

#### Backend
```bash
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run start:prod     # Run production build
npm run db:generate    # Generate database migrations
npm run db:migrate     # Run database migrations
npm run db:push        # Push schema changes to DB
npm run db:studio      # Open Drizzle Studio
npm run lint           # Lint TypeScript files
npm run test           # Run tests
```

#### Frontend
```bash
yarn dev               # Development mode
yarn build             # Build for production
yarn start             # Preview production build
yarn lint              # Lint code
yarn lint:fix          # Fix linting issues
yarn test              # Run tests
```

### 🔍 Debugging & Monitoring

- **Pino Logger**: High-performance structured logging
- **Request/Response Logging**: Detailed API call logging
- **Error Tracking**: Comprehensive error handling
- **Development Tools**: React DevTools, TanStack Query DevTools

---

## 📝 Usage Instructions

1. **Start the application** following the installation guide
2. **Register a new account** - email verification will be sent
3. **For testing additional accounts**: Manually verify emails in database
4. **Create murmurs** up to 280 characters
5. **Follow other users** to see their posts in your timeline
6. **Like and interact** with murmurs
7. **Manage sessions** in the settings page

---

## 🛡️ Security Features

- **Password Hashing**: Argon2 for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend origin
- **Rate Limiting**: Throttling to prevent abuse
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **XSS Protection**: Helmet security headers
- **Encrypted Storage**: AES encryption for sensitive frontend data

---

## 🔄 API Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Pagination Response
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 📞 Support

For questions or issues:
1. Check the Swagger documentation at `/api-docs`
2. Review the application logs
3. Ensure all environment variables are properly set
4. Verify database connection and migrations

---

This application demonstrates modern full-stack development practices with TypeScript, secure authentication, real-time features, and responsive design.
