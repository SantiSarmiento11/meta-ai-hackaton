# Sleeply

Ecosistema de agentes de inteligencia artificial autónomos con oficina virtual interactiva en 2D que colabora con el usuario durante su jornada y continúa la ejecución de tareas delegadas durante sus horas de descanso.

## Descripción del Proyecto

Sleeply transforma la supervisión de agentes en una experiencia espacial en perspectiva isométrica pixel art. El sistema cuenta con dos estados operativos fundamentales:
- Modo Vigilia (Co-piloto): Supervisión y delegación síncrona en oficina iluminada de día.
- Modo Sueño (Autónomo): Ejecución nocturna desatendida de tareas y reportes de progreso matutinos con ambientación nocturna.

## Tecnologías Principales

- Frontend: React 19, TypeScript, Vite.
- Motor Gráfico 2D: Phaser 4 (Phaser Core y físicas Arcade).
- Estilos y Maquetación: CSS3 con variables de diseño, efectos de desenfoque ambiental (glassmorphism) y diseño responsivo.
- Orquestación y Backend (Arquitectura objetivo): Node.js con TypeScript, PostgreSQL, n8n y Model Context Protocol (MCP).

## Arquitectura del Sistema

El proyecto opera bajo una arquitectura desacoplada en capas:
1. Capa de Presentación: React 19 que aloja el canvas de Phaser a pantalla completa (modo ENVELOP con autocentrado) y una interfaz de usuario flotante y minimalista (HUD).
2. Capa Visual Isométrica: Escena en Phaser con soporte para texturas de alta resolución (1680x938 px), interpolación de opacidad entre ambientes diurno y nocturno, y mapeo del piso mediante cuadrícula isométrica 20x20 invisible para posicionamiento y navegación.
3. Capa de Comunicación: Bus de eventos asíncronos para comunicar acciones del usuario (cambio de modo, inspección de cuadrícula) directamente con el bucle de juego de Phaser.

## Instalación

Requisitos previos: Node.js (versión 20 o superior) y npm.

1. Clonar el repositorio y acceder a la carpeta del frontend:
```bash
cd frontend
```

2. Instalar las dependencias del proyecto:
```bash
npm install
```

## Configuración y Ejecución

- Servidor de desarrollo local:
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:5173/` ocupando la totalidad de la ventana del navegador.

- Compilación para producción:
```bash
npm run build
```

- Verificación de calidad de código:
```bash
npm run lint
```

- Previsualización del empaquetado de producción:
```bash
npm run preview
```
