# WinOnboard

WinOnboard is an employee onboarding portal (Frontend + Backend) that supports HR workflows for freshers, document upload and verification, automated emails, and an integrated AI assistant to help users with onboarding questions.

## Key Features (implemented in code)

- HR onboarding: create and manage fresher accounts, store profile and employment details (see Backend scripts in `Backend/`).
- Welcome & notification emails: SMTP-based email sending for welcome emails and notifications.
- Secure password handling: bcrypt hashing and temporary password generation for freshers.
- Authentication-ready: JWT secret and authentication scaffolding present in backend.
- Dual-database support: MySQL for HR features and MSSQL support for legacy features (DB config in `Backend/config/`).
- Document uploads: secure uploads to Azure Blob Storage (env variables `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`).
- Background verification (BGV) and vendor verification helpers (see `Backend/*bgv*` and `create-vendor*` scripts).
- AI Assistant: backend AI agent service using Azure OpenAI (or demo mode) and an integrated frontend chat component:
  - Backend endpoints: `POST /api/features/ai-agent/chat`, `GET /api/features/ai-agent/health` (see `Backend/src/features/ai-agent`).
  - Frontend component: `Frontend/src/components/AIAgentChat.jsx` provides a floating chat widget.
- Frontend: React + Vite application (environment uses `VITE_API_BASE_URL` / `REACT_APP_API_BASE_URL`).
- Developer utilities and tests: many scripts under `Backend/` for testing blob storage, email, verification flows, and database setup.

## Architecture

- Frontend: React (Vite) application in `Frontend/`.
- Backend: TypeScript + Express REST API in `Backend/` with services, controllers, and routes. AI agent feature lives under `Backend/src/features/ai-agent`.
- Storage: Azure Blob Storage for documents.
- External services: SMTP for email, Azure OpenAI / Azure Foundry for AI assistant (configurable via `.env`).

## Important Environment Variables

Core examples (see `Backend/.env.example` or `.env` files):

- `NODE_ENV` — environment (development/production)
- `PORT` — backend server port
- `FRONTEND_URL` — frontend URL for CORS
- Database (MySQL): `DB_HOST`, `DB_PORT`, `DB_NAME_MYSQL`, `DB_USER_MYSQL`, `DB_PASSWORD_MYSQL`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`
- `JWT_SECRET` — JWT signing key
- Azure Blob Storage: `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`
- Azure OpenAI / Foundry (AI agent): `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_FOUNDRY_PROJECT_ENDPOINT`, `AZURE_FOUNDRY_API_KEY`

Do not commit secrets. Use `.env` locally and a secrets manager in production.

## Quick Setup

Backend (basic):

```bash
cd Backend
npm install
cp .env.example .env
# edit .env with DB, email, and Azure credentials
npm run dev
```

Frontend (basic):

```bash
cd Frontend
npm install
# set VITE_API_BASE_URL or REACT_APP_API_BASE_URL in Frontend/.env
npm run dev
```

## Notable API Endpoints

- Health: `GET /api/health` (backend health check)
- HR (Freshers): `POST /api/hr/freshers`, `GET /api/hr/freshers`, `GET /api/hr/freshers/:id` (refer to backend routes)
- AI Agent: `POST /api/features/ai-agent/chat` (send message), `GET /api/features/ai-agent/health` (service status)

## Running AI Agent (notes)

- The backend includes an `AIAgentService` that uses Azure OpenAI chat completions when `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_API_KEY` are set. If not configured or using placeholder keys, it runs in demo mode (simulated responses).
- Frontend chat widget calls the backend AI endpoint and maintains a thread id for conversational context.

## Developer Notes

- Backend code is organized into controllers, services, routes, and utils. Many helper scripts exist in `Backend/` for creating tables, testing uploads, and verification flows.
- Tests and test scripts: `Backend/test-*.js` scripts can be used for quick endpoint checks (e.g., `test-ai-agent.js`).

## Where to look for specifics

- Backend AI agent: `Backend/src/features/ai-agent/`
- Frontend AI widget: `Frontend/src/components/AIAgentChat.jsx`
- Blob storage usage and tests: `Backend/test-blob-*`, `Backend/test-blob-upload-flow.js`, and env variables in `Backend/.env`
- Email and notification code: `Backend/src/services/email.service.ts` and related scripts

## Contributing

- Follow TypeScript and ESLint rules used in the backend.
- Add tests for new endpoints and update this README when adding major features.

## License

- MIT

---

If you'd like, I can now:

- run a quick grep to ensure no remaining `README.md` files are present,
- or commit these changes locally for you. Which would you prefer? 
