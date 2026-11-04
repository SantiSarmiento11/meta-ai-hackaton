# Documentación del Proyecto y Catálogo de Skills (Phaser + Web)

Este documento centraliza la información técnica del proyecto y clasifica las **54 skills activas** del repositorio por función y utilidad. Incluyendo **Phaser 4, React 19, mecánicas 2D, despliegue web y el ecosistema completo de automatizaciones n8n**.

## 1. Catálogo de Skills Activas por Función y Utilidad

A continuación se sintetizan las **54 skills** del proyecto clasificadas por área técnica. Cada ficha contiene su **Uso Principal** y un **Resumen en una Oración Breve**.

---

### Sección A: Stack Web, Frontend React 19 y Vercel (9 Skills)

Herramientas para el desarrollo de la interfaz de usuario, arquitectura web y despliegue continuo.

#### `vercel-react-best-practices`

- **Uso Principal:** Guías oficiales de Vercel para optimizar el rendimiento en React/Next.js, evitando re-renders innecesarios, fugas de memoria y bloqueos del hilo principal.
- **Resumen Breve:** Optimiza el rendimiento, gestión de estados y carga eficiente en aplicaciones React modernas.

#### `vercel-composition-patterns`

- **Uso Principal:** Patrones de arquitectura de componentes avanzados (compound components, render props y custom hooks de React 19) evitando la sobrecarga de props.
- **Resumen Breve:** Estructura componentes reutilizables, escalables y desacoplados en React.

#### `vercel-react-view-transitions`

- **Uso Principal:** Integración de la View Transition API nativa del navegador para animar cambios de vistas, pantallas y reordenamiento de elementos sin librerías pesadas.
- **Resumen Breve:** Proporciona transiciones visuales nativas y fluidas entre estados y vistas de React.

#### `web-design-guidelines`

- **Uso Principal:** Auditoría de interfaces web según principios de contraste visual, accesibilidad WCAG, tipografía responsiva y ergonomía de interacción.
- **Resumen Breve:** Garantiza estándares de accesibilidad, legibilidad y diseño limpio en interfaces web.

#### `deploy-to-vercel`

- **Uso Principal:** Automatización del despliegue del frontend hacia la plataforma Vercel, generando URLs públicas instantáneas.
- **Resumen Breve:** Despliega proyectos web a producción en Vercel de forma rápida y automatizada.

#### `vercel-cli-with-tokens`

- **Uso Principal:** Gestión de la CLI de Vercel mediante tokens de autenticación para entornos automatizados y configuración de variables de entorno seguras.
- **Resumen Breve:** Administra despliegues y variables de entorno mediante autenticación por tokens.

#### `vercel-optimize`

- **Uso Principal:** Análisis y diagnóstico de costes, métricas de Core Web Vitals, tiempos de carga y reducción del bundle de producción.
- **Resumen Breve:** Reduce tiempos de carga y audita el rendimiento del frontend en producción.

#### `vercel-react-native-skills`

- **Uso Principal:** Pautas y optimizaciones para compilar o adaptar componentes React a dispositivos móviles mediante React Native y Expo.
- **Resumen Breve:** Guía para optimizar componentes y rendimiento en entornos React Native y Expo.

#### `writing-guidelines`

- **Uso Principal:** Revisión del estilo, tono, claridad y gramática en textos de interfaz, diálogos de personajes y documentación técnica.
- **Resumen Breve:** Asegura una redacción clara, concisa y profesional en UI y documentación.

---

### Sección B: Motor Principal del Proyecto - Phaser 4 (2 Skills)

El núcleo técnico para la programación de escenas, bucle de juego y físicas 2D en web.

#### `phaser-core`

- **Uso Principal:** Inicialización y configuración de `Phaser.Game`, gestión del ciclo de vida de escenas (`init`, `preload`, `create`, `update`), cámaras y cargador de assets.
- **Resumen Breve:** Controla la arquitectura base, escenas y ciclo de vida del motor Phaser.

#### `phaser-arcade-physics`

- **Uso Principal:** Configuración del motor de físicas Arcade: asignación de cuerpos dinámicos/estáticos, velocidades, gravedad, rebote, fricción y grupos de colisión/solapamiento.
- **Resumen Breve:** Implementa movimiento cinemático, gravedad y detección de colisiones 2D en Phaser.

---

### Sección C: Diseño de Juego, Jugabilidad & Game Feel (10 Skills)

Sistemas transversales para lograr mecánicas pulidas, responsivas y con alto impacto visual/sonoro.

#### `game-feel`

