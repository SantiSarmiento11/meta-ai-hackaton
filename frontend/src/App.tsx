import { useState, useCallback, useEffect } from 'react';
import type * as Phaser from 'phaser';
import { PhaserGame } from './components/PhaserGame';
import { ObjectCatalogDrawer } from './components/ObjectCatalogDrawer';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { AuthModal } from './components/AuthModal';
import { N8nStatusModal } from './components/N8nStatusModal';
import { OfficeChatModal } from './components/OfficeChatModal';
import type { MainScene, OperatingMode } from './game/scenes/MainScene';
import { type CharacterId } from './game/models/CharacterModel';
import { api, type User } from './services/api';
import sleeplyLogo from './assets/sleeply (svg).svg';
import {
  PowerIcon,
  SpinnerIcon,
  CheckIcon,
  CheckCircleIcon,
  FurnitureIcon,
  ChatIcon,
  SunIcon,
  MoonIcon,
  PinIcon,
  MoveIcon,
  TrashIcon,
  CloseIcon,
  AlertTriangleIcon,
  InfoIcon,
} from './components/Icons';
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

  // Furniture Mode State
  const [isFurnitureMode, setIsFurnitureMode] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [activePlacing, setActivePlacing] = useState<ActivePlacingState | null>(null);
  const [selectedObject, setSelectedObject] = useState<SelectedObjectState | null>(null);

  // Character State
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);

  // Authentication & Persistence State
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !api.isAuthenticated());
  const [isN8nModalOpen, setIsN8nModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedAgentCode, setSelectedAgentCode] = useState<'ASSISTANT' | 'COWORKER' | 'MANAGER' | 'CEO' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [toast, setToast] = useState<ToastState | null>(null);

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

      // Grid is kept OFF by default outside furniture mode
      scene.setGridVisible(false);
      setIsGridVisible(false);

      // Sync player avatar
      const charId = (office.selectedAvatarId as CharacterId) || 'char_0';
      setSelectedCharacterId(charId);
      scene.spawnPlayer(charId);

      // Sync placed furniture objects
      const objManager = scene.getObjectManager();
      if (objManager && Array.isArray(office.objects)) {
        objManager.clearAll();
        office.objects.forEach((item) => {
          objManager.placeObject(item.objectId, item.col, item.row, item.instanceId);
        });
      }

      // Sync and spawn live agents
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
    // Initial state: grid is off outside furniture mode
    scene.setGridVisible(false);
    setIsGridVisible(false);
    setCurrentZoom(scene.getZoom());

    if (api.isAuthenticated() && currentUser) {
      scene.setInputEnabled(true);
      loadOfficeFromBackend(scene);
    } else {
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
  }, [sceneInstance]);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome ${user.name}. Successfully logged in.`, 'success');

    if (sceneInstance) {
      sceneInstance.setInputEnabled(true);
      loadOfficeFromBackend(sceneInstance);
    }
  }, [loadOfficeFromBackend, sceneInstance, showToast]);

  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
    setIsFurnitureMode(false);
    setIsCatalogOpen(false);
    setIsAuthModalOpen(true);
    if (sceneInstance) {
      sceneInstance.setInputEnabled(false);
      sceneInstance.setGridVisible(false);
      setIsGridVisible(false);
      const player = sceneInstance.getPlayer();
      if (player) {
        player.setVelocity(0, 0);
      }
    }
    showToast('You have logged out. Access locked until next login.', 'info');
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
        name: 'Sleeply Central Office',
        currentMode: operatingMode,
        selectedAvatarId: selectedCharacterId || 'char_0',
        zoomLevel: currentZoom,
        isGridVisible,
        objects: formattedObjects,
      });

      setSaveStatus('saved');
      showToast('Furniture layout saved successfully to PostgreSQL', 'success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(`Save failed: ${err.message}`, 'error');
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
      // Grid is active during placement
      sceneInstance?.setGridVisible(true);
      setIsGridVisible(true);
    };

    const handlePlacementEnded = () => {
      setActivePlacing(null);
      // Maintain grid and reopen catalog if still in furniture mode
      if (isFurnitureMode) {
        sceneInstance?.setGridVisible(true);
        setIsGridVisible(true);
        setIsCatalogOpen(true);
      } else {
        sceneInstance?.setGridVisible(false);
        setIsGridVisible(false);
      }
    };

    const handleObjectSelected = (data: SelectedObjectState | null) => {
      setSelectedObject(data);
    };

    const handleAgentSelected = (code: 'ASSISTANT' | 'COWORKER' | 'MANAGER' | 'CEO') => {
      setSelectedAgentCode(code);
      setIsChatOpen(true);
    };

    gameInstance.events.on('mode-changed', handleModeChanged);
    gameInstance.events.on('grid-visibility-changed', handleGridChanged);
    gameInstance.events.on('zoom-changed', handleZoomChanged);

    gameInstance.events.on('placement-mode-started', handlePlacementStarted);
    gameInstance.events.on('placement-mode-ended', handlePlacementEnded);
    gameInstance.events.on('object-selected', handleObjectSelected);
    gameInstance.events.on('agent-selected', handleAgentSelected);

    return () => {
      gameInstance.events.off('mode-changed', handleModeChanged);
      gameInstance.events.off('grid-visibility-changed', handleGridChanged);
      gameInstance.events.off('zoom-changed', handleZoomChanged);

      gameInstance.events.off('placement-mode-started', handlePlacementStarted);
      gameInstance.events.off('placement-mode-ended', handlePlacementEnded);
      gameInstance.events.off('object-selected', handleObjectSelected);
      gameInstance.events.off('agent-selected', handleAgentSelected);
    };
  }, [gameInstance, isFurnitureMode, sceneInstance]);

  const toggleMode = () => {
    if (!gameInstance || isTransitioning) return;
    setIsTransitioning(true);
    gameInstance.events.emit('request-toggle-mode');
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

  // Enter Furniture Mode & Catalog Menu
  const handleToggleFurnitureMode = () => {
    setIsFurnitureMode(true);
    setIsCatalogOpen(true);
    sceneInstance?.setGridVisible(true);
    setIsGridVisible(true);
  };

  const handleStartPlacement = (objectId: string) => {
    if (!gameInstance) return;
    sceneInstance?.setGridVisible(true);
    setIsGridVisible(true);
    gameInstance.events.emit('request-start-placement', objectId);
  };

  const handleCancelPlacement = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-cancel-placement');
    if (isFurnitureMode) {
      sceneInstance?.setGridVisible(true);
      setIsGridVisible(true);
      setIsCatalogOpen(true);
    } else {
      sceneInstance?.setGridVisible(false);
      setIsGridVisible(false);
    }
  };

  // Finish furniture mode / confirm ready and persist to PostgreSQL
  const handleFinishDesign = async () => {
    if (activePlacing) {
      handleCancelPlacement();
    }
    if (selectedObject) {
      handleDeselect();
    }
    sceneInstance?.setGridVisible(false);
    setIsGridVisible(false);
    setIsCatalogOpen(false);

    try {
      await handleSaveOffice();
    } finally {
      setIsFurnitureMode(false);
    }
  };

  const handleMoveSelected = () => {
    if (!gameInstance) return;
    sceneInstance?.setGridVisible(true);
    setIsGridVisible(true);
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
    if (!isFurnitureMode) {
      sceneInstance?.setGridVisible(false);
      setIsGridVisible(false);
    }
  };

  const handleClearAll = () => {
    if (!gameInstance) return;
    gameInstance.events.emit('request-clear-all');
  };

  return (
    <div className={`viewport-app ${operatingMode === 'night' ? 'mode-night' : 'mode-day'}`}>
      <PhaserGame
        onGameReady={handleGameReady}
        onSceneReady={handleSceneReady}
      />

      {/* Floating HUD Overlay */}
      {currentUser && (
        <header className="minimal-hud" role="region" aria-label="Environment controls">
          <div className="brand-container">
            <img
              src={sleeplyLogo}
              alt="Sleeply"
              className="brand-logo-white"
            />
            <button
              type="button"
              className="brand-logout-btn auth-scale-button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <PowerIcon size={18} />
            </button>
          </div>

          <nav className="hud-actions" aria-label="Main actions">
            {isFurnitureMode ? (
              <button
                type="button"
                className="hud-pill-button done-btn auth-scale-button"
                onClick={handleFinishDesign}
                disabled={saveStatus === 'saving'}
                title="Finish and save furniture changes"
              >
                <span className="btn-icon">
                  {saveStatus === 'saving' ? (
                    <SpinnerIcon size={16} />
                  ) : (
                    <CheckIcon size={16} />
                  )}
                </span>
                <span className="btn-label">
                  {saveStatus === 'saving' ? 'Saving...' : 'Done'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="hud-pill-button catalog-btn"
                onClick={handleToggleFurnitureMode}
                title="Edit office furniture"
              >
                <span className="btn-icon">
                  <FurnitureIcon size={16} />
                </span>
                <span className="btn-label">Furniture</span>
              </button>
            )}

            {/* Principal Agent Chat Button */}
            <button
              type="button"
              className={`hud-pill-button chat-btn ${isChatOpen ? 'active' : ''}`}
              onClick={() => setIsChatOpen((prev) => !prev)}
              title="Open Principal Agent Chat (Alex Vance)"
              aria-label="Open Principal Agent Chat"
            >
              <span className="btn-icon">
                <ChatIcon size={16} />
              </span>
              <span className="btn-label">Principal Agent Chat</span>
            </button>

            {/* Zoom Controls */}
            <div className="zoom-controls" role="group" aria-label="Zoom controls">
              <button
                type="button"
                className="hud-pill-button zoom-btn"
                onClick={zoomOut}
                disabled={currentZoom <= 0.75}
                title="Zoom out"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                type="button"
                className="hud-pill-button zoom-level-btn"
                onClick={resetZoom}
                disabled={currentZoom === 1.0}
                title="Reset zoom to 100%"
                aria-label="Reset zoom"
              >
                {Math.round(currentZoom * 100)}%
              </button>
              <button
                type="button"
                className="hud-pill-button zoom-btn"
                onClick={zoomIn}
                disabled={currentZoom >= 1.45}
                title="Zoom in"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>

            {/* Mode Switcher */}
            <button
              type="button"
              className={`hud-pill-button mode-btn ${operatingMode === 'night' ? 'night' : 'day'}`}
              onClick={toggleMode}
              disabled={isTransitioning}
              aria-label="Toggle day and night mode"
            >
              <span className="btn-icon">
                {operatingMode === 'day' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </span>
              <span className="btn-label">
                {isTransitioning
                  ? 'Switching...'
                  : operatingMode === 'day'
                  ? 'Night Mode'
                  : 'Day Mode'}
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
              {activePlacing.isMoving ? 'Moving:' : 'Placing:'}{' '}
              <strong>{activePlacing.name}</strong> ({activePlacing.footprint.width}x
              {activePlacing.footprint.height})
            </span>
            <span className="placement-hint">— Click on an empty floor tile</span>
          </div>

          <button
            type="button"
            className="placement-cancel-btn"
            onClick={handleCancelPlacement}
            title="Cancel placement (Esc)"
          >
            Cancel (Esc)
          </button>
        </section>
      )}

      {/* Selected Object Context Floating Bar */}
      {selectedObject && !activePlacing && (
        <section className="selected-object-bar" aria-label="Selected object actions">
          <div className="selected-info">
            <span className="selected-icon">
              <PinIcon size={15} />
            </span>
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
              title="Move this object to another tile"
            >
              <MoveIcon size={14} />
              <span>Move</span>
            </button>
            <button
              type="button"
              className="selected-action-btn delete"
              onClick={handleRemoveSelected}
              title="Delete this object (Del)"
            >
              <TrashIcon size={14} />
              <span>Delete</span>
            </button>
            <button
              type="button"
              className="selected-action-btn close"
              onClick={handleDeselect}
              title="Deselect"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`sync-status-toast ${toast.type}`} role="status">
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {toast.type === 'success' ? (
              <CheckCircleIcon size={16} />
            ) : toast.type === 'error' ? (
              <AlertTriangleIcon size={16} />
            ) : (
              <InfoIcon size={16} />
            )}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Object Catalog Drawer */}
      <ObjectCatalogDrawer
        isOpen={isCatalogOpen}
        onClose={handleFinishDesign}
        onStartPlacement={handleStartPlacement}
        activePlacingObjectId={activePlacing?.objectId ?? null}
        onClearAll={handleClearAll}
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
          gameInstance?.events.emit('request-hide-agent-bubbles');
        }}
        gameInstance={gameInstance}
        initialAgentCode={selectedAgentCode}
      />

      {/* Principal & Multi-Agent Conversational Chat powered by Meta AI & PostgreSQL */}
      <OfficeChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          gameInstance?.events.emit('request-hide-agent-bubbles');
        }}
        gameInstance={gameInstance}
        selectedAgentCode={selectedAgentCode}
        onSelectAgent={(code) => setSelectedAgentCode(code)}
        onOpenDiagnostics={() => {
          setIsChatOpen(false);
          setIsN8nModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
