import { useState, useCallback, useEffect } from 'react';
import type * as Phaser from 'phaser';
import { PhaserGame } from './components/PhaserGame';
import { ObjectCatalogDrawer } from './components/ObjectCatalogDrawer';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { AuthModal } from './components/AuthModal';
import { N8nStatusModal } from './components/N8nStatusModal';
import type { MainScene, OperatingMode } from './game/scenes/MainScene';
import { getCharacterById, type CharacterId } from './game/models/CharacterModel';
import { api, type User } from './services/api';
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

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
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

  // Character Selection State
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);
  const [showMovementHint, setShowMovementHint] = useState<boolean>(false);

  // Authentication & Persistence State
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !api.isAuthenticated());
  const [isN8nModalOpen, setIsN8nModalOpen] = useState<boolean>(false);
  const [selectedAgentCode, setSelectedAgentCode] = useState<'ASSISTANT' | 'COWORKER' | 'MANAGER' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [toast, setToast] = useState<ToastState | null>(null);

  const selectedCharacter = selectedCharacterId ? getCharacterById(selectedCharacterId) : null;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Loads office configuration from PostgreSQL via Backend API
  const loadOfficeFromBackend = useCallback(async (scene: MainScene) => {
    if (!api.isAuthenticated()) return;
    try {
      const office = await api.getOffice();
      if (!office) return;

      // Sync operating mode
      if (office.currentMode) {
        const modeNormalized = office.currentMode.toLowerCase() as OperatingMode;
        if (modeNormalized === 'day' || modeNormalized === 'night') {
          if (modeNormalized !== scene.getCurrentMode()) {
            scene.setOperatingMode(modeNormalized, 0);
            setOperatingMode(modeNormalized);
          }
        }
      }

      // Sync zoom
      if (typeof office.zoomLevel === 'number') {
        scene.setZoom(office.zoomLevel, 0);
        setCurrentZoom(office.zoomLevel);
      }

      // Sync grid visibility
      if (typeof office.isGridVisible === 'boolean') {
        scene.setGridVisible(office.isGridVisible);
        setIsGridVisible(office.isGridVisible);
      }

      // Sync player avatar
      if (office.selectedAvatarId) {
        const charId = office.selectedAvatarId as CharacterId;
        setSelectedCharacterId(charId);
        scene.spawnPlayer(charId);
      }

      // Sync placed furniture objects
      const objManager = scene.getObjectManager();
      if (objManager && Array.isArray(office.objects)) {
        objManager.clearAll();
        office.objects.forEach((item) => {
          objManager.placeObject(item.objectId, item.col, item.row, item.instanceId);
        });
      }

      // Sync and spawn live agents with speech bubbles in the office
      try {
        const agentStates = await api.getAgentActivity();
        scene.getAgentManager()?.spawnAllAgents(agentStates);
      } catch (agentErr: any) {
        console.warn('[loadOfficeFromBackend] Could not load agent activities:', agentErr.message);
        scene.getAgentManager()?.spawnAllAgents();
      }

      showToast('Oficina personal cargada desde PostgreSQL', 'success');
    } catch (err: any) {
      console.warn('[loadOfficeFromBackend] Could not load office:', err.message);
    }
  }, [showToast]);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    setGameInstance(game);
  }, []);

  const handleSceneReady = useCallback((scene: MainScene) => {
    setSceneInstance(scene);
    setOperatingMode(scene.getCurrentMode());
    setIsGridVisible(scene.isGridVisible());
    setCurrentZoom(scene.getZoom());
    setIsPhysicsDebug(scene.isPhysicsDebug());

    if (api.isAuthenticated() && currentUser) {
      scene.setInputEnabled(true);
      loadOfficeFromBackend(scene);
    } else {
      // Strictly prevent unauthenticated visitors from interacting or moving
      scene.setInputEnabled(false);
      setIsAuthModalOpen(true);
    }
  }, [currentUser, loadOfficeFromBackend]);

  const handleSelectCharacter = useCallback((charId: CharacterId) => {
    setSelectedCharacterId(charId);
    setIsCharacterModalOpen(false);

    if (sceneInstance) {
      sceneInstance.spawnPlayer(charId);
    }

    setShowMovementHint(true);
    setTimeout(() => {
      setShowMovementHint(false);
    }, 7000);
  }, [sceneInstance]);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`¡Bienvenido ${user.name}! Sesión iniciada con éxito.`, 'success');

    if (sceneInstance) {
      sceneInstance.setInputEnabled(true);
      loadOfficeFromBackend(sceneInstance);
    }
  }, [loadOfficeFromBackend, sceneInstance, showToast]);

  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    if (sceneInstance) {
      sceneInstance.setInputEnabled(false);
      const player = sceneInstance.getPlayer();
      if (player) {
        player.setVelocity(0, 0);
      }
    }
    showToast('Has cerrado sesión. Acceso bloqueado hasta nuevo inicio de sesión.', 'info');
  }, [sceneInstance, showToast]);

  const handleSaveOffice = useCallback(async () => {
    if (!sceneInstance) return;

    if (!api.isAuthenticated()) {
      setIsAuthModalOpen(true);
      return;
    }

    setSaveStatus('saving');
    try {
      const objManager = sceneInstance.getObjectManager();
      const placed = objManager ? objManager.getPlacedObjects() : [];

      const formattedObjects = placed.map((p) => ({
        instanceId: p.id,
        objectId: p.definition.id,
        col: p.gridCol,
        row: p.gridRow,
        width: p.definition.footprint.width,
        height: p.definition.footprint.height,
      }));

      await api.saveOffice({
        name: 'Oficina Central Sleeply',
        currentMode: operatingMode,
        selectedAvatarId: selectedCharacterId || 'char_0',
        zoomLevel: currentZoom,
        isGridVisible,
        objects: formattedObjects,
      });

      setSaveStatus('saved');
      showToast('Oficina y mobiliario guardados exitosamente en PostgreSQL', 'success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(`Error al guardar: ${err.message}`, 'error');
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  }, [currentZoom, isGridVisible, operatingMode, sceneInstance, selectedCharacterId, showToast]);

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
      setIsCatalogOpen(false);
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

    const handleAgentSelected = (code: 'ASSISTANT' | 'COWORKER' | 'MANAGER') => {
      setSelectedAgentCode(code);
      setIsN8nModalOpen(true);
    };

    gameInstance.events.on('mode-changed', handleModeChanged);
    gameInstance.events.on('grid-visibility-changed', handleGridChanged);
    gameInstance.events.on('zoom-changed', handleZoomChanged);

    gameInstance.events.on('placement-mode-started', handlePlacementStarted);
    gameInstance.events.on('placement-mode-ended', handlePlacementEnded);
    gameInstance.events.on('object-selected', handleObjectSelected);
    gameInstance.events.on('physics-debug-toggled', handlePhysicsDebugToggled);
    gameInstance.events.on('agent-selected', handleAgentSelected);

    return () => {
      gameInstance.events.off('mode-changed', handleModeChanged);
      gameInstance.events.off('grid-visibility-changed', handleGridChanged);
      gameInstance.events.off('zoom-changed', handleZoomChanged);

      gameInstance.events.off('placement-mode-started', handlePlacementStarted);
      gameInstance.events.off('placement-mode-ended', handlePlacementEnded);
      gameInstance.events.off('object-selected', handleObjectSelected);
      gameInstance.events.off('physics-debug-toggled', handlePhysicsDebugToggled);
      gameInstance.events.off('agent-selected', handleAgentSelected);
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
    gameInstance.events.emit('request-start-placement', '');
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

      {/* Floating HUD with Sleeply Blue Design System (Only accessible once authenticated) */}
      {currentUser && (
        <header className="minimal-hud" role="region" aria-label="Controles del entorno">
          <div className="brand-container">
            <img
              src={sleeplyLogo}
              alt="Sleeply"
              className="brand-logo-white"
            />

            <div className="hud-user-section" style={{ marginLeft: 16 }}>
              <div className="user-profile-badge" title={currentUser.email}>
                <span className="user-role-tag">{currentUser.role || 'CEO'}</span>
                <span className="user-name-text">{currentUser.name}</span>
              </div>
              <button
                type="button"
                className="hud-logout-btn auth-scale-button"
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                ⏻
              </button>
            </div>
          </div>

          <nav className="hud-actions" aria-label="Acciones principales">
            {/* n8n Automation Status Modal Trigger */}
            <button
              type="button"
              className="hud-pill-button n8n-btn"
              onClick={() => setIsN8nModalOpen(true)}
              title="Ver panel de orquestación multi-agente, workflows en n8n y Meta AI"
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-label">Agentes & n8n</span>
            </button>

            {/* Save Office Button */}
            <button
              type="button"
              className={`hud-pill-button save-btn ${saveStatus === 'saved' ? 'saved' : ''}`}
              onClick={handleSaveOffice}
              disabled={!sceneInstance || saveStatus === 'saving'}
              title="Guardar oficina actual y mobiliario en la base de datos PostgreSQL"
            >
              <span className="btn-icon">{saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✓' : '💾'}</span>
              <span className="btn-label">
                {saveStatus === 'saving'
                  ? 'Guardando...'
                  : saveStatus === 'saved'
                  ? '¡Guardado!'
                  : 'Guardar'}
              </span>
            </button>

            {/* Character Switcher */}
            <button
              type="button"
              className="hud-pill-button character-selector-btn"
              onClick={() => setIsCharacterModalOpen(true)}
              disabled={!sceneInstance}
              title="Elegir o cambiar personaje para recorrer la oficina"
              aria-label="Seleccionar personaje"
            >
              {selectedCharacter ? (
                <>
                  <img
                    src={selectedCharacter.avatarUrl}
                    alt={selectedCharacter.name}
                    className="hud-avatar-thumb"
                  />
                  <span className="btn-label">{selectedCharacter.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">👤</span>
                  <span className="btn-label">Personaje</span>
                </>
              )}
            </button>

            {/* Furniture Catalog */}
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

            {/* Physics Debug */}
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

            {/* Zoom Controls */}
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

            {/* Grid Toggle */}
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

            {/* Mode Switcher */}
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
      )}

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

      {/* Toast Notification */}
      {toast && (
        <div className={`sync-status-toast ${toast.type}`} role="status">
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Movement Instruction Toast */}
      {showMovementHint && (
        <div className="movement-hint-toast" role="status" aria-live="polite">
          <span className="hint-icon">🚶</span>
          <span>
            <strong>¡Personaje listo!</strong> Usa <code>WASD</code> o <code>Flechas</code> para caminar, o <strong>haz clic</strong> en el piso.
          </span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setShowMovementHint(false)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
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

      {/* Character Selection Onboarding / Switcher Modal */}
      <CharacterSelectModal
        isOpen={isCharacterModalOpen}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={handleSelectCharacter}
        onClose={() => setIsCharacterModalOpen(false)}
        canClose={selectedCharacterId !== null}
      />

      {/* Sleeply Fullscreen Mandatory Auth Portal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onSuccess={handleLoginSuccess}
      />

      {/* n8n Automation Diagnostics & Multi-Agent Modal */}
      <N8nStatusModal
        isOpen={isN8nModalOpen}
        onClose={() => {
          setIsN8nModalOpen(false);
          setSelectedAgentCode(null);
        }}
        gameInstance={gameInstance}
        initialAgentCode={selectedAgentCode}
      />
    </div>
  );
}

export default App;
