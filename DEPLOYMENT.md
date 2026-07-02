# Deployment Guide

## Required Environment Variables

### Backend

- `SPRING_PROFILES_ACTIVE=prod`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_MINUTES`
- `JWT_REFRESH_TOKEN_DAYS`
- `SMS_PROVIDER`
- `SMS_API_KEY`
- `OPENAI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `APP_PUBLIC_BASE_URL`

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_DEFAULT_LANGUAGE`

## Backend Release

1. Provision MySQL 8 and Redis.
2. Deploy `apps/api` using `apps/api/Dockerfile`.
3. Railway can use `apps/api/railway.json`; Render can use root `render.yaml`.
4. Run database migrations automatically on startup with Flyway.
5. Configure HTTPS at the platform load balancer.
6. Enable health checks at `/api/actuator/health`.
7. Rotate `JWT_SECRET` through the deployment platform secret manager.

## Frontend Release

1. Import the repository in Vercel.
2. Set root directory to `apps/web`.
3. Add production environment variables.
4. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL plus `/api`.
5. Deploy after CI passes.

## Operational Baseline

- Enable MySQL automated backups.
- Enable Redis persistence where supported.
- Forward API logs to the hosting provider log drain.
- Monitor authentication failures, SMS failures, migration errors, and sync conflict counts.
- Use provider-level WAF/rate limiting in addition to application rate limits.
