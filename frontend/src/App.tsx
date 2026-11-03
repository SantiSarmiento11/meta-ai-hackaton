import { useState, useCallback, useEffect } from 'react';
import type * as Phaser from 'phaser';
import { PhaserGame } from './components/PhaserGame';
import type { MainScene, OperatingMode } from './game/scenes/MainScene';
import sleeplyLogo from './assets/sleeply (svg).svg';
import './App.css';

function App() {
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
  const [sceneInstance, setSceneInstance] = useState<MainScene | null>(null);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('day');
  const [isGridVisible, setIsGridVisible] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    setGameInstance(game);
  }, []);

  const handleSceneReady = useCallback((scene: MainScene) => {
    setSceneInstance(scene);
    setOperatingMode(scene.getCurrentMode());
    setIsGridVisible(scene.isGridVisible());
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

    gameInstance.events.on('mode-changed', handleModeChanged);
    gameInstance.events.on('grid-visibility-changed', handleGridChanged);

    return () => {
      gameInstance.events.off('mode-changed', handleModeChanged);
      gameInstance.events.off('grid-visibility-changed', handleGridChanged);
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

  return (
    <div className={`viewport-app ${operatingMode === 'night' ? 'mode-night' : 'mode-day'}`}>
      <PhaserGame
        onGameReady={handleGameReady}
        onSceneReady={handleSceneReady}
      />

      {/* Minimalist Floating HUD */}
      <header className="minimal-hud" role="region" aria-label="Controles del entorno">
        <div className="hud-pill brand-pill">
          <img src={sleeplyLogo} alt="Sleeply" className="hud-logo" />
          <span className="status-divider" />
          <span className={`status-indicator-dot ${operatingMode}`} />
          <span className="status-text">
            {operatingMode === 'day' ? 'Vigilia' : 'Modo Sueño'}
          </span>
        </div>

        <nav className="hud-actions" aria-label="Acciones principales">
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

          <button
            type="button"
            className={`hud-pill-button grid-btn ${isGridVisible ? 'active' : ''}`}
            onClick={toggleGrid}
            disabled={!sceneInstance}
            aria-pressed={isGridVisible}
            title="Alternar visibilidad de la cuadrícula isométrica 20x20 del piso"
          >
            <span className="btn-icon">#</span>
            <span className="btn-label">Cuadrícula 20x20</span>
          </button>
        </nav>
      </header>
    </div>
  );
}

export default App;
