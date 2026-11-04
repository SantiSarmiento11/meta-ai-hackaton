# Sleeply

Ecosistema de agentes de inteligencia artificial autónomos con oficina virtual interactiva en 2D que colabora con el usuario durante su jornada y continúa la ejecución de tareas delegadas durante sus horas de descanso.

## Descripción del Proyecto

Sleeply transforma la supervisión de agentes en una experiencia espacial en perspectiva isométrica pixel art con dos estados operativos fundamentales:
- Modo Vigilia (Co-piloto): Supervisión y delegación síncrona en oficina iluminada de día.
- Modo Sueño (Autónomo): Ejecución nocturna desatendida de tareas y reportes de progreso matutinos con ambientación nocturna.

## Tecnologías Principales

- Frontend: React 19, TypeScript, Vite.
- Motor Gráfico 2D: Phaser 4 (Phaser Core y físicas Arcade).
- Backend: Node.js, Express, TypeScript.
- ORM y Base de Datos: Prisma ORM (v6) y PostgreSQL (puerto 5432).
- Seguridad y Autenticación: JWT (JSON Web Tokens), bcryptjs, CORS restrictivo.
- Orquestación y Automatización: n8n (webhooks y API pública de flujos) y Meta AI (mediante conector compatible con OpenAI en `https://api.meta.ai/v1`).

## Arquitectura del Sistema

El proyecto opera bajo una arquitectura desacoplada en capas:
1. Capa de Presentación: React 19 con diseño minimalista basado en la paleta azul oficial y logo de Sleeply. Incluye modal de autenticación (Login/Registro), barra HUD con perfil de usuario (CEO), sincronización y persistencia de oficina, modal de diagnóstico n8n, y catálogo interactivo de mobiliario.
2. Capa Visual Isométrica: Escena en Phaser con soporte para texturas de alta resolución (1671x941 px de la Habitación Principal), interpolación fluida día/noche, cámara con zoom suave (0.75x a 1.45x) y cuadrícula isométrica 20x20.
3. Modelado de Objetos y Físicas Arcade: Catálogo unificado de 160 piezas segmentadas en dos spritesheets (`tech_office_atlas` y `modern_office_atlas`) con colisiones estáticas (`StaticBody`) y profundidad dinámica (`depth = baseY`).
4. Capa de Servicios Backend: API REST modular en Node.js con Express, autenticación stateless por JWT y middleware de protección de rutas.
5. Capa de Datos (MER con Prisma ORM):
   - `User`: Registro de usuarios/CEO, contraseñas hasheadas con bcrypt y aislamiento multiusuario.
   - `Office`: Espacio virtual individual por usuario (modo actual día/noche, avatar, zoom, visibilidad de cuadrícula).
   - `OfficeObject`: Mobiliario ubicado en la cuadrícula isométrica (columna, fila, huella dimensional, instancia única).
   - `Agent`: Los 3 agentes clave del MVP (Co-worker, Asistente/Secretaria, Manager) con estado e instrucciones.
   - `Task`: Tareas asignadas a agentes con modos de operación (Awake / Sleep) y prioridad.
   - `TaskExecutionLog`: Trazabilidad de ejecuciones, respuestas y payloads.
   - `IntegrationCredential`: Almacén de credenciales para n8n y Meta AI.
   - `AutomationWorkflow`: Mapeo de disparadores y webhooks hacia flujos en n8n.
6. Capa de Automatización e IA: Enlace con n8n (`https://n8n-dev1.auto-node.tech`) e integración con Meta AI en `https://api.meta.ai/v1`.
7. Orquestación Multi-Agente en Oficina: Tres sub-agentes autónomos (Taylor Chen / Secretaria, Sam Rivera / Co-worker, Jordan Díaz / Manager) situados en la oficina virtual isométrica con globos de diálogo interactivos, sincronizados en tiempo real con sus flujos en n8n y persistencia en PostgreSQL.

## Configuración y Variables de Entorno

Archivo `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://admin:admin123@localhost:5432/sleeply_db?schema=public"
JWT_SECRET="sleeply_jwt_secure_secret_meta_2026_xyz"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
N8N_BASE_URL="https://n8n-dev1.auto-node.tech"
N8N_WORKFLOWS_URL="https://n8n-dev1.auto-node.tech/home/workflows"
N8N_WEBHOOK_URL="https://n8n-dev1.auto-node.tech/webhook/sleeply-agent-orchestrator"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYjQyMGNmMS05OTk0LTQxNDQtODc1NS0xNDU0YmZiODY4YmMiLCJpc3MiOiJuOG4iLCJqdGkiOiJkN2M4ZTRlMS1hZjJmLTQ1NDYtODYxZS1mNGE1ZGJkNWQwZDQiLCJpYXQiOjE3OTM3NDkyMTIsImV4cCI6MTc5NjI1NjAwMCwiYXVkIjoicHVibGljLWFwaSJ9._I8D9sbO9h0SbrBmWldsV9xO7uFKILM4sMaAmpov3RY"
META_AI_API_KEY="LLM_1100897329385694_US1xzhgQHoicNjRmDDXXngs0C5I"
```

## Instalación y Ejecución

### 1. Base de Datos (PostgreSQL en localhost:5432)
Asegurar que PostgreSQL se encuentre activo en el puerto 5432:
- Usuario: `admin`
- Contraseña: `admin123`
- Base de datos: `sleeply_db`

### 2. Backend
```bash
cd backend
npm install
npm run prisma:push
npm run dev
```
El servidor backend se iniciará en `http://localhost:3001`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación cliente se iniciará en `http://localhost:5173`.

## Estado del Proyecto & Auditoría de Entrega

- **Estado:** Completado y Verificado con Éxito.
- **Comentario de Cierre:** Tarea terminada con éxito. Se completó la arquitectura multiagente conectada a n8n y Meta AI, el chat conversacional integrado en la oficina web para el Agente Principal (Alex Vance), los paneles de interacción directa para Co-worker (Sam Rivera), Secretaria (Taylor Chen) y Manager (Jordan Díaz), la gestión de repositorios GitHub y la sincronización documental con Google Drive.
- **Flujos Desplegados en n8n:**
  - `Gq3g9wHoEZ6761Jz`: Sleeply - Central Agent Orchestrator
  - `OGiWBz0XS8YCKsV7`: Sleeply - Secretary Gmail & Calendar Manager
  - `CkATRASNrEraPrfQ`: Sleeply - Co-worker GitHub & Code Executor
  - `zINHYbE6372bGGJW`: Sleeply - Manager Nightly Monitor & Report
- **Regla Estricta Cumplida:** 0 emojis en respuestas técnicas y reportes estructurados por personaje.

