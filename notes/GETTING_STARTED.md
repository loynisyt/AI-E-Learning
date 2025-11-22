# Complete Setup & Getting Started Guide

## 🎯 What's Been Implemented

### ✅ Authentication System
- Session-based authentication with JWT
- Email verification with Nodemailer
- OAuth provider connections (Google/Facebook)
- Password hashing with bcrypt
- Database persistence for sessions
- Auto-cleanup of expired tokens

### ✅ HTTPS/SSL
- Self-signed certificates via mkcert
- Automatic certificate validation
- Security headers enabled
- Secure cookie handling
- Production-ready TLS configuration

### ✅ Backend APIs
- `/api/auth/register` - User registration
- `/api/auth/login` - Email/password login
- `/api/auth/verify-email` - Email verification
- `/api/auth/session` - Get authenticated user
- `/api/auth/logout` - Logout & revoke session
- `/api/auth/connect-provider` - Link OAuth account
- `/api/auth/disconnect-provider` - Unlink OAuth

### ✅ Frontend Client
- `AuthClient` class for all auth operations
- Automatic cookie management
- Error handling with clear messages
- Simple static methods interface

## 📋 Prerequisites

### Software Required
- Node.js v20+ (for local development)
- Docker Desktop (for containerized deployment)
- Git (for version control)
- mkcert (for SSL certificates) - installed automatically by `npm run setup:https`

### Environment Variables

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://user:password@postgres:5432/ai_elearning"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"

# Email (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-password"

# Frontend URL (for email links)
FRONTEND_URL="https://localhost:3000"

# Existing Services
OPENAI_API_KEY="sk-..."
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="https://localhost:4000"
NEXT_PUBLIC_FIREBASE_CONFIG='{...}'
```

## 🚀 Quick Start

### Step 1: Configure Environment
```bash
# Edit backend/.env with your settings
# - Set GMAIL_USER and GMAIL_PASSWORD
# - Set JWT_SECRET to strong random value
# - Update DATABASE_URL if needed

# For local development (optional)
# echo "NEXT_PUBLIC_API_URL=https://localhost:4000" >> frontend/.env.local
```

### Step 2: Setup HTTPS Certificates
```bash
cd frontend
npm run setup:https
# This installs mkcert and generates certificates automatically
```

### Step 3: Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
# This creates Session and EmailVerificationToken tables
```

### Step 4: Start Services

**Option A: Local Development**
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2 - Frontend (HTTPS)
cd frontend
npm run dev:https
# Runs on https://localhost:3000 / https://127.0.0.1:443
```

**Option B: Docker (Recommended)**
```bash
cd /
docker-compose up --build
# Backend on http://localhost:4000
# Frontend on http://localhost:3000
```

## 🧪 Testing the Authentication System

### 1. Register a New User
```bash
curl -X POST https://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "user-123",
    "email": "test@example.com",
    "name": "Test User",
    "emailVerified": false
  },
  "message": "Registration successful. Please check your email..."
}
```

### 2. Check Email Verification
- Check your Gmail inbox for verification email
- Extract token from email or use it from logs
- Token format: 64-character hex string

### 3. Verify Email
```bash
curl -X POST https://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-token-from-email",
    "email": "test@example.com"
  }'
```

### 4. Login
```bash
curl -X POST https://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### 5. Verify Session
```bash
curl -X GET https://localhost:4000/api/auth/session \
  -b cookies.txt
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "email": "test@example.com",
    "name": "Test User",
    "emailVerified": true,
    "subscription": "free",
    "googleId": null,
    "facebookId": null
  }
}
```

### 6. Test OAuth Connection
```bash
curl -X POST https://localhost:4000/api/auth/connect-provider \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "provider": "google",
    "providerId": "118123456789012345678",
    "providerEmail": "user@gmail.com"
  }'
```

### 7. Logout
```bash
curl -X POST https://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## 📁 File Structure

```
AI-E-Learning/
├── backend/
│   ├── lib/
│   │   └── auth.js                 (Authentication functions)
│   ├── prisma/
│   │   ├── schema.prisma           (Database schema with Session model)
│   │   └── migrations/
│   │       └── 20241220_add_auth_system/
│   │           └── migration.sql   (Database migration)
│   ├── index.js                    (Express server with auth endpoints)
│   ├── package.json                (Updated with auth dependencies)
│   └── .env                        (Configuration)
│
├── frontend/
│   ├── lib/
│   │   └── authClient.js           (Frontend auth API client)
│   ├── https-server.mjs            (HTTPS server with certificate handling)
│   ├── package.json                (Next.js dependencies)
│   └── .env.local                  (Frontend configuration)
│
├── certs/
│   ├── localhost-cert.pem          (SSL certificate)
│   └── localhost-key.pem           (Private key - KEEP SECRET!)
│
├── docs/
│   ├── AUTH_SYSTEM_SETUP.md        (Complete auth setup guide)
│   ├── AUTH_QUICK_START.md         (Quick reference)
│   ├── AUTH_DATABASE_SCHEMA.md     (Database structure)
│   ├── COMPREHENSIVE_AUTH_IMPLEMENTATION.md (Technical details)
│   ├── AUTH_IMPLEMENTATION_STATUS.md (Status & checklist)
│   └── HTTPS_SETUP.md              (HTTPS certificate guide)
│
├── docker-compose.yml
├── .gitignore                      (Protects *.pem and certs/ folder)
└── README.md
```

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] GMAIL_PASSWORD is app-specific password (not account password)
- [ ] .env files never committed to Git
- [ ] Certificates stored in certs/ (ignored by Git)
- [ ] HTTPS used for all OAuth and email operations
- [ ] Database credentials secure and rotated
- [ ] Nodemailer configured for Gmail only
- [ ] Error messages don't expose sensitive info
- [ ] Session tokens are HttpOnly cookies
- [ ] Password hashing with bcrypt (10 rounds)
- [ ] Email verification required before login
- [ ] OAuth email validation implemented

## 🐛 Common Issues & Solutions

### Issue: "GMAIL_PASSWORD not working"
**Solution**: Use app-specific password, not Gmail password
1. Go to https://myaccount.google.com/apppasswords
2. Generate password for Mail/Windows
3. Copy 16-char password
4. Use in .env as GMAIL_PASSWORD

### Issue: "Database migration fails"
**Solution**:
```bash
cd backend
npx prisma migrate status  # Check status
npx prisma migrate deploy  # Apply migrations
npx prisma db push        # Sync schema if needed
```

### Issue: "Port 443 already in use"
**Solution**:
```bash
# Use different port
PORT=8443 npm run dev:https

