# AI E-Learning Platform

A modern, responsive AI-powered e-learning platform built with Next.js, Material-UI, Firebase Authentication, and PostgreSQL.

## Features

- **AI Coach**: Interactive chat interface with voice input/output capabilities
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Firebase Authentication**: Google and Facebook sign-in integration
- **Theme System**: Light/dark mode with persistent settings
- **Course Management**: Browse and track learning progress
- **Admin Dashboard**: Manage courses and users
- **Directus CMS**: Optional headless CMS integration

## Tech Stack

- **Frontend**: Next.js 15, React 19, Material-UI, Bulma CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth (Google/Facebook)
- **CMS**: Directus (optional)
- **Deployment**: Docker

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Firebase project with Authentication enabled
- Facebook Developer App (for Facebook login)

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-e-learning

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication and add Google/Facebook providers
4. Get your Firebase config from Project Settings
5. Download the service account JSON file for admin SDK

#### Facebook Setup (for Facebook login)
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app and add Facebook Login product
3. Get App ID and App Secret
4. Configure OAuth redirect URIs in Firebase

#### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_e_learning"

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
# ... other Firebase config

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT_JSON="base64-encoded-service-account-json"

# Facebook
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# Directus (optional)
NEXT_PUBLIC_DIRECTUS_URL="http://localhost:8055"
DIRECTUS_STATIC_TOKEN="your-static-token"
```

### 3. Database Setup

```bash
# Run database migrations
cd backend
npx prisma migrate dev

# Seed admin user
npm run prisma:seed
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Directus (if used): http://localhost:8055
- Database: localhost:5432

## Development

### Running Locally

```bash
# Frontend
cd frontend
npm run dev

# Backend (in another terminal)
cd backend
npm run dev

# Database (if not using Docker)
# Make sure PostgreSQL is running
```

### Admin User

Default admin credentials:
- Email: admin@example.com
- Password: Loynis2020@

### Testing Authentication

1. Visit http://localhost:3000/login
2. Click "Sign in with Google" or "Sign in with Facebook"
3. Complete OAuth flow
4. You should be redirected to the dashboard

## Project Structure

```
├── frontend/                 # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities and configurations
│   └── styles/               # Global styles
├── backend/                  # Express.js backend
│   ├── prisma/               # Database schema and migrations
│   ├── lib/                  # Server utilities
│   └── app/                  # API routes
├── docker-compose.yml        # Docker services
└── .env.example             # Environment template
```

## API Endpoints

### Authentication
- `POST /api/auth/session` - Create session with Firebase token

### AI Chat
- `POST /api/ai-chat` - Send message to AI coach

### Directus (optional)
- Admin panel at configured Directus URL
- Static token authentication for API access

## Security Notes

- Never commit `.env` files or service account keys
- Use HTTPS in production
- Regularly rotate Firebase service account keys
- Store secrets securely in production (Docker secrets, AWS Secrets Manager, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
