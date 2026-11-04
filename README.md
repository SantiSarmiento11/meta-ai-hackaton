# Sleeply

<p align="center">
  <img src="frontend/src/assets/sleeply%20(svg).svg" alt="Sleeply Logo" width="300" />
</p>

Plataforma de oficina virtual isométrica en 2D que combina supervisión y delegación de tareas con agentes de inteligencia artificial autónomos, operando en dos modalidades:

- **Modo Vigilia (Día):** Supervisión interactiva, manipulación de la oficina y diálogo síncrono con agentes.
- **Modo Sueño (Noche):** Delegación y ejecución desatendida de tareas automatizadas con ambientación nocturna.

---

## Tecnologías

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

- **Base de Datos & Automatización:**  
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
  ![Meta AI](https://img.shields.io/badge/Meta_AI-0467DF?style=for-the-badge&logo=meta&logoColor=white)

---

## Arquitectura

El proyecto está estructurado en tres componentes desacoplados:

1. **Cliente Web e Interfaz Isométrica (Frontend):**
   - Aplicación en React 19 para autenticación, HUD de control, visualización de estado de agentes y modal de chat.
   - Escena interactiva en Phaser con proyección isométrica, control de avatar, ordenamiento de profundidad dinámico, ciclo visual día/noche y editor de mobiliario en cuadrícula persistente.

2. **Servicio API REST (Backend):**
   - Servidor Node.js con Express y TypeScript con autenticación stateless basada en JWT y contraseñas hasheadas con bcryptjs.
   - Controladores para autenticación, estado de agentes, persistencia de oficina y objetos, y delegación de tareas.
   - Servicio de conexión a n8n para disparo de webhooks y consulta de estado de flujos y credenciales.

3. **Persistencia Relacional (PostgreSQL + Prisma):**
   - `User`: Registro y autenticación de usuarios.
   - `Office`: Configuración del espacio virtual (modo día/noche, avatar, zoom).
   - `OfficeObject`: Mobiliario ubicado en la cuadrícula isométrica.
   - `Agent`: Agentes configurados y estado de actividad.
   - `Task` & `TaskExecutionLog`: Registro de tareas asignadas y trazabilidad de ejecuciones.
   - `IntegrationCredential` & `AutomationWorkflow`: Mapeo de credenciales y flujos hacia n8n.

---

## Configuración

Configurar las variables de entorno en el archivo `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# Base de Datos PostgreSQL
DATABASE_URL="postgresql://admin:admin123@localhost:5432/sleeply_db?schema=public"

# Seguridad y Autenticación
JWT_SECRET="sleeply_jwt_secure_secret_meta_2026_xyz"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"

# Automatización n8n y Meta AI
N8N_BASE_URL="https://n8n-dev1.auto-node.tech"
N8N_WORKFLOWS_URL="https://n8n-dev1.auto-node.tech/home/workflows"
N8N_WEBHOOK_URL="https://n8n-dev1.auto-node.tech/webhook/sleeply-agent-orchestrator"
N8N_API_KEY="tu_n8n_api_key"
META_AI_API_KEY="tu_meta_ai_api_key"
```

---

## Instalación y Ejecución

### 1. Base de Datos
Asegurar que PostgreSQL esté en ejecución en el puerto `5432` con la base de datos `sleeply_db` creada.

### 2. Backend
```bash
cd backend
npm install
npm run prisma:push
npm run dev
```
El servidor backend iniciará en `http://localhost:3001`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación cliente iniciará en `http://localhost:5173`.
