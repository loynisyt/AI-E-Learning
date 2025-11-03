# AI E-Learning Platform

This is an AI-powered e-learning platform built with Next.js, Express, Prisma, Firebase Authentication, and Directus CMS.

## Features

- **Authentication**: Firebase-based authentication (email/password, Google, Facebook)
- **Role-Based Access Control**: Admin, Instructor, and Student roles with permissions
- **AI Chat**: OpenAI-powered conversational AI assistant
- **Content Management**: Directus CMS for educational content
- **Lesson Management**: Create and manage educational lessons
- **Docker Support**: Full containerization with Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- OpenAI API key
- Firebase project setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-elearning
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   # NextAuth
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000

   # URLs
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
   NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055

   # Database (automatically set by Docker)
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ai_elearning_db
   ```

3. **Start with Docker:**
   ```bash
   # Build and start all services
   docker-compose up --build

   # Or run in background
   docker-compose up -d --build
   ```

4. **Run database migrations (first time only):**
   ```bash
   # Set RUN_MIGRATE=true to run migrations and seed data
   RUN_MIGRATE=true docker-compose up --build
   ```

5. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000
   - **Directus CMS**: http://localhost:8055 (admin@ai-elearning.pl / admin)
   - **PostgreSQL**: localhost:5432

## Authentication Setup

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and configure sign-in methods (Email/Password, Google, Facebook)
3. Get your Firebase config from Project Settings > General > Your apps
4. Download the service account key for admin SDK and place it in the backend directory

### Directus Setup

Directus is automatically configured with Docker. Access it at http://localhost:8055 with:
- **Email**: admin@ai-elearning.pl
- **Password**: admin

## API Endpoints

### Authentication
- `POST /api/login` - Email/password login
- `POST /api/auth/create-oauth-user` - Create OAuth user
- `POST /api/auth/session` - Create Firebase session

### Lessons (Prisma)
- `GET /api/lessons` - Get all lessons
- `POST /api/lessons` - Create lesson (requires 'write' permission)
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Directus Content
- `GET /api/content/:collection` - Get content from Directus collection
- `POST /api/content/:collection` - Create content
- `PUT /api/content/:collection/:id` - Update content
- `DELETE /api/content/:collection/:id` - Delete content

### AI Chat
- `POST /api/ai-chat` - Chat with AI assistant

## User Roles & Permissions

- **Admin**: Full access to all features and user management
- **Instructor**: Can create and manage content, lessons
- **Student**: Can view content and use AI chat

## Development

### Running without Docker

1. **Start PostgreSQL and Directus:**
   ```bash
   docker-compose up postgres directus
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Management

```bash
# Generate Prisma client
cd backend && npx prisma generate

# Create migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# Seed database
npm run prisma:seed
```

## Project Structure

```
ai-elearning/
├── backend/                 # Express.js API server
│   ├── lib/
│   │   ├── auth.js         # Firebase authentication middleware
│   │   ├── directus.js     # Directus client
│   │   └── firebaseAdmin.js # Firebase admin SDK
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Database seeding
│   └── index.js            # Main server file
├── frontend/                # Next.js application
│   ├── app/                # App router
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── styles/             # Stylesheets
├── directus/               # Directus CMS data
├── docker-compose.yml      # Docker services
├── .env.local             # Environment variables
└── README.md
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 4000, 5432, 8055 are available
2. **Firebase authentication**: Verify Firebase config and service account key
3. **Database connection**: Check DATABASE_URL in environment variables
4. **Directus access**: Wait for Directus to fully initialize after first startup

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs directus
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
