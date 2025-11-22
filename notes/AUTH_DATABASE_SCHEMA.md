# Authentication System Database Schema

## Overview
The authentication system adds three key components to the database schema:

1. **Session Model** - Stores active JWT session tokens
2. **EmailVerificationToken Model** - Stores email verification tokens
3. **User Model Extensions** - New fields for auth and OAuth

## Schema Details

### Session Model

Stores JWT session tokens for authenticated users.

```prisma
model Session {
  id        String   @id @default(cuid())      // Unique session ID
  userId    String                              // References User
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique                    // JWT token (unique constraint for fast lookup)
  expiresAt DateTime                            // Session expiration timestamp
  createdAt DateTime @default(now())            // Session creation timestamp
  
  @@index([userId])    // Index for queries: "Find sessions for user X"
  @@index([token])     // Index for queries: "Find session by token"
}
```

**Purpose**: 
- Persists JWT tokens in database instead of relying only on client-side storage
- Enables session revocation (logout) by deleting records
- Allows checking token validity and expiration server-side
- Indexes ensure fast lookups for both user-based and token-based queries

**Lifecycle**:
- Created: When user logs in or registers
- Used: On every authenticated request (middleware validates token existence)
- Deleted: Automatically when token expires, or on logout (revocation)

**Example Data**:
```
id: "clx9k8v9g0001l10x4k5k5k5k"
userId: "clx9k8v9g0000l10x4k5k5k5k"
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
expiresAt: 2025-11-23T10:30:00Z
createdAt: 2025-11-16T10:30:00Z
```

### EmailVerificationToken Model

Stores one-time email verification tokens.

```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())      // Unique token ID
  userId    String                              // References User
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  email     String                              // User's email (for verification matching)
  tokenHash String                              // SHA-256 hash of the token
  createdAt DateTime @default(now())            // Token creation timestamp
  expiresAt DateTime                            // Token expiration (24 hours from creation)
  
  @@index([userId])    // Index for queries: "Find tokens for user X"
  @@index([email])     // Index for queries: "Find token by email"
}
```

**Purpose**:
- Stores hashed email verification tokens (not plain text for security)
- Links tokens to users and their email addresses
- Enables verification without directly storing the token in the browser
- Supports token expiration (24-hour window)

**Security Considerations**:
- Tokens are hashed with SHA-256 before storage (original sent via email only)
- Each token is single-use (deleted after verification)
- Expired tokens are automatically cleaned up
- Email is stored for verification matching (recipient must own email)

**Lifecycle**:
- Created: On user registration, token generated and hashed
- Used: Verification link emailed to user, user clicks link or enters token
- Verified: Frontend sends token + email, backend hashes and compares
- Deleted: After successful verification or expiration

**Example Data**:
```
id: "clx9k8v9g0002l10x4k5k5k5k"
userId: "clx9k8v9g0000l10x4k5k5k5k"
email: "user@example.com"
tokenHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"  // SHA-256(token)
createdAt: 2025-11-16T10:30:00Z
expiresAt: 2025-11-17T10:30:00Z  // 24 hours later
```

### User Model Extensions

Added authentication-related fields to the existing User model.

```prisma
model User {
  // Existing fields (unchanged)
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  password    String?                          // Kept for backward compatibility
  provider    String   @default("credentials")
  firebaseUid String?  @unique
  roleId      String   @default("student")
  role        Role     @relation(fields: [roleId], references: [id])
  subscription String?                         // Stripe subscription status
  subscriptionStartDate DateTime?
  stripeCustomerId String? @unique
  
  // NEW: Password authentication fields
  passwordHash String?                         // Bcrypt hashed password
  emailVerified Boolean @default(false)        // Email verification status
  
  // NEW: OAuth provider fields
  googleId    String?  @unique                 // Google OAuth user ID
  googleEmail String?                          // Email from Google account
  facebookId  String?  @unique                 // Facebook OAuth user ID
  facebookEmail String?                        // Email from Facebook account
  
  // Relations
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lessons     Lesson[]
  userProgress UserProgress[]
  chats       Chat[]
  sessions    Session[]                        // NEW: Sessions for this user
  emailTokens EmailVerificationToken[]         // NEW: Verification tokens
}
```

**New Fields Explained**:

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `passwordHash` | String? | Bcrypt hash of password | `$2b$10$N9qo8uLO...` |
| `emailVerified` | Boolean | Whether email is verified | `true` |
| `googleId` | String? | Google OAuth user ID | `118287123456789012345` |
| `googleEmail` | String? | Email from Google account | `user@gmail.com` |
| `facebookId` | String? | Facebook OAuth user ID | `123456789012345` |
| `facebookEmail` | String? | Email from Facebook account | `user@facebook.com` |

