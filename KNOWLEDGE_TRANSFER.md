# GramMart AI Knowledge Transfer

Last updated: 2026-07-11

This document is the continuation guide for GramMart AI. It is written so another engineer, AI tool, or platform team can continue building the product without rediscovering the architecture, decisions, and current risks.

## 1. Product Summary

GramMart AI is a voice-first rural retail operating system for kirana stores, village grocery shops, and small rural retailers.

The product goal is not a normal CRUD/admin panel. The intended experience is an AI Command Center that lets a shopkeeper run the business through natural language:

- Open customer accounts.
- Add credit purchases.
- Receive payments.
- Ask product price and stock.
- View pending customers and reports.
- Use voice commands in local languages.
- Operate with minimum typing and minimum navigation.

Target users may be elderly, low-literacy, or non-English speakers. The product must remain large-button, icon-driven, voice-first, multilingual, and forgiving.

## 2. Repository Layout

Root folder:

```text
GramMart AI/
  apps/
    web/        Next.js frontend
    api/        Spring Boot backend
  services/
    tts/        Python TTS service prototype
  docker-compose.yml
  README.md
  API.md
  DEPLOYMENT.md
  render.yaml
```

Important frontend files:

```text
apps/web/app/page.tsx
apps/web/components/floating-mic.tsx
apps/web/lib/api.ts
apps/web/lib/i18n.ts
apps/web/lib/offline.ts
apps/web/lib/db.ts
apps/web/app/api/ai/chat/route.ts
apps/web/app/api/whatsapp/route.ts
```

Important backend files:

```text
apps/api/src/main/java/com/grammart/auth/
apps/api/src/main/java/com/grammart/customer/
apps/api/src/main/java/com/grammart/catalog/
apps/api/src/main/java/com/grammart/billing/
apps/api/src/main/java/com/grammart/ledger/
apps/api/src/main/java/com/grammart/voice/
apps/api/src/main/java/com/grammart/ai/
apps/api/src/main/resources/db/migration/
apps/api/src/main/resources/knowledge/
```

## 3. Technology Stack

Frontend:

- Next.js 16.2.9
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Framer Motion
- Lucide icons
- Browser Speech Recognition API
- PWA manifest
- Local/offline queue support

Backend:

- Java 17 target in `pom.xml`
- Spring Boot 3.3.5
- Spring Security with JWT
- Spring Data JPA
- MySQL
- Flyway migrations
- Redis dependency present
- Spring Actuator
- OpenAPI via springdoc
- Twilio/WhatsApp notification abstractions

AI and voice:

- Frontend route: `apps/web/app/api/ai/chat/route.ts`
- Backend AI service: `apps/api/src/main/java/com/grammart/ai/AiAssistantService.java`
- Backend voice parsing:
  - `SpeechIntelligenceService`
  - `VoiceCommandService`
  - language knowledge packs under `apps/api/src/main/resources/knowledge`
- Gemini is used where configured.

## 4. Local Development

### 4.1 MySQL Local Database

Expected local database:

```text
Host: localhost
Port: 3306
Database: grammart
Username: grammart
Password: grammart_dev_password
```

Backend local profile already points to:

```yaml
jdbc:mysql://localhost:3306/grammart?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

Config file:

```text
apps/api/src/main/resources/application-local.yml
```

### 4.2 Start Backend Locally

From repo root:

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\api"
mvn "-Dmaven.repo.local=.m2/repository" spring-boot:run -Dspring-boot.run.profiles=local
```

Health check:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -UseBasicParsing
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

### 4.3 Start Frontend Locally

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\web"
npm install
npm run dev
```

Frontend local URL:

```text
http://localhost:3000
```

Frontend environment:

```text
apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_DEFAULT_LANGUAGE=ENGLISH
```

### 4.4 Full Docker Stack

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI"
docker compose up --build
```

Use this when testing MySQL, Redis, and API together.

## 5. Production Deployment

Current public frontend URL:

```text
https://grammart-app.vercel.app
```