- **Uso Principal:** Implementación de "jugo" (*juice*): sacudida de pantalla (*screen shake*), congelamiento de impacto (*hit-stop*), deformación elástica (*squash & stretch*) y micro-animaciones reactivas.
- **Resumen Breve:** Aporta impacto y satisfacción visceral a las acciones interactivas del jugador.

#### `camera-systems`

- **Uso Principal:** Algoritmos de cámara 2D con zonas muertas (*deadzones*), seguimiento suavizado (*lerp*), anticipación de movimiento (*look-ahead*) y límites de escenario.
- **Resumen Breve:** Diseña cámaras fluidas y naturales con seguimiento suave y encuadre reactivo.

#### `input-systems`

- **Uso Principal:** Abstracción de teclas a nombres de acciones, soporte simultáneo de teclado/mando/touch, *input buffering* y ventana de tolerancia de salto (*coyote time*).
- **Resumen Breve:** Centraliza el mapeo de controles, zonas muertas y mecánicas de entrada responsivas.

#### `physics-tuning`

- **Uso Principal:** Ajuste fino de física cinemática y dinámica, sincronización de paso fijo (*fixed timestep*), interpolación y prevención de atravesado de muros (*tunneling*).
- **Resumen Breve:** Calibra simulaciones físicas estables evitando rebotes erráticos y traspaso de objetos.

#### `audio-design`

- **Uso Principal:** Arquitectura de buses de sonido, control en decibelios, atenuación automática (*ducking*), música interactiva por capas y aleatoriedad en el tono de SFX.
- **Resumen Breve:** Diseña paisajes sonoros adaptativos, mezclas limpias y sincronización musical.

#### `create-game-assets`

- **Uso Principal:** Directrices de dirección artística, paletas de color, especificaciones de estilo y normalización técnica para sprites 2D, hojas de sprites y UI art.
- **Resumen Breve:** Estandariza la creación, formato y coherencia visual de los assets 2D del juego.

#### `shader-programming`

- **Uso Principal:** Desarrollo de shaders en GLSL para efectos de postprocesado 2D, viñetas, distorsión, contornos brillantes (*outlines*) y disolución de texturas.
- **Resumen Breve:** Crea efectos visuales avanzados y distorsiones mediante programación en GPU.

#### `level-design`

- **Uso Principal:** Metodología de bloqueo inicial (*greybox*), pacing de niveles, curvas de tensión/descanso, métricas de movimiento y diseño de encuentros.
- **Resumen Breve:** Estructura la arquitectura espacial, ritmo y dificultad de los niveles jugables.

#### `game-ui-ux`

- **Uso Principal:** Diseño de HUDs, barras de salud desacopladas, anclajes responsivos, áreas seguras y navegación completa mediante mando y teclado.
- **Resumen Breve:** Construye interfaces de juego accesibles, adaptables a cualquier resolución y centradas en el jugador.

#### `save-systems`

- **Uso Principal:** Serialización segura de datos de partida (en `localStorage` o IndexedDB), escritura atómica contra cierres inesperados, ranuras múltiples y migración de esquemas.
- **Resumen Breve:** Gestiona el guardado y carga persistente del progreso del juego de forma íntegra.

---

### Sección D: Inteligencia Artificial, NPCs y Narrativa (4 Skills)

Comportamiento autónomo de enemigos, generación de escenarios e historias interactivas.

#### `game-ai`

- **Uso Principal:** Algoritmos de navegación en cuadrícula (A*), máquinas de estados finitos (FSM) y comportamientos de dirección (*steering*: patrulla, persecución y evasión).
- **Resumen Breve:** Implementa la toma de decisiones básica y desplazamiento de enemigos y NPCs.

#### `ai-behavior-trees-utility-ai`

- **Uso Principal:** Árboles de comportamiento jerárquicos (nodos Sequence, Selector, Decorators, Blackboard) y toma de decisiones ponderada mediante curvas de utilidad continua.
- **Resumen Breve:** Modela conductas avanzadas y jerárquicas para agentes y jefes desafiantes.

#### `dialogue-systems`

- **Uso Principal:** Grafos de conversación no lineales, bifurcaciones de diálogo con variables lógicas y conectores con herramientas como Ink o Yarn Spinner.
- **Resumen Breve:** Gestiona conversaciones ramificadas, opciones de respuesta e historias interactivas.

#### `procedural-gen`

- **Uso Principal:** Generación algorítmica de mazmorras (BSP, caminata aleatoria), ruido Perlin/Simplex para biomas 2D y tablas de botín con probabilidades ponderadas.
- **Resumen Breve:** Genera mapas, terrenos y distribución de recompensas de forma procedural e infinita.

