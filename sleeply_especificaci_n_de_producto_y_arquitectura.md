# ESPECIFICACIÓN DE PRODUCTO & ARQUITECTURA

## SLEEPLY: Ecosistema de Agentes Autónomos

*Un agente de IA que trabaja contigo y extiende tus capacidades, incluso mientras duermes.*

---

## 1. Resumen Ejecutivo y Propuesta de Valor

Los seres humanos dedican aproximadamente un tercio de su vida a dormir, una función biológica esencial para la salud y el bienestar que tradicionalmente detiene el avance de los proyectos personales y profesionales. **Sleeply** nace bajo la premisa de transformar ese periodo de descanso en progreso continuo sin sacrificar la recuperación del usuario.

> "El objetivo no es reemplazar tu esfuerzo ni tomar decisiones de forma independiente, sino trabajar a tu lado, extender tus capacidades y ayudarte a lograr más sin sacrificar el descanso que necesitas."

A diferencia de los asistentes conversacionales pasivos que requieren supervisión constante por cada instrucción, este ecosistema aprende del contexto laboral del usuario, comprende sus flujos de trabajo y ejecuta tareas delegadas basándose estrictamente en sus instrucciones, métodos y objetivos. Mientras el usuario duerme o se enfoca en otras prioridades, la plataforma organiza información, gestiona correos, prepara tareas y avanza en los proyectos en curso respetando la forma exacta en que el usuario trabaja.

### Estados Visuales del Entorno

* **Estado 1 (Vigilia / Oficina):** Agentes y trabajadores asignados en sus estaciones dentro de la oficina virtual 2D, observando el Jefe  trabajando y entendiendo el contexto (Usuario).
* **Estado 2 (Modo Sueño):** El usuario descansa mientras los agentes completan la cola de tareas en tiempo real de manera asignada por el usuario o cola de tareas acumulada.

---

## 2. Experiencia de Usuario: La Oficina Web Interactiva

La plataforma materializa la administración de agentes de Inteligencia Artificial mediante una **oficina virtual interactiva en 2D con estética pixel art isométrica**. En lugar de navegar por registros de consola abstractos, el usuario administra su fuerza laboral digital de manera espacial e intuitiva:

* **Zonas Funcionales y Entornos Visuales:** El mapa de la oficina cuenta con estaciones de trabajo equipadas con múltiples monitores para los agentes, salas de juntas y un área de descanso dedicada con sofá e indicadores de progreso en pantalla.
* **Visualización de Trabajo en Vivo:** Cada agente o trabajador virtual posee un avatar propio asignado a un puesto. El usuario puede observar en tiempo real qué tareas están en curso y consultar el tablero general donde las barras de progreso pasan a estado completado.
* **Sincronización Vigilia / Sueño:** El sistema detecta cuándo el usuario está despierto y cuándo duerme. Al entrar en modo descanso, la iluminación del entorno se adapta y los agentes continúan ejecutando las funciones encargadas de forma autónoma.

---

## 3. Gestión de Agentes, Contexto, Skills y Entornos

El núcleo funcional va más allá de una simulación visual: está conectado directamente con motores de ejecución y agentes avanzados de ingeniería y automatización (como **Claude Code** o **Antigravity**), permitiendo una administración granular del conocimiento:

### Administración de Skills y Contexto

Configuración modular de habilidades por agente mediante **MCP (Model Context Protocol)**:

* Inyección de documentación técnica, reglas de negocio y contexto de los proyectos activos.
* Asignación de *skills* específicas (acceso a Git, triaje de correos, organización de datos, ejecución de código).
* Apego estricto a los métodos e instrucciones del usuario, evitando decisiones arbitrarias.

### Modos de Operación Basados en Presencia

Adaptación dinámica del comportamiento del ecosistema según el estado del usuario:

* **Modo Despierto (Co-piloto):** Colaboración síncrona, delegación rápida de funciones y supervisión visual en la oficina.
* **Modo Sueño (Autónomo):** Ejecución nocturna por lotes, avance de tareas programadas y reporte matutino consolidado.

---

## 4. Arquitectura y Stack Tecnológico

Para soportar la interfaz gráfica interactiva, la sincronización en tiempo real y la orquestación de agentes de IA, se define la siguiente arquitectura técnica dividida por capas:

| Capa del Sistema               | Tecnologías Clave                              | Propósito y Responsabilidad en la Plataforma                                                                                                                |
|:------------------------------ |:---------------------------------------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend & Motor Visual**    | `React` `TypeScript` `Phaser 3` `Tailwind CSS` | Renderizado del entorno 2D isométrico con Phaser 3, animaciones de avatares e interfaz web (React + Tailwind) para administrar agentes, contextos y skills. |
| **Backend & Lógica**           | `Node.js` `TypeScript` `API REST`              | Gestión de lógica de negocio, autenticación, control de sesiones, detección/cambio de estados (despierto/dormido) y endpoints de administración.            |
| **Tiempo Real & Multijugador** | `WebSockets` `Colyseus`                        | Comunicación bidireccional en vivo para reflejar el avance de tareas en las pantallas de la oficina; escalabilidad multijugador mediante Colyseus.          |
| **Persistencia de Datos**      | `PostgreSQL`                                   | Almacenamiento relacional de usuarios, configuración de agentes, memoria contextual, catálogo de skills e historial auditable de tareas completadas.        |
| **Integraciones e IA**         | `n8n` `APIs de IA` `MCP`                       | Automatización de flujos de trabajo con n8n, consumo de APIs de IA e integración directa con agentes tipo Claude Code o Antigravity mediante MCP.           |
| **Entorno de Desarrollo**      | `Antigravity` `Git` `Docker`                   | Desarrollo asistido con Antigravity, control de versiones en Git y despliegue contenerizado con Docker para aislar y escalar cada servicio.                 |

---

## 5. Flujo Operativo de Extremo a Extremo

1. **Configuración del Entorno y Contexto:** El usuario ingresa a la oficina web, selecciona o instancia un agente trabajador y le vincula el contexto del proyecto, repositorios y *skills* permitidas a través de MCP.
2. **Asignación de Funciones:** Antes de finalizar su jornada, el usuario encarga las tareas a realizar (organización de información, gestión de correos, preparación de tareas o código) bajo sus métodos e instrucciones.
3. **Detección del Modo Descanso:** El sistema detecta que el usuario ha entrado en periodo de sueño (o el usuario lleva su avatar a la zona de descanso). La interfaz cambia a modo nocturno.
4. **Orquestación y Ejecución Nocturna:** El backend dispara los flujos en **n8n** e invoca a los agentes conectados (vía APIs de IA, Claude Code o Antigravity con MCP). Cada avance se registra en **PostgreSQL** y se emite por **WebSockets**, actualizando en vivo los monitores de la oficina virtual.
5. **Entrega Matutina y Continuidad:** Al despertar, el usuario visualiza en la pantalla principal de la oficina todas las tareas completadas, valida los resultados listos y retoma su jornada con el trabajo adelantado.

---

## 6. Estado de Validación y Finalización

- **Estado:** Tarea terminada con éxito.
- **Comentario de Cierre:** Tarea terminada con éxito. Se validó la conexión del Agente Conversacional Principal (Alex Vance) a través del chat de la oficina web y la orquestación central de n8n. Los tres agentes especializados (Sam Rivera - Co-worker, Taylor Chen - Secretaria, Jordan Díaz - Manager) cuentan con workflows activos y paneles interactivos. Cambios registrados en repositorios GitHub y en Google Drive con 0 emojis.