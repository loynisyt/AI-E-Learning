# TODO: Implement Dashboard + Course Flow with Directus (Routing Fixed)

## Step 1: Routing Fixed
- [x] Routing is now working; skip to implementation.

## Step 2: Implement Dashboard & Navigation
- [x] Dashboard and navigation are good as per user confirmation.

## Step 3: Implement Course & Lesson Flow with Placeholders
- [ ] Update frontend/app/courses/page.js: Add at least 1 placeholder course (hardcoded or Directus) for testing.
- [ ] Update frontend/app/courses/[id]/page.js: Add placeholder lessons/topics with "Start learning" buttons.
- [ ] Update frontend/app/courses/[id]/lesson/[lessonId]/page.js: Add placeholder lesson with video placeholder, text/content, multiple topics, top buttons (Lesson/Exercise).
- [ ] Update frontend/app/exercise/[id]/page.js: Add placeholder exercise with AI tools list, docs/how-to, downloadable assets, video exercise.

## Step 4: Directus Integration & Data Model
- [ ] Create directus-schema.txt: Define collections (courses, lessons, topics, exercises, ai_tools, user_progress) with fields, types, relations.
- [ ] Provide sample JSON for import (at least 1 course, 1 lesson, 1 exercise).
- [ ] Explain progress computation (based on lessons and user_progress), storage (Directus or local fallback).
- [ ] Implement fetch patterns (client/server side), set env vars (NEXT_PUBLIC_DIRECTUS_URL).
- [ ] Use public endpoints; proxy admin calls via API routes if needed.

## Step 5: Profile Form
- [ ] Update frontend/app/profile/page.js: Add Material UI form for 1/2 name, date of birth, email, profile picture (pfp).

## Step 6: Settings, Translations & Persistence
- [x] Implement Settings page: language (EN/PL) switch with persistence, dark mode toggle (localStorage), voice output (On/Off), voice quality select, volume slider, contact support POST.
- [ ] Set up translation structure (central i18n file or next-intl for app-router) for language switching.
- [ ] Persist settings locally; note optional Directus sync later.

## Step 7: Accessibility & Responsiveness
- [ ] Ensure responsive mobile/desktop, accessible buttons, keyboard navigation, semantic HTML.

## Step 8: Security & Env Vars
- [ ] Confirm no admin tokens exposed to client; use server-side for sensitive calls.

## Step 9: API Endpoints
- [ ] Outline /api/contact (POST for support), server-side Directus proxy if needed.

## Step 10: Testing & Verification
- [ ] Test Directus: Import sample data, verify fetches.
- [ ] Test features: Language switch, dark mode, voice settings, contact form, profile form.
- [ ] Test placeholders: Course, lesson, exercise with video.
- [ ] Run dev/build steps as per instructions.

## Step 11: Final Review & Deployment
- [ ] Review all changes, ensure compatibility with Vercel/Netlify.
- [ ] Update README with instructions.