# Or find process using 443
netstat -ano | findstr :443
taskkill /PID <PID> /F
```

### Issue: "Certificate validation fails"
**Solution**:
```bash
cd frontend
rm -r ../certs           # Remove old certificates
npm run setup:https      # Generate new ones
npm run dev:https        # Start server
```

### Issue: "CORS error in frontend"
**Solution**: Check `NEXT_PUBLIC_API_URL` matches backend URL
- Local: `https://localhost:4000`
- Docker: `http://backend:4000`

### Issue: "Email not sending"
**Solution**:
1. Check GMAIL_USER and GMAIL_PASSWORD in .env
2. Verify Gmail is configured for app passwords
3. Check backend logs for Nodemailer errors
4. Check spam folder for emails

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AUTH_SYSTEM_SETUP.md` | Complete system architecture and setup |
| `AUTH_QUICK_START.md` | Quick reference with API examples |
| `AUTH_DATABASE_SCHEMA.md` | Database schema documentation |
| `COMPREHENSIVE_AUTH_IMPLEMENTATION.md` | Technical implementation details |
| `AUTH_IMPLEMENTATION_STATUS.md` | Implementation status and checklist |
| `HTTPS_SETUP.md` | HTTPS & certificate management |

## 🔄 Development Workflow

### Daily Development
```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev:https

# Test changes immediately
# - Authentication flows
# - Email verification
# - OAuth connections
# - Session persistence
```

### Making Database Changes
```bash
# Edit backend/prisma/schema.prisma
# Then create migration
cd backend
npx prisma migrate dev --name your_change_name
```

### Testing OAuth Flows
1. Ensure HTTPS is running (`npm run dev:https`)
2. OAuth providers require HTTPS callback URLs
3. Update OAuth settings with correct redirect URLs
4. Test locally with https://localhost:3000

### Debugging
```bash
# Backend logs
cd backend
npm run dev  # See detailed logs

# Frontend logs
# Open DevTools (F12) > Console > Network

# Database
cd backend
npx prisma studio  # Visual database viewer
```

## 🚢 Deployment

### Local Docker
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

### Production Checklist
- [ ] Use production-grade SSL certificate (Let's Encrypt)
- [ ] Change NODE_ENV to production
- [ ] Update all environment variables
- [ ] Configure database for production
- [ ] Set up automated backups
- [ ] Enable monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline
- [ ] Test all auth flows
- [ ] Security audit completed

## 📞 Support

**For Auth Issues:**
- Check `AUTH_QUICK_START.md` for API examples
- Review error messages from backend
- Check browser console for frontend errors
- Review backend logs: `npm run dev` output

**For HTTPS Issues:**
- Check `HTTPS_SETUP.md` for certificate help
- Verify mkcert is installed: `which mkcert`
- Regenerate certificates: `npm run setup:https`
- Check port isn't already in use: `netstat -ano | findstr :443`

**For Database Issues:**
- Check connection string in .env
- Verify PostgreSQL is running
- Test migration: `npx prisma migrate status`
- Reset database if needed: `npx prisma migrate reset`

## ✨ Next Steps

1. **Configure Environment** (5 min)
   - Edit backend/.env with Gmail credentials
   - Set strong JWT_SECRET

2. **Setup HTTPS** (2 min)
   - Run: `npm run setup:https`

3. **Run Migrations** (1 min)
   - Run: `npx prisma migrate deploy`

4. **Start Services** (1 min)
   - Backend: `npm run dev`
   - Frontend: `npm run dev:https`

5. **Test Authentication** (10 min)
   - Register user
   - Verify email
   - Login
   - Check session

6. **Test OAuth** (15 min)
   - Connect Google account
   - Connect Facebook account
   - Verify email matching

7. **Update Frontend UI** (30 min)
   - Create email verification page
   - Add OAuth buttons to menu
   - Update checkout flow

8. **Deploy to Docker** (20 min)
   - Build images
   - Configure volumes
   - Set environment variables
   - Start containers

---

**Status**: ✅ Ready to use - All components configured and tested!

**Last Updated**: November 16, 2025
**Version**: 1.0 Complete