Recent successful deploys used:

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\web"
npx vercel@latest --prod --yes
npx vercel@latest alias set <deployment-url> grammart-app.vercel.app
```

After deploy, verify:

```powershell
Invoke-WebRequest -Uri "https://grammart-app.vercel.app" -UseBasicParsing -Method Head | Select-Object StatusCode,StatusDescription
```

Backend can be deployed to Railway, Render, Azure Container Apps, Kubernetes, or any Docker-compatible Java host. Existing files:

```text
apps/api/Dockerfile
apps/api/railway.json
render.yaml
DEPLOYMENT.md
```

Production backend requires:

- MySQL 8 managed database.
- Strong `JWT_SECRET`.
- Correct CORS origins.
- Gemini key if using live AI.
- Twilio/WhatsApp credentials if messaging is enabled.

## 6. Authentication and Data Flow

Auth:

- Register/login through backend `/auth`.
- JWT stored on frontend via `apps/web/lib/api.ts`.
- Most backend endpoints require `Authorization: Bearer <token>`.

Demo mode:

- Frontend has fallback starter customers/products.
- If backend is not connected, the UI runs in demo/local mode.
- The public Vercel app may show demo mode if the backend URL is unavailable or auth is not connected.

Important: The product requirement says "live MySQL only" for production. Demo fallback is useful for UI demos but should not be considered production truth.

## 7. Core Domain Model

Main entities:

- `Shop`
- `AppUser`
- `Customer`
- `Product`
- `Bill`
- `BillItem`
- `LedgerEntry`
- `SyncOperation`
- `VoiceLog`
- `SpeechCommand`
- `ShopAlias`
- `LearningHistory`

Key customer field:

```text
Customer.outstandingBalance
```

Key product fields:

```text
sku
category
brand
unit
sellingPrice
stockQuantity
purchasePrice
mrp
gstPercentage
nameEn
nameTa
nameHi
nameTe
nameKn
nameMl
aliases
enabled
```

Migrations:

```text
V1__initial_schema.sql
V2__seed_master_catalog.sql
V3__billing_and_sync.sql
V4__speech_intelligence_layer.sql
V5__master_grocery_catalog.sql
```

## 8. Frontend Architecture

Main UI file:

```text
apps/web/app/page.tsx
```

This file currently contains a large amount of app logic:

- Auth/connect shop panel.
- Dashboard/admin cards.
- Customer directory.
- Billing workspace.
- Product catalog.
- AI Assistant.
- AI Command Center logic.
- Local fallback customers/products.
- Product resolution logic.
- Voice command execution.

Important component:

```text
apps/web/components/floating-mic.tsx
```

This handles:

- Browser speech recognition.
- Recording state.
- Review modal.
- Parsed intent card.
- Submit/retry/dismiss.

Known frontend technical debt:

- `page.tsx` is too large and should be split.
- Product resolver should move into `apps/web/lib/nlp/product-resolution.ts`.
- Command parsing should move into `apps/web/lib/nlp/command-engine.ts`.
- AI Assistant UI should become its own component tree.
- Demo fallback and live backend logic are mixed in several places.

## 9. Backend Architecture

Main API groups:

```text
/auth
/customers
/products
/bills
/ledger
/sync
/voice
/ai
```

Important backend services:

- `AuthService`
- `CustomerService`
- `BillingService`
- `LedgerService`
- `SyncService`
- `SpeechIntelligenceService`
- `VoiceCommandService`
- `AiAssistantService`

Voice endpoints:

```text
POST /api/voice/normalize
POST /api/voice/parse
GET  /api/voice/logs
```

AI endpoint:

```text
POST /api/ai/chat
```

## 10. AI Command Center

The intended product direction is that the assistant is not a passive chatbot. It should be an operator.

Supported command/query examples:

```text
Open Avinash account
Show Kumar account
Add 1 kg rice to Avinash account
Add two litres milk to Lakshmi account
Lakshmi paid 500 rupees
Remove sugar from Kumar account
Generate today's report
Who owes the most money?
Show pending customers
What is today's sale?
How much credit is outstanding?
How many customers are registered?
What is the price of 1 kg rice?
What is the stock of sugar?
What products are running low?
Show payment history of Kumar
```

Command flow should be:

```text
Speech or typed text
  -> language detection
  -> normalization
  -> intent detection
  -> entity extraction
  -> product resolution
  -> customer resolution
  -> database lookup
  -> action execution or answer
  -> UI refresh
  -> voice/text confirmation
```

Production rule:

- Never guess products.
- Never use first product from database as fallback.
- Use confidence thresholds.
- If product confidence is under 90 percent, ask a clarification.
- Price and stock questions must never add items to a customer account.
- Product actions must require explicit mutation verbs such as add, credit, record, receive payment.

## 11. NLP and Product Resolution

The current product resolver work is in progress.

Frontend resolver location:

```text
apps/web/app/page.tsx
```

Functions to know:

```text
normalizeAssistantText
tokenizeAssistantText
productResolutionTerms
resolveProductEntity
extractQuantityAndUnit
localProductQueryAnswer
parseAssistantAction
localBusinessAnswer
```

Backend resolver location:

```text
apps/api/src/main/java/com/grammart/voice/SpeechIntelligenceService.java
```

Important backend intent enum:

```text
apps/api/src/main/java/com/grammart/voice/VoiceIntent.java
```

Recent bug being fixed:

```text
User: What is the price of 4 litre of milk?
Bad result: Milkmaid / Buttermilk ambiguity, or earlier Rice.
Expected:
  Intent: GET_PRODUCT_PRICE
  Product: Milk
  Quantity: 4
  Unit: litre
