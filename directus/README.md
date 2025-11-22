Directus setup notes for AI-E-Learning

This README explains how to set up Directus collections to manage courses, lessons, modules, submodules, topics, exercises, ai_tools and user_progress.

1) Quick steps (Directus UI)
- Start Directus (docker-compose or local).
- Login as admin.
- Create the following collections (use the names exactly): courses, lessons, modules, submodules, topics, exercises, ai_tools, user_progress.
- For file fields, use the Directus Files relation type.
- For relations, use many-to-one or many-to-many as described in `directus-schema.txt`.

2) Environment
- FRONTEND expects `NEXT_PUBLIC_DIRECTUS_URL` set to the Directus base URL (e.g. http://localhost:8055).
- For server-side calls, use `DIRECTUS_STATIC_TOKEN` or the Directus internal URL `DIRECTUS_INTERNAL_URL`.

3) Import/seed
- Use the example JSON in `directus-schema.txt` as a seed for collections.
- Directus supports collection import via the API or use the UI/CLI tool to create fields then import items.

4) Mapping with Prisma
- Option A: Keep content in Directus, Prisma remains for application-only models (users, roles, chats). Backend fetches Directus for content.
- Option B: Mirror Directus collections with Prisma models and run migrations. If you do this, maintain either Directus or Prisma as the source of truth to avoid drift.

5) API tips
- The frontend currently calls the following collection names: `courses`, `lessons`, `topics`, `exercises`, `ai_tools`, `user_progress`. Ensure they exist.
- Example: `directus.items('lessons').readOne(lessonId)` expects the lesson id to be the primary key; use string ids (cuid) to match frontend placeholders.

6) Next steps I can do for you
- Produce an importable Directus JSON describing collections + fields.
- Add Prisma models and a migration to the `backend/prisma/schema.prisma` to match Directus.
- Create seed JSON for import with 1 course/1 lesson/1 module/4 submodules/topics/exercise/ai_tool.

If you want, I can now generate the Directus import JSON and a matching Prisma model patch. Tell me which of these you prefer next: import JSON, Prisma migration, or both.