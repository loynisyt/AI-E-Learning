# Refactor Plan for Firebase Authentication + Supabase User Profiles + Directus CMS Integration

## 1. Backend Refactor

### Auth APIs
- Refactor /api/auth/login and /api/auth/register to:
  - Accept Firebase ID tokens.
  - Verify tokens using Firebase Admin SDK.
  - On successful verification, query Postgres (Supabase) user profile by Firebase UID/email.
  - For register, ensure user profile created in Supabase linked to Firebase UID.
  - Remove direct password/auth handling from backend (delegated to Firebase).
- Refactor /api/auth/connect-provider to:
  - Link OAuth provider info into Supabase user profile.
  - Use Firebase UID/email to identify user.
- Update session management to rely on Firebase tokens only, no custom JWT.

### Data Access
- Use Prisma ORM with Supabase Postgres for user profile queries and updates.
- Query only personal user data (name, gender, email, Firebase UID etc).
- No auth data stored here; all auth done by Firebase.

## 2. Frontend Integration

- Keep current login UI unchanged; integrate Firebase email link sign-in and social login flows.
- Update API fetch to backend with Firebase tokens for protected resource access.
- Fetch user profile from backend API that queries Supabase.

## 3. Testing

- Test login and register using Firebase email link and social sign-ins.
- Test user profile creation and retrieval from Supabase.
- Test provider linking via connect-provider API.
- Test session persistence and token validation flow.
- Test CMS content management unaffected by auth changes.

## 4. Deployment

- Ensure Docker compose supports:
  - Next.js frontend/backend
  - Firebase configuration and environment variables for Admin SDK
  - Supabase/Postgres for user data
  - Directus CMS for content management with access to Postgres

---

Upon your approval, I will proceed to implement these backend refactors and frontend API adjustments stepwise as per this plan.
