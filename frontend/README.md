# Frontend: React + TypeScript + Phaser

Proyecto configurado con **Vite**, **React 19**, **TypeScript** y **Phaser**.

## 🚀 Cómo ejecutar el proyecto

1. Entra al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre el enlace indicado en la terminal (por defecto `http://localhost:5173/`).

## 📁 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── components/
│   │   └── PhaserGame.tsx    # Componente React que encapsula el ciclo de vida de Phaser
│   ├── game/
│   │   ├── config.ts         # Configuración del motor Phaser (dimensiones, físicas, escala)
│   │   └── scenes/
│   │       └── MainScene.ts  # Escena principal con animaciones e interactividad
│   ├── App.tsx               # Componente principal integrando UI React y Canvas de Phaser
│   ├── App.css               # Estilos principales
│   └── main.tsx              # Punto de entrada de React
├── package.json
└── vite.config.ts
```

## 🛠️ Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con HMR.
- `npm run build`: Compila TypeScript y empaqueta la aplicación para producción.
- `npm run preview`: Previsualiza el build de producción localmente.