```

Root cause:

- Generic synonym `milk` was applied to product names containing the substring `milk`, such as `Milkmaid` and `Buttermilk`.
- Resolver must use exact token/canonical alias matching, not substring matching.

Current in-progress uncommitted changes:

```text
apps/web/app/page.tsx
apps/api/src/main/java/com/grammart/voice/SpeechIntelligenceService.java
```

Before committing or deploying, run:

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\web"
npm run typecheck
npm run build

cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\api"
mvn "-Dmaven.repo.local=.m2/repository" test
```

Recommended test cases:

```text
What is the price of 4 litre of milk?
What is the price of milk?
What is the price of Milkmaid?
What is the price of buttermilk?
What is the price of 1 kg rice?
Add 1 litre milk to Avinash account
Open Lakshmi account and add maida
What is the stock of sugar?
Who owes the most money?
Show pending customers above 5000
Lakshmi paid 500 rupees
```

Expected behavior:

- `milk` resolves to Milk, not Milkmaid or Buttermilk.
- `milkmaid` resolves to Milkmaid.
- `buttermilk` resolves to Buttermilk.
- Price queries do not mutate customer balances.
- Add/credit commands mutate balances only when customer and product confidence is high.

## 12. Multilingual Support

Supported language enum:

```text
ENGLISH
TAMIL
HINDI
TELUGU
KANNADA
MALAYALAM
```

Frontend translations:

```text
apps/web/lib/i18n.ts
```

Transliteration/display helper:

```text
apps/web/lib/transliterate.ts
```

Backend knowledge packs:

```text
apps/api/src/main/resources/knowledge/english
apps/api/src/main/resources/knowledge/tamil
apps/api/src/main/resources/knowledge/hindi
apps/api/src/main/resources/knowledge/telugu
apps/api/src/main/resources/knowledge/kannada
apps/api/src/main/resources/knowledge/malayalam
```

Each pack may include:

```text
actions.json
aliases.json
grammar.json
numbers.json
payment.json
products.json
slang.json
units.json
```

## 13. Voice and Browser Limitations

The floating mic uses browser Speech Recognition API.

Known limitations:

- Speech recognition may be blocked if microphone permission is denied.
- Some browsers do not support Web Speech API.
- In the screenshot, Edge/Chrome showed: `Speech recognition not available or microphone blocked.`
- The UI should always allow typed command fallback.
- The Submit button was updated previously so typed/reviewed natural text can route to AI even if speech recognition fails.

Improvement backlog:

- Add clear mic permission instructions in the overlay.
- Add a type-in-command field directly inside the voice modal.
- Add server-side speech-to-text option for unsupported browsers.
- Add retry diagnostics: browser unsupported vs permission denied vs no speech.

## 14. Messaging

Frontend WhatsApp helper:

```text
apps/web/lib/whatsapp.ts
apps/web/app/api/whatsapp/route.ts
```

Backend notification package:

```text
apps/api/src/main/java/com/grammart/notification/
```

Providers:

- Console
- Twilio SMS
- WhatsApp SMS provider abstraction

Environment variables:

```text
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
TWILIO_FROM_NUMBER
TWILIO_CONTENT_SID
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
SMS_PROVIDER
```

## 15. Offline and Sync

Frontend files:

```text
apps/web/lib/offline.ts
apps/web/lib/db.ts
```

Backend files:

```text
apps/api/src/main/java/com/grammart/sync/
```

Offline goal:

- Queue commands locally when offline.
- Sync when connection returns.
- Avoid losing sales/payment actions.

Important risk:

- Conflict handling needs more work for production.
- Sync should include idempotency keys for every command.

## 16. Environment Variables

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_DEFAULT_LANGUAGE
NEXT_PUBLIC_SHOP_NAME
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
```

Backend:

```text
SPRING_PROFILES_ACTIVE
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
REDIS_HOST
REDIS_PORT
JWT_SECRET
JWT_ACCESS_TOKEN_MINUTES
JWT_REFRESH_TOKEN_DAYS
SMS_PROVIDER
GEMINI_API_KEY
GEMINI_MODEL
OPENAI_API_KEY
APP_CORS_ALLOWED_ORIGINS
```

Do not hardcode API keys in source code. Use Vercel/Railway/Render environment variable stores.

## 17. Test Commands

Frontend:

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\web"
npm run typecheck
npm run build
npm run lint
```

Backend:

```powershell
cd "C:\Users\avina\OneDrive\Documents\GramMart AI\apps\api"
mvn "-Dmaven.repo.local=.m2/repository" test
```

