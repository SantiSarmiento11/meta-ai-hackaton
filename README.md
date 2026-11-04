# Sleeply

<p align="center">
  <img src="frontend/src/assets/sleeply%20(svg).svg" alt="Sleeply Logo" width="300" />
</p>

2D isometric virtual office platform combining real-time human supervision and task delegation with an autonomous multi-agent AI workforce, operating in two modes:

- **Day Mode (Awake):** Interactive supervision, office customization, and synchronous dialogue with AI agents.
- **Night Mode (Sleep):** Autonomous, unattended batch task execution with ambient nighttime lighting and morning progress reporting.

---

## Tech Stack

- **Frontend:**  
  ![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Phaser](https://img.shields.io/badge/Phaser_4-000000?style=for-the-badge&logo=phaser&logoColor=white)

- **Backend:**  
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens)

- **Database & Intelligence:**  
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![Meta AI](https://img.shields.io/badge/Meta_AI-0467DF?style=for-the-badge&logo=meta&logoColor=white)
  ![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)

---

## Architecture

The system is decoupled into three cohesive tiers:

1. **Web Client & Isometric Interface (Frontend):**
   - React 19 single-page application handling authentication, HUD controls, multi-agent status, and the conversational chat modal.
   - Interactive Phaser scene with 20x20 isometric projection, avatar navigation, dynamic depth sorting, smooth day/night visual cycles, and persistent grid furniture placement.

2. **REST API Service (Backend):**
   - Modular Node.js server built with Express and TypeScript, protected by stateless JWT authentication and bcrypt password hashing.
   - Controllers for user authentication, live agent activity, office grid persistence, and task lifecycle management.
   - Direct Meta AI reasoning engine (`https://api.meta.ai/v1`, model `muse-spark-1.3-contributor`) consuming `META_AI_API_KEY` from `.env`.
   - Fallback connectors for n8n webhooks and local OpenClaw gateway instances.

3. **Relational Persistence (PostgreSQL + Prisma ORM):**
   - `User`: User profiles, role-based authorization (CEO), and secure credentials.
   - `Office`: Virtual workspace state (day/night mode, selected avatar, zoom, grid visibility).
   - `OfficeObject`: Isometric furniture placed on the grid (coordinates, footprint, unique instance ID).
   - `Agent`: Preconfigured multi-agent workforce (Co-worker, Assistant, Manager) and live statuses.
   - `Task` & `TaskExecutionLog`: Historical and active task assignments, execution metrics, and full traceability.
   - `IntegrationCredential` & `AutomationWorkflow`: Service credentials and automated workflow triggers.

---

## Configuration

Set the required environment variables in `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# PostgreSQL Database Connection (Port 5432)
DATABASE_URL="postgresql://admin:admin123@localhost:5432/sleeply_db?schema=public"

# Authentication & Security
JWT_SECRET="sleeply_jwt_secure_secret_meta_2026_xyz"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"

# Meta AI Integration
META_AI_API_KEY="your_meta_ai_api_key_here"
META_AI_BASE_URL="https://api.meta.ai/v1"
META_AI_MODEL="muse-spark-1.3-contributor"

# Automation Engine & Webhooks
N8N_BASE_URL="https://n8n-dev1.auto-node.tech"
N8N_WORKFLOWS_URL="https://n8n-dev1.auto-node.tech/home/workflows"
N8N_WEBHOOK_URL="https://n8n-dev1.auto-node.tech/webhook/sleeply-v2-chat-principal"
N8N_API_KEY="your_n8n_api_key_here"

# OpenClaw Local Gateway (Optional Fallback)
OPENCLAW_BASE_URL="http://127.0.0.1:18789"
OPENCLAW_TOKEN="your_openclaw_token_here"
OPENCLAW_MODEL="openclaw"
OPENCLAW_ENABLED=false
```

---

## Installation & Setup

### 1. Database
Ensure PostgreSQL 17 is running on port `5432` with the `sleeply_db` database created.

### 2. Backend
```bash
cd backend
npm install
npm run prisma:push
npm run dev
```
The backend API server will run at `http://localhost:3001`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
The web application will be accessible at `http://localhost:5173`.
