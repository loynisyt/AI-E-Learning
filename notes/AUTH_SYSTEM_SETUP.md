# Complete Authentication System Setup

## Overview
This document describes the comprehensive authentication system implementation for the AI E-Learning platform, including:
- Session-based authentication with JWT
- Email verification flow
- OAuth provider connection (Google/Facebook)
- Password hashing with bcrypt
- Nodemailer email integration

## Architecture

### Database Schema Updates
Three main additions to `backend/prisma/schema.prisma`:

1. **User Model Fields**
   - `passwordHash`: Bcrypt hashed password for email/password auth
   - `emailVerified`: Boolean flag indicating email verification status
   - `googleId`, `googleEmail`: Google OAuth connection data
   - `facebookId`, `facebookEmail`: Facebook OAuth connection data

2. **Session Model**
   - Stores JWT tokens with expiration
   - Links to User via userId
   - Indexed on both userId and token for fast lookups
   - Expires after 7 days

3. **EmailVerificationToken Model**
   - Stores hashed verification tokens (SHA-256)
   - Links to User via userId
   - Contains user's email for verification
   - Expires after 24 hours
   - Indexed on userId and email for fast lookups

### Backend Authentication Functions (`backend/lib/auth.js`)

#### Password Management
- `hashPassword(password)`: Hash password with bcrypt (10 salt rounds)
- `verifyPassword(password, hash)`: Verify password against hash

#### Session Management
- `createSessionToken(userId)`: Create JWT token (7-day expiry)
- `verifySessionToken(token)`: Verify JWT validity
- `createSession(userId)`: Save session to database
- `getSession(token)`: Retrieve and validate session (auto-deletes expired)
- `revokeSession(token)`: Logout by deleting session

#### Email Verification
- `generateEmailToken()`: Generate random 32-byte hex token
- `hashEmailToken(token)`: SHA-256 hash for storage
- `sendEmailVerificationToken(email, userName, token)`: Send via Gmail/Nodemailer
- `verifyEmailToken(token, email)`: Validate and activate user

#### User Authentication
- `registerUser(email, name, password)`: Create user, hash password, send verification email, create session
- `loginUser(email, password)`: Authenticate and create session

#### OAuth Provider Connection
- `connectOAuthProvider(userId, provider, providerId, email)`: Link OAuth account with email validation
- `disconnectOAuthProvider(userId, provider)`: Unlink OAuth provider

#### Middleware
- `authenticateSession(req, res, next)`: Verify session cookie and attach user to request
- `authenticateFirebaseToken(req, res, next)`: Legacy Firebase authentication (kept for compatibility)
- `requirePermissions(requiredPermissions)`: Check user permissions

### Backend API Endpoints

#### New Session-Based Endpoints

**POST /api/auth/register**
- Register new user with email/password
- Sends verification email
- Returns session object and user info
- Sets sessionToken cookie (HttpOnly, 7-day expiry)

```javascript
// Request
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}

// Response (201)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "message": "Registration successful. Please check your email..."
}
```

**POST /api/auth/login**
- Login with email/password
- Creates session
- Sets sessionToken cookie

```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response (200)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "message": "Login successful"
}
```

**POST /api/auth/verify-email**
- Verify email with token from email link
- Activates user account
- Sets emailVerified to true

```javascript
// Request
{
  "token": "email-verification-token",
  "email": "user@example.com"
}

// Response (200)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "message": "Email verified successfully"
}
```

**GET /api/auth/session** (Protected)
- Get current authenticated user from session
- Requires valid sessionToken cookie
- Returns user info including OAuth connections and subscription

```javascript
// Response (200)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "subscription": "premium",
    "googleId": "google-user-id",
    "facebookId": null
  }
}
```

**POST /api/auth/logout** (Protected)
- Revoke session
- Clears sessionToken cookie

```javascript
// Response (200)
{
  "message": "Logout successful"
}
```

**POST /api/auth/connect-provider** (Protected)
- Connect OAuth provider to existing user
- Validates email match between account and provider
- Prevents duplicate provider connections