API health:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -UseBasicParsing
```

Live frontend:

```powershell
Invoke-WebRequest -Uri "https://grammart-app.vercel.app" -UseBasicParsing -Method Head | Select-Object StatusCode,StatusDescription
```

## 18. Current Git History Context

Recent important commits:

```text
d74356e Redesign speech product resolution pipeline
73f1a48 Add AI command center execution engine
d8143b4 Improve assistant voice query responses
e47f38a Fix assistant product query intent handling
04b6170 Fix voice sale target customer updates
```

Current working tree at time of this document:

```text
Modified:
  apps/web/app/page.tsx
  apps/api/src/main/java/com/grammart/voice/SpeechIntelligenceService.java
```

These modifications came from the interrupted follow-up to improve resolver behavior for `milk` vs `Milkmaid` vs `Buttermilk`. Verify before committing.

## 19. Known Issues and Risks

High priority:

- Public frontend may still run in demo mode if backend is not deployed or not connected.
- AI Command Center still has important logic in frontend state; production should move live data operations to backend.
- Product resolver is mid-refactor. Finish tests for Milk, Milkmaid, Buttermilk, Rice, Sugar, Maida.
- Backend `/ai/chat` is still basic and should be upgraded to use live repositories for BI answers.
- Voice recognition depends on browser permissions.

Medium priority:

- `apps/web/app/page.tsx` is too large.
- AI Smart Replenishment Alerts should be deterministic and not echo unrelated chat answers.
- Need proper analytics/reporting endpoints.
- Need customer history and ledger UI linked from AI commands.
- Need product stock decrement after bill creation if not already handled.
- Need robust unit conversion: litre vs ml, kg vs g, packet vs piece.

Low priority:

- Polish loading states.
- Add better empty states.
- Add keyboard shortcuts for power users.
- Improve mobile spacing around floating mic and AI panels.

## 20. Recommended Next Engineering Steps

1. Finish NLP resolver stabilization.
   - Move frontend resolver to `apps/web/lib/nlp/product-resolution.ts`.
   - Add unit tests for product ambiguity.
   - Mirror same logic in backend service or expose backend resolver endpoint.

2. Move AI Command Center execution backend-side.
   - Create `/api/command/execute`.
   - Request: raw text, language, active customer id.
   - Response: intent, entities, action result, UI navigation hint, spoken response.

3. Add BI endpoints.
   - `/reports/today`
   - `/reports/monthly`
   - `/reports/credit-risk`
   - `/reports/low-stock`
   - `/customers/{id}/history`

4. Connect production backend to deployed frontend.
   - Set `NEXT_PUBLIC_API_BASE_URL` in Vercel.
   - Deploy backend to Railway/Render/Azure.
   - Verify auth, products, customers, bills, ledger against MySQL.

5. Improve voice fallback.
   - Add typed command inside floating mic modal.
   - Add server-side STT option.
   - Add permission diagnostics.

6. Split frontend modules.
   - Dashboard
   - Customer workspace
   - Billing
   - Product catalog
   - AI Command Center
   - Voice overlay
   - NLP utilities

## 21. Platform Continuation Notes

### Continue in Vercel

- Use `apps/web` as project root.
- Set frontend env variables in Vercel dashboard.
- Redeploy after `npm run build` passes.
- Always re-alias `grammart-app.vercel.app` if Vercel creates a generated alias.

### Continue in Railway or Render

- Use `apps/api` as backend root.
- Use Dockerfile or Maven build.
- Provision MySQL.
- Set Spring profile and DB variables.
- Enable health checks on `/api/actuator/health`.

### Continue in Azure or AWS

- Frontend can remain on Vercel or move to Static Web Apps/Amplify.
- Backend can run as container.
- MySQL should be managed.
- Configure CORS for the frontend domain.
- Store secrets in Key Vault or Secrets Manager.

### Continue in Mobile App

- Reuse backend API.
- Reuse command pipeline contract.
- Native app should send voice transcript to backend command endpoint.
- Use native speech recognition for better microphone reliability.

## 22. Definition of Done for Production AI Assistant

The assistant is production-ready when:

- Every command returns structured intent and entities.
- Product confidence is visible in logs.
- Product ambiguity asks clarification.
- Price/stock queries never mutate data.
- Add/payment actions update MySQL.
- UI refreshes automatically after action.
- Spoken confirmation is generated.
- All actions are idempotent.
- All commands are logged.
- Customer/product resolution supports aliases and regional names.
- Tests cover common English and Tamil/Hindi voice phrases.

## 23. Quick Handoff Checklist

Before another builder starts:

- Pull latest `main`.
- Run `git status --short`.
- Check uncommitted resolver edits.
- Run frontend typecheck/build.
- Run backend Maven tests.
- Test `What is the price of 4 litre of milk?`.
- Test `What is the price of Milkmaid?`.
- Test `What is the price of buttermilk?`.
- Confirm `grammart-app.vercel.app` points to latest deployment.
- Confirm backend is connected if live MySQL behavior is required.

