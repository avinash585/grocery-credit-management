# GramMart AI

AI-powered multilingual, voice-first grocery credit management for rural kirana stores.

This repository is a production-oriented monorepo:

- `apps/web`: Next.js, React, TypeScript, Tailwind CSS, PWA-first frontend
- `apps/api`: Java 21, Spring Boot 3, Spring Security, JWT, MySQL, Redis, Flyway backend
- `.github/workflows`: CI for frontend and backend
- `docker-compose.yml`: local MySQL, Redis, and API stack

## Core Capabilities

- Shop onboarding and JWT authentication
- Customer credit ledger with purchases, payments, running balances, and receipts
- Multilingual product catalog with local aliases across English, Tamil, Hindi, Telugu, Kannada, and Malayalam
- Voice command parser that maps mixed-language commands to structured actions
- SMS provider abstraction with localized message rendering
- AI assistant service boundary for reports, summaries, stock recommendations, and payment risk scoring
- Offline-first frontend patterns with local command queue and synchronization hooks
- Accessibility-first rural UX with large touch targets, high contrast, language switching, and a persistent microphone action

## Local Development

### Prerequisites

- Node.js 20+
- Java 21+
- Maven 3.9+
- Docker Desktop

### Backend

```bash
cd apps/api
cp .env.example .env
mvn spring-boot:run
```

Swagger/OpenAPI is available at `http://localhost:8080/swagger-ui.html`.

### Frontend

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Full Local Stack

```bash
docker compose up --build
```

## Production Deployment

- Frontend: deploy `apps/web` to Vercel.
- Backend: deploy the Docker image from `apps/api` to Railway, Render, Azure Container Apps, or Kubernetes.
- Database: provision MySQL 8 with backups and point-in-time recovery.
- Redis: provision managed Redis for rate limiting, cache, and async queues.

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment variables and release guidance.

