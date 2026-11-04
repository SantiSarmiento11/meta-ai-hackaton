# Frontend: React + TypeScript + Phaser

Client application built with **Vite**, **React 19**, **TypeScript**, and **Phaser**.

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the application in your browser at `http://localhost:5173/`.

## Project Structure

```text
frontend/
├── src/
│   ├── assets/               # Pixel art spritesheets, character atlases, and icons
│   ├── components/
│   │   ├── AuthModal.tsx     # Fullscreen login and registration modal
│   │   ├── CharacterSelectModal.tsx # Avatar selection interface
│   │   ├── N8nStatusModal.tsx# Diagnostics modal for automations
│   │   ├── ObjectCatalogDrawer.tsx # Isometric furniture catalog drawer
│   │   ├── OfficeChatModal.tsx # Conversational AI chat with Meta AI and PostgreSQL
│   │   └── PhaserGame.tsx    # React wrapper for the Phaser game engine
│   ├── game/
│   │   ├── config.ts         # Phaser configuration (resolution, arcade physics, scaling)
│   │   ├── models/           # Character and object catalog models
│   │   ├── objects/          # Isometric NPCs, depth managers, and grid objects
│   │   └── scenes/
│   │       └── MainScene.ts  # Primary isometric office scene with day/night cycles
│   ├── services/
│   │   └── api.ts            # Typed REST API service connecting to backend
│   ├── App.tsx               # Root component integrating React UI and Phaser canvas
│   └── main.tsx              # Application entry point
├── package.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev`: Starts local Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Compiles TypeScript and bundles the client for production.
- `npm run preview`: Previews the production build locally.
