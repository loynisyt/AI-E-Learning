# Backend and Authentication Implementation Plan

## 1. Database Schema Updates
- [ ] Add Role model to Prisma schema
- [ ] Add roleId to User model
- [ ] Add permissions/roles to content models if needed
- [ ] Run Prisma migrations

## 2. Authentication Consolidation
- [ ] Update backend to use Firebase for all authentication (email/password, Google, Facebook)
- [ ] Replace custom JWT with Firebase token validation in all endpoints
- [ ] Add middleware for Firebase token verification
- [ ] Update login/register endpoints to use Firebase
- [ ] Ensure social login endpoints work with Firebase

## 3. Directus CMS Integration
- [ ] Create Directus client with proper authentication
- [ ] Add endpoints for educational content CRUD via Directus API
- [ ] Implement role-based permissions for content access
- [ ] Add content types (courses, lessons, etc.) in Directus
- [ ] Update frontend Directus client if needed

## 4. Role-Based Permissions
- [ ] Implement role middleware (admin, instructor, student)
- [ ] Add permission checks to all protected endpoints
- [ ] Update user creation to assign default roles

## 5. Docker Configuration
- [ ] Update docker-compose.yml for proper networking
- [ ] Ensure environment variables are injected correctly
- [ ] Add Directus volumes and configs
- [ ] Test build commands in Docker

## 6. Error Handling and Validation
- [ ] Add comprehensive error handling to all endpoints
- [ ] Input validation for all API requests
- [ ] Proper HTTP status codes and error messages

## 7. Testing and Documentation
- [ ] Test all authentication flows
- [ ] Test Directus content operations
- [ ] Update README with Docker run instructions
- [ ] Ensure no hardcoded secrets (use env vars only)