```javascript
// Request
{
  "provider": "google",
  "providerId": "google-user-id",
  "providerEmail": "user@gmail.com"
}

// Response (200)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "googleId": "google-user-id",
    "facebookId": null
  },
  "message": "google account connected successfully"
}

// Error (400) if emails don't match
{
  "error": "Email mismatch: user@example.com != different@gmail.com..."
}
```

**POST /api/auth/disconnect-provider** (Protected)
- Disconnect OAuth provider
- Prevents disconnect if no password and no other provider

```javascript
// Request
{
  "provider": "google"
}

// Response (200)
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "googleId": null,
    "facebookId": null
  },
  "message": "google account disconnected successfully"
}
```

### Frontend Authentication Client (`frontend/lib/authClient.js`)

Simple class with static methods for all auth operations:

```javascript
import AuthClient from '@/lib/authClient';

// Register
const result = await AuthClient.register(email, name, password);

// Login
const result = await AuthClient.login(email, password);

// Verify email
const result = await AuthClient.verifyEmail(token, email);

// Get session
const session = await AuthClient.getSession();

// Logout
await AuthClient.logout();

// Connect provider
const result = await AuthClient.connectProvider('google', googleId, googleEmail);

// Disconnect provider
const result = await AuthClient.disconnectProvider('google');
```

## Environment Variables Required

### Backend (.env)
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_elearning"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-password"

# Frontend URL (for email verification links)
FRONTEND_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Firebase
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_FIREBASE_CONFIG={...}
```

## Email Configuration (Gmail)

To use Nodemailer with Gmail:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the app password as GMAIL_PASSWORD (not your actual Gmail password)
4. Set GMAIL_USER to your Gmail address

## Migration Steps

1. **Update Prisma Schema**: Already updated with Session, EmailVerificationToken models
2. **Run Migration**: 
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. **Install Dependencies**: 
   ```bash
   npm install
   ```
4. **Update Environment Variables**: Add GMAIL_USER, GMAIL_PASSWORD, etc.
5. **Restart Backend**: `npm run dev`

## Fixing the "Logged-in Users Redirected to Login" Issue

The core problem was that authenticated users weren't maintaining their session when trying to upgrade their subscription. This is now fixed by:

1. **Session Persistence**: JWT tokens are stored in database with expiration
2. **Cookie-based Authentication**: Sessions are sent via secure HttpOnly cookies
3. **Session Middleware**: All protected endpoints verify session validity before processing
4. **Auto-expiry Cleanup**: Expired sessions are automatically deleted on next lookup

### Updated Stripe Upgrade Flow

When a logged-in user wants to upgrade:
1. Frontend sends upgrade request
2. Backend middleware checks sessionToken cookie
3. User is retrieved from session (session object includes user)
4. Upgrade is processed for authenticated user (NOT redirected to login)
5. Subscription is updated on authenticated user

## Testing the System

### 1. Test Email/Password Registration & Login
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login (after email verification)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Email Verification
- Click link in verification email
- Or use token from email:
```bash
curl -X POST http://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"token-from-email","email":"test@example.com"}'
```

### 3. Test Session Persistence
```bash
# Get session (with valid cookie)
curl -X GET http://localhost:4000/api/auth/session \
  -H "Cookie: sessionToken=your-token"
```

### 4. Test OAuth Connection
```bash
# Connect Google
curl -X POST http://localhost:4000/api/auth/connect-provider \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=your-token" \
  -d '{"provider":"google","providerId":"google-id","providerEmail":"user@gmail.com"}'
```

## Next Steps

1. **Create Email Verification UI**: `/verify-email` page with token input
2. **Create OAuth Buttons**: Add Google/Facebook connect/disconnect buttons in menu
3. **Update Stripe Checkout**: Require authenticated session before upgrade
4. **Docker HTTPS Setup**: Mount certificates and configure nginx reverse proxy
5. **Test End-to-End Flow**: Register → verify email → login → upgrade subscription