---

### Sección E: Arquetipos y Géneros de Juego 2D (8 Skills)

Mecánicas matemáticas y reglas probadas aplicables directamente sobre Phaser.

#### `platformer`

- **Uso Principal:** Lógicas de movimiento para plataformas 2D (salto de altura variable, deslizamiento y salto sobre paredes, plataformas móviles y peligros).
- **Resumen Breve:** Implementa las mecánicas esenciales y controles precisos de un juego de plataformas 2D.

#### `card-game`

- **Uso Principal:** Estructura de zonas (mazo, mano, descarte), costes de maná/energía, flujo de turnos y cola de resolución de efectos de cartas.
- **Resumen Breve:** Resuelve la lógica de turnos, reglas y mecánicas de juegos de cartas y deckbuilders.

#### `roguelike`

- **Uso Principal:** Movimiento por turnos en cuadrícula 2D, cálculo de campo de visión (*field-of-view*), niebla de guerra y permamuerte.
- **Resumen Breve:** Provee las bases mecánicas para mazmorras por turnos con permamuerte y niebla.

#### `rpg`

- **Uso Principal:** Progresión de personajes, tablas de experiencia y niveles, inventario con pesos, equipamiento y fórmulas de cálculo de daño.
- **Resumen Breve:** Modela sistemas de combate, estadísticas de personajes, equipo e inventarios de RPG.

#### `puzzle`

- **Uso Principal:** Lógica de casillas para mecánicas de tipo Sokoban, emparejamientos match-3 en cascada y sistema de reversión de jugadas (*undo*).
- **Resumen Breve:** Estructura juegos de lógica, patrones en cuadrícula y mecanismos para deshacer movimientos.

#### `tower-defense`

- **Uso Principal:** Algoritmos de oleadas coordinadas, torretas automáticas con prioridades de apuntado, proyectiles y economía de recursos.
- **Resumen Breve:** Controla la lógica de oleadas de enemigos, torretas defensivas y balance económico.

#### `survival-crafting`

- **Uso Principal:** Sistemas de recolección de materias primas, árbol de tecnologías/recetas de fabricación, construcción por piezas y necesidades vitales.
- **Resumen Breve:** Maneja la extracción de recursos, necesidades de supervivencia y recetas de crafteo.

#### `visual-novel`

- **Uso Principal:** Despliegue de fondos y retratos de personajes, cajas de diálogo con velocidad de tipeo, historial de texto (*backlog*) y saltos de escena condicionales.
- **Resumen Breve:** Desarrolla novelas visuales con fondos, personajes animados y registro de lectura.

---

### Sección F: Gestión de Hackathon, Prototipado y Publicación (6 Skills)

Productividad ágil bajo plazos estrictos, control de framerate y distribución final.

#### `router`

- **Uso Principal:** Identificación rápida de problemas de desarrollo de juegos para conectar inmediatamente con la skill temática especializada.
- **Resumen Breve:** Analiza una necesidad de desarrollo y la redirige hacia la skill técnica precisa.

#### `prototype-fast`

- **Uso Principal:** Metodología estricta de timeboxing de 60 minutos con figuras geométricas básicas (*greybox*) para validar si una mecánica es divertida antes de invertir tiempo.
- **Resumen Breve:** Construye y evalúa rápidamente un MVP jugable para descartar o validar mecánicas.

#### `game-jam`

- **Uso Principal:** Gestión de plazos críticos en hackathons: planificación por bloques horarios, priorización agresiva y poda de alcance (*scope cuts*).
- **Resumen Breve:** Organiza el tiempo y alcance para lograr entregar un juego completo antes del límite.

#### `performance-optimization`

- **Uso Principal:** Diagnóstico de caídas de cuadros por segundo, perfilado de CPU/GPU, pools de objetos para evitar el recolector de basura de JS y reducción de draw calls.
- **Resumen Breve:** Detecta cuellos de botella y asegura una tasa estable de 60 cuadros por segundo en web.

#### `itch-publish`

- **Uso Principal:** Empaquetado y subida directa de versiones web (HTML5) hacia Itch.io mediante Butler CLI.
- **Resumen Breve:** Automatiza la publicación y actualización de versiones jugables en Itch.io.

#### `steam-publish`

- **Uso Principal:** Configuración de paquetes, depósitos y publicación mediante scripts de Steamworks y SteamPipe (si se empaqueta para escritorio con Electron o Tauri).
- **Resumen Breve:** Prepara y publica ejecutables en la plataforma Steam mediante SteamPipe.

