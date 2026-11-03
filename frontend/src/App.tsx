import { useState, useCallback, useEffect } from 'react';
import type * as Phaser from 'phaser';
import { PhaserGame } from './components/PhaserGame';
import { ObjectCatalogDrawer } from './components/ObjectCatalogDrawer';
import type { MainScene, OperatingMode } from './game/scenes/MainScene';
import sleeplyLogo from './assets/sleeply (svg).svg';
import './App.css';

interface ActivePlacingState {
  objectId: string;
  name: string;
  footprint: { width: number; height: number };
  isMoving?: boolean;
}

interface SelectedObjectState {
  instanceId: string;
  objectId: string;
  name: string;
  col: number;
  row: number;
  footprint: { width: number; height: number };
}

function App() {
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
  const [sceneInstance, setSceneInstance] = useState<MainScene | null>(null);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('day');
  const [isGridVisible, setIsGridVisible] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);

  // Object Placement & Selection State
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [activePlacing, setActivePlacing] = useState<ActivePlacingState | null>(null);
  const [selectedObject, setSelectedObject] = useState<SelectedObjectState | null>(null);
  const [isPhysicsDebug, setIsPhysicsDebug] = useState<boolean>(false);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    setGameInstance(game);
  }, []);

  const handleSceneReady = useCallback((scene: MainScene) => {
    setSceneInstance(scene);
    setOperatingMode(scene.getCurrentMode());
    setIsGridVisible(scene.isGridVisible());
    setCurrentZoom(scene.getZoom());
    setIsPhysicsDebug(scene.isPhysicsDebug());
  }, []);

  useEffect(() => {
    if (!gameInstance) return;

    const handleModeChanged = (mode: OperatingMode) => {
      setOperatingMode(mode);
      setIsTransitioning(false);
    };

    const handleGridChanged = (visible: boolean) => {
      setIsGridVisible(visible);
    };

    const handleZoomChanged = (zoom: number) => {
      setCurrentZoom(zoom);
    };

    const handlePlacementStarted = (data: ActivePlacingState) => {
      setActivePlacing(data);
      setIsCatalogOpen(false); // Close catalog to allow unobstructed view of office
    };

    const handlePlacementEnded = () => {
      setActivePlacing(null);
    };

    const handleObjectSelected = (data: SelectedObjectState | null) => {
      setSelectedObject(data);
    };

    const handlePhysicsDebugToggled = (active: boolean) => {
      setIsPhysicsDebug(active);
    };

    gameInstance.events.on('mode-changed', handleModeChanged);
    gameInstance.events.on('grid-visibility-changed', handleGridChanged);
    gameInstance.events.on('zoom-changed', handleZoomChanged);

    gameInstance.events.on('placement-mode-started', handlePlacementStarted);
    gameInstance.events.on('placement-mode-ended', handlePlacementEnded);
    gameInstance.events.on('object-selected', handleObjectSelected);
    gameInstance.events.on('physics-debug-toggled', handlePhysicsDebugToggled);

    return () => {
      gameInstance.events.off('mode-changed', handleModeChanged);
      gameInstance.events.off('grid-visibility-changed', handleGridChanged);
      gameInstance.events.off('zoom-changed', handleZoomChanged);

      gameInstance.events.off('placement-mode-started', handlePlacementStarted);
      gameInstance.events.off('placement-mode-ended', handlePlacementEnded);
      gameInstance.events.off('object-selected', handleObjectSelected);
      gameInstance.events.off('physics-debug-toggled', handlePhysicsDebugToggled);
    };
  }, [gameInstance]);

  const toggleMode = () => {
    if (!gameInstance || isTransitioning) return;
    setIsTransitioning(true);
    gameInstance.events.emit('request-toggle-mode');
  };

  const toggleGrid = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-toggle-grid');
  };

  const zoomIn = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-zoom-in');
  };

  const zoomOut = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-zoom-out');
  };

  const resetZoom = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-zoom-reset');
  };

  // Placement handlers
  const handleStartPlacement = (objectId: string) => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-start-placement', objectId);
  };

  const handleCancelPlacement = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-cancel-placement');
  };

  const handleMoveSelected = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-move-selected');
  };

  const handleRemoveSelected = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-remove-selected');
  };

  const handleDeselect = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-start-placement', ''); // will trigger null or we can emit deselect
    sceneInstance?.getObjectManager()?.selectObject(null);
  };

  const handleClearAll = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-clear-all');
  };

  const handleTogglePhysicsDebug = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-toggle-physics-debug');
  };

  return (
    <div className={`viewport-app ${operatingMode === 'night' ? 'mode-night' : 'mode-day'}`}>
      <PhaserGame
        onGameReady={handleGameReady}
        onSceneReady={handleSceneReady}
      />

      {/* Minimalist Floating HUD */}
      <header className="minimal-hud" role="region" aria-label="Controles del entorno">
        {/* Sleeply Logo in White and larger */}
        <div className="brand-container">
          <img
            src={sleeplyLogo}
            alt="Sleeply"
            className="brand-logo-white"
          />
        </div>

        {/* Minimal Actions: Catalog, Zoom, Grid and Day/Night */}
        <nav className="hud-actions" aria-label="Acciones principales">
          <button
            type="button"
            className={`hud-pill-button catalog-btn ${isCatalogOpen ? 'active' : ''}`}
            onClick={() => setIsCatalogOpen((prev) => !prev)}
            disabled={!sceneInstance}
            title="Abrir catálogo unificado de 160 objetos de oficina para colocar en el entorno"
            aria-expanded={isCatalogOpen}
          >
            <span className="btn-icon">🪑</span>
            <span className="btn-label">Mobiliario</span>
          </button>

          <button
            type="button"
            className={`hud-pill-button physics-btn ${isPhysicsDebug ? 'active' : ''}`}
            onClick={handleTogglePhysicsDebug}
            disabled={!sceneInstance}
            title="Alternar visualización de cajas de colisión Phaser Arcade Physics"
            aria-pressed={isPhysicsDebug}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-label">{isPhysicsDebug ? 'Físicas ON' : 'Físicas'}</span>
          </button>

          <div className="zoom-controls" role="group" aria-label="Controles de zoom">
            <button
              type="button"
              className="hud-pill-button zoom-btn"
              onClick={zoomOut}
              disabled={!sceneInstance || currentZoom <= 0.75}
              title="Alejar vista (Zoom-out)"
              aria-label="Alejar vista"
            >
              −
            </button>
            <button
              type="button"
              className="hud-pill-button zoom-level-btn"
              onClick={resetZoom}
              disabled={!sceneInstance || currentZoom === 1.0}
              title="Restablecer zoom al 100%"
              aria-label="Restablecer zoom"
            >
              {Math.round(currentZoom * 100)}%
            </button>
            <button
              type="button"
              className="hud-pill-button zoom-btn"
              onClick={zoomIn}
              disabled={!sceneInstance || currentZoom >= 1.45}
              title="Acercar vista (Zoom-in)"
              aria-label="Acercar vista"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={`hud-pill-button grid-btn ${isGridVisible ? 'active' : ''}`}
            onClick={toggleGrid}
            disabled={!sceneInstance}
            aria-pressed={isGridVisible}
            title="Alternar visibilidad de la cuadrícula isométrica 20x20 del piso"
          >
            <span className="btn-icon">#</span>
            <span className="btn-label">Cuadrícula</span>
          </button>

          <button
            type="button"
            className={`hud-pill-button mode-btn ${operatingMode === 'night' ? 'night' : 'day'}`}
            onClick={toggleMode}
            disabled={!sceneInstance || isTransitioning}
            aria-label="Alternar entre modo día y noche"
          >
            <span className="btn-icon">{operatingMode === 'day' ? '☾' : '☼'}</span>
            <span className="btn-label">
              {isTransitioning
                ? 'Cambiando...'
                : operatingMode === 'day'
                  ? 'Modo Noche'
                  : 'Modo Día'}
            </span>
          </button>
        </nav>
      </header>

      {/* Active Placement Banner */}
      {activePlacing && (
        <section className="active-placement-banner" aria-live="polite">
          <div className="placement-status">
            <span className="placement-pulsing-dot" />
            <span className="placement-instruction">
              {activePlacing.isMoving ? 'Moviendo:' : 'Colocando:'}{' '}
              <strong>{activePlacing.name}</strong> ({activePlacing.footprint.width}x
              {activePlacing.footprint.height})
            </span>
            <span className="placement-hint">— Haz clic en una casilla libre del piso</span>
          </div>

          <button
            type="button"
            className="placement-cancel-btn"
            onClick={handleCancelPlacement}
            title="Cancelar colocación (Esc)"
          >
            Cancelar (Esc)
          </button>
        </section>
      )}

      {/* Selected Object Context Floating Bar */}
      {selectedObject && !activePlacing && (
        <section className="selected-object-bar" aria-label="Acciones de objeto seleccionado">
          <div className="selected-info">
            <span className="selected-icon">📍</span>
            <span className="selected-name">{selectedObject.name}</span>
            <span className="selected-coords">
              [{selectedObject.col}, {selectedObject.row}] ({selectedObject.footprint.width}x
              {selectedObject.footprint.height})
            </span>
          </div>

          <div className="selected-actions">
            <button
              type="button"
              className="selected-action-btn move"
              onClick={handleMoveSelected}
              title="Mover este objeto a otra casilla"
            >
              🔄 Mover
            </button>
            <button
              type="button"
              className="selected-action-btn delete"
              onClick={handleRemoveSelected}
              title="Eliminar este objeto (Supr)"
            >
              🗑 Eliminar
            </button>
            <button
              type="button"
              className="selected-action-btn close"
              onClick={handleDeselect}
              title="Deseleccionar"
            >
              ✕
            </button>
          </div>
        </section>
      )}

      {/* Object Catalog Drawer */}
      <ObjectCatalogDrawer
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onStartPlacement={handleStartPlacement}
        activePlacingObjectId={activePlacing?.objectId ?? null}
        onClearAll={handleClearAll}
        isPhysicsDebug={isPhysicsDebug}
        onTogglePhysicsDebug={handleTogglePhysicsDebug}
      />
    </div>
  );
}

export default App;
