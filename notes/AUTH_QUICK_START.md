# Auth System Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (if needed)
cd ../frontend
npm install
```

### 2. Update Environment Variables

**Backend (`backend/.env`)**
```
# Database
DATABASE_URL="postgresql://user:password@host:5432/ai_elearning"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-here-min-32-characters"

# Email Configuration (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-specific-password"

# Frontend URL (for email verification links)
FRONTEND_URL="http://localhost:3000"

# Existing settings
OPENAI_API_KEY="sk-..."
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

**Frontend (`frontend/.env.local`)**
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_FIREBASE_CONFIG='{...}'
```

### 3. Gmail Setup

To use email verification with Gmail:

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate an app password
4. Copy the 16-character password
5. Use it as `GMAIL_PASSWORD` in `.env`
6. Use your Gmail address as `GMAIL_USER`

**Note**: Regular Gmail password won't work with Nodemailer. You MUST use an app-specific password.

### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

This creates the Session and EmailVerificationToken tables.

### 5. Start the Backend

```bash
cd backend
npm run dev
```

### 6. Start the Frontend

```bash
cd frontend
npm run dev
# or for HTTPS
npm run dev:https
```

## API Endpoint Reference

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}

Response: 201 Created
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

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
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

#### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email-verification-token-from-email",
  "email": "user@example.com"
}

Response: 200 OK
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "emailVerified": true
  },
  "message": "Email verified successfully"
}
```

#### Get Current Session
```
GET /api/auth/session
Cookie: sessionToken=<valid-session-token>

Response: 200 OK
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "subscription": "premium",
    "googleId": "google-user-id-or-null",
    "facebookId": "facebook-user-id-or-null"
  }
}
```

#### Logout
```
POST /api/auth/logout
Cookie: sessionToken=<valid-session-token>

Response: 200 OK
{
  "message": "Logout successful"
}
```

#### Connect OAuth Provider
```
POST /api/auth/connect-provider
Content-Type: application/json
Cookie: sessionToken=<valid-session-token>

{
  "provider": "google",
  "providerId": "google-user-id",
  "providerEmail": "user@gmail.com"
}

Response: 200 OK
{
  "user": {
    "id": "user-id",
    "googleId": "google-user-id",
    "facebookId": null
  },
  "message": "google account connected successfully"
}

Error: 400 Bad Request (if emails don't match)
{
  "error": "Email mismatch: user@example.com != different@gmail.com. Please use the same email..."
}
```

#### Disconnect OAuth Provider
```
POST /api/auth/disconnect-provider
Content-Type: application/json
Cookie: sessionToken=<valid-session-token>

{
  "provider": "google"
}

Response: 200 OK
{
  "user": {
    "id": "user-id",
    "googleId": null
  },
  "message": "google account disconnected successfully"
}
```

## Frontend Usage

### Using AuthClient in Components

```javascript
'use client';

import { useState } from 'react';
import AuthClient from '@/lib/authClient';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await AuthClient.login(email, password);
      console.log('Login successful:', result.user);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Check Authentication Status

```javascript
'use client';

import { useEffect, useState } from 'react';
import AuthClient from '@/lib/authClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AuthClient.getSession();
        if (session) {
          setUser(session.user);
        } else {
          // Not authenticated, redirect to login
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Session check failed:', err);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Subscription: {user?.subscription || 'Free'}</p>
    </div>
  );
}
```

## Troubleshooting

### Email Not Sending
**Problem**: Verification emails not arriving

**Solution**:
1. Check `GMAIL_USER` and `GMAIL_PASSWORD` in `.env`
2. Verify app password is 16 characters (not your Gmail password)
3. Check Gmail "Less secure app access" is enabled
4. Check backend console for Nodemailer errors
5. Check spam folder

### Session Not Persisting
**Problem**: User logs out after page refresh

**Solution**:
1. Verify `sessionToken` cookie is being set (check DevTools > Application > Cookies)
2. Check `CORS` settings allow credentials: `credentials: 'include'`
3. Verify backend CORS includes your frontend URL
4. Check database Session table has valid records

### Email Verification Link Not Working
**Problem**: Clicking verification link shows error

**Solution**:
1. Check token is correctly passed in URL query string
2. Verify email in URL matches database email
3. Check token hasn't expired (24-hour window)
4. Check backend logs for EmailVerificationToken lookup errors

### OAuth Connection Failing
**Problem**: Error connecting Google/Facebook account

**Solution**:
1. Verify user is authenticated (check session)
2. Verify email from OAuth provider matches account email
3. Check provider ID is correct format (should be a long string)
4. Verify provider isn't already connected to another user

## Testing Checklist

- [ ] Backend starts: `npm run dev` in `/backend`
- [ ] Frontend starts: `npm run dev` in `/frontend`
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Can register user: Test registration endpoint
- [ ] Verification email sent: Check email inbox/logs
- [ ] Can verify email: Click link or enter token
- [ ] Can login: Use verified email + password
- [ ] Session persists: Refresh page, still logged in
- [ ] Can logout: Session revoked, redirected to login
- [ ] Can connect provider: Tested with Google/Facebook
- [ ] Email validation works: Try different email than account
- [ ] Authenticated user can upgrade: No redirect to login

## Important Security Notes

⚠️ **HTTPS Required for Production**
- OAuth and email verification require HTTPS
- Use proper SSL certificates (not self-signed in production)
- Update `FRONTEND_URL` to use https:// in production

⚠️ **JWT Secret**
- Generate a strong random secret (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"`)
- Keep it secret and unique per environment
- Change it if you suspect compromise

⚠️ **Password Requirements**
- Users should be prompted to use strong passwords
- Consider adding password strength validation on frontend
- Never log passwords
- Always hash before storage (bcrypt does this)

⚠️ **Cookie Security**
- `HttpOnly` flag prevents JavaScript access (already enabled)
- `Secure` flag for HTTPS only (automatically set in production)
- `SameSite=Strict` prevents CSRF (already enabled)

## Next Steps

1. **Create Email Verification Page**: `/app/verify-email/page.js`
2. **Add OAuth Buttons to Menu**: Update AppMenu component
3. **Update Checkout Flow**: Require authentication before payment
4. **Set Up Docker HTTPS**: Configure nginx with SSL certificates
5. **Test Full User Journey**: Register → Verify → Login → Upgrade