---

### Sección G: Automatización, Agentes y Flujos n8n (15 Skills)

Ecosistema especializado de herramientas para diseño, depuración, orquestación y despliegue de flujos de trabajo y agentes autónomos en n8n.

#### `n8n-agents`
- **Uso Principal:** Creación y orquestación de agentes de IA en n8n, configuración de memoria contextual, RAG, herramientas dinámicas y salidas estructuradas.
- **Resumen Breve:** Diseña e implementa agentes autónomos inteligentes con memoria y herramientas en n8n.

#### `n8n-workflow-patterns`
- **Uso Principal:** Aplicación de patrones de arquitectura de flujos: enrutamiento condicional, paralelismo, agregación de datos y colas de tareas.
- **Resumen Breve:** Estructura flujos de trabajo escalables, mantenibles y robustos en n8n.

#### `n8n-node-configuration`
- **Uso Principal:** Configuración exhaustiva de nodos nativos de n8n, mapeo de parámetros, credenciales y autenticación segura.
- **Resumen Breve:** Domina la parametrización y ajuste técnico de cualquier nodo en n8n.

#### `n8n-code-javascript`
- **Uso Principal:** Escritura de scripts en JavaScript moderno dentro de nodos Code para transformación de datos y lógica de negocio.
- **Resumen Breve:** Ejecuta lógica personalizada y transformación de estructuras de datos en JavaScript.

#### `n8n-code-python`
- **Uso Principal:** Procesamiento de datos y lógica compleja utilizando Python dentro del nodo Code de n8n.
- **Resumen Breve:** Integra algoritmos y transformaciones complejas de datos en Python dentro de flujos n8n.

#### `n8n-code-tool`
- **Uso Principal:** Construcción de herramientas personalizadas de código que los agentes de IA de n8n pueden invocar dinámicamente.
- **Resumen Breve:** Permite a los agentes autónomos ejecutar herramientas a medida programadas en código.

#### `n8n-subworkflows`
- **Uso Principal:** Modularización y reutilización de procesos extensos mediante subflujos independientes llamados por el nodo Execute Subworkflow.
- **Resumen Breve:** Desacopla y reutiliza flujos de trabajo complejos como subprocesos limpios.

#### `n8n-error-handling`
- **Uso Principal:** Diseño de flujos de contingencia, captura de excepciones, reintentos automáticos y alertas ante caídas de ejecución.
- **Resumen Breve:** Asegura la resiliencia y tolerancia a fallos en ejecuciones automáticas nocturnas.

#### `n8n-expression-syntax`
- **Uso Principal:** Dominio de la sintaxis de expresiones internas de n8n (`$json`, `$node`, jmespath, expresiones regulares).
- **Resumen Breve:** Manipula y extrae valores dinámicos entre nodos mediante expresiones nativas.

#### `n8n-binary-and-data`
- **Uso Principal:** Procesamiento, conversión y almacenamiento de archivos binarios, documentos PDF, imágenes y adjuntos en n8n.
- **Resumen Breve:** Gestiona archivos binarios y multimedia en flujos de datos automatizados.

#### `n8n-validation-expert`
- **Uso Principal:** Validación formal de estructuras JSON, esquemas de entrada/salida y contratos de datos entre servicios.
- **Resumen Breve:** Audita y valida la integridad de los datos que circulan entre nodos.

#### `n8n-mcp-tools-expert`
- **Uso Principal:** Conexión de servidores MCP (Model Context Protocol) a n8n para extender las capacidades de los modelos de IA.
- **Resumen Breve:** Conecta servidores y herramientas MCP directamente en flujos de agentes n8n.

#### `using-n8n-mcp-skills`
- **Uso Principal:** Guía de integración y mejores prácticas para el consumo de MCP en agentes de productividad.
- **Resumen Breve:** Protocolo de interoperabilidad entre herramientas MCP y flujos n8n.

#### `n8n-multi-instance`
- **Uso Principal:** Sincronización y despliegue de flujos entre entornos de desarrollo, staging y producción en múltiples servidores n8n.
- **Resumen Breve:** Gestiona la migración y coexistencia de flujos en múltiples instancias de n8n.

#### `n8n-self-hosting`
- **Uso Principal:** Despliegue en Docker, variables de entorno de producción, bases de datos (PostgreSQL), escalado y seguridad de servidores n8n.
- **Resumen Breve:** Configura, despliega y mantiene servidores n8n autoalojados en producción.