## Data Flow Examples

### Registration Flow

```
1. User submits: email, name, password
   ↓
2. Backend creates User:
   - passwordHash = bcrypt(password)
   - emailVerified = false
   - googleId, facebookId = null
   ↓
3. Backend creates EmailVerificationToken:
   - tokenHash = sha256(generated_token)
   - email = user's email
   - expiresAt = now + 24 hours
   ↓
4. Backend creates Session:
   - token = JWT(userId)
   - expiresAt = now + 7 days
   ↓
5. User receives email with token link
```

### Email Verification Flow

```
1. User clicks link: /verify-email?token=<token>&email=<email>
   ↓
2. Frontend: POST /api/auth/verify-email
   - Send token and email
   ↓
3. Backend:
   - Hash token: tokenHash = sha256(token)
   - Find EmailVerificationToken by email + tokenHash
   - Check not expired
   - Update User: emailVerified = true
   - Delete EmailVerificationToken row
   ↓
4. Account now verified and can login
```

### Login Flow

```
1. User enters: email, password
   ↓
2. Backend: POST /api/auth/login
   - Find User by email
   - Compare password with User.passwordHash using bcrypt
   - Create Session
   - Set sessionToken cookie
   ↓
3. Frontend receives cookie, logged in
```

### OAuth Connection Flow

```
1. Authenticated user clicks "Connect Google"
   ↓
2. OAuth callback returns: provider_id, provider_email
   ↓
3. Frontend: POST /api/auth/connect-provider
   - Send from session (proves authenticated)
   - Send provider info
   ↓
4. Backend:
   - Get User from session
   - Validate provider_email matches User.email
   - Update User: googleId = provider_id
   - Return success
   ↓
5. Google now linked to account
```

## SQL Representation

The Prisma models translate to these SQL tables:

```sql
-- Session table
CREATE TABLE "Session" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX Session_userId_idx ON "Session"(userId);
CREATE INDEX Session_token_idx ON "Session"(token);

-- EmailVerificationToken table
CREATE TABLE "EmailVerificationToken" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  email TEXT NOT NULL,
  tokenHash TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX EmailVerificationToken_userId_idx ON "EmailVerificationToken"(userId);
CREATE INDEX EmailVerificationToken_email_idx ON "EmailVerificationToken"(email);

-- User table additions
ALTER TABLE "User" ADD COLUMN passwordHash TEXT;
ALTER TABLE "User" ADD COLUMN emailVerified BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN googleId TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN googleEmail TEXT;
ALTER TABLE "User" ADD COLUMN facebookId TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN facebookEmail TEXT;
```

## Indexes & Performance

### Why These Indexes?

**Session table**:
- `@@index([userId])`: Fast lookup of all sessions for a user (cleanup, logout all)
- `@@index([token])`: Fast validation of token on each request (critical for performance)

**EmailVerificationToken table**:
- `@@index([userId])`: Find tokens by user (cleanup expired tokens)
- `@@index([email])`: Find token by email address (verification endpoint)

### Query Examples

```javascript
// Fast: Indexed by token
const session = await db.session.findUnique({
  where: { token: sessionToken }
});

// Fast: Indexed by userId
const sessions = await db.session.findMany({
  where: { userId }
});

// Fast: Indexed by email
const token = await db.emailVerificationToken.findFirst({
  where: { email }
});

// Slow without index (but user email is already unique)
const user = await db.user.findUnique({
  where: { googleId: providerId }
});
```

## Migration

Run this to apply schema changes:

```bash
cd backend
npx prisma migrate deploy
```

This executes the SQL in `migrations/20241220_add_auth_system/migration.sql`

## Cleanup Tasks

The system includes automatic cleanup:

1. **Expired Sessions**: Deleted when `getSession()` is called and expiry check fails
2. **Expired Verification Tokens**: Deleted after email verification or on next lookup
3. **Orphaned Sessions**: Cascade delete when user is deleted

## Monitoring & Debugging

### Check Active Sessions
```sql
SELECT COUNT(*) FROM "Session"
WHERE expiresAt > NOW();
```

### Check Pending Verifications
```sql
SELECT email, expiresAt FROM "EmailVerificationToken"
WHERE expiresAt > NOW();
```

### Check OAuth Connections
```sql
SELECT email, googleId, facebookId
FROM "User"
WHERE googleId IS NOT NULL OR facebookId IS NOT NULL;
```

### Check User Status
```sql
SELECT email, emailVerified, subscription, googleId, facebookId
FROM "User"
WHERE email = 'user@example.com';
```
