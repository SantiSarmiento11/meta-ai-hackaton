import { useState } from 'react';
import {
  CHARACTERS_CATALOG,
  type CharacterId,
  type CharacterProfile,
} from '../game/models/CharacterModel';
import './CharacterSelectModal.css';

interface CharacterSelectModalProps {
  isOpen: boolean;
  selectedCharacterId: CharacterId | null;
  onSelectCharacter: (characterId: CharacterId) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const CharacterSelectModal = ({
  isOpen,
  selectedCharacterId,
  onSelectCharacter,
  onClose,
  canClose = true,
}: CharacterSelectModalProps) => {
  const [activeId, setActiveId] = useState<CharacterId>(
    selectedCharacterId ?? 'char_0'
  );
  const [prevSelectedId, setPrevSelectedId] = useState<CharacterId | null>(selectedCharacterId);

  // Synchronize state during render without cascading effects
  if (selectedCharacterId !== prevSelectedId) {
    setPrevSelectedId(selectedCharacterId);
    if (selectedCharacterId) {
      setActiveId(selectedCharacterId);
    }
  }

  if (!isOpen) return null;

  const currentProfile = CHARACTERS_CATALOG.find((c) => c.id === activeId) ?? CHARACTERS_CATALOG[0];

  const handleConfirm = () => {
    onSelectCharacter(activeId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape' && canClose && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="character-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="char-modal-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="character-modal-backdrop" onClick={canClose ? onClose : undefined} />

      <div className="character-modal-dialog">
        {canClose && onClose && (
          <button
            type="button"
            className="character-modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        )}

        <header className="character-modal-header">
          <div className="character-modal-badge">
            <span className="pulsing-status-dot" />
            Sleeply Workspace
          </div>
          <h2 id="char-modal-title" className="character-modal-title">
            Elige tu Personaje
          </h2>
          <p className="character-modal-subtitle">
            Selecciona a uno de los 4 miembros del equipo para explorar la oficina isométrica y gestionar tu espacio.
          </p>
        </header>

        <div className="characters-grid" role="radiogroup" aria-label="Selección de personaje">
          {CHARACTERS_CATALOG.map((character: CharacterProfile) => {
            const isSelected = character.id === activeId;
            return (
              <div
                key={character.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`character-card ${isSelected ? 'selected' : ''}`}
                style={{ '--char-theme': character.themeColor } as React.CSSProperties}
                onClick={() => setActiveId(character.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    setActiveId(character.id);
                  }
                }}
              >
                <div className="character-card-glow" />

                <div className="character-sprite-stage">
                  <img
                    src={character.fullUrl}
                    alt={character.name}
                    className="character-pixel-sprite"
                    loading="eager"
                  />
                  <div className="character-pedestal" />
                </div>

                <div className="character-card-body">
                  <div className="character-role-tag">{character.role}</div>
                  <h3 className="character-card-name">{character.name}</h3>
                  <div className="character-department">{character.department}</div>
                  <p className="character-bio">{character.description}</p>

                  <div className="character-traits">
                    {character.traits.map((trait) => (
                      <span key={trait} className="character-trait-pill">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="character-select-indicator">
                  {isSelected ? '✓ Seleccionado' : 'Elegir'}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="character-modal-footer">
          <div className="character-controls-hint">
            <span className="hint-icon">🎮</span>
            <span>
              <strong>Controles en la oficina:</strong> Teclas <code>W</code> <code>A</code> <code>S</code> <code>D</code> o <code>Flechas</code> para caminar | <strong>Clic</strong> en el piso para desplazarte.
            </span>
          </div>

          <button
            type="button"
            className="character-confirm-btn"
            style={{ '--char-theme': currentProfile.themeColor } as React.CSSProperties}
            onClick={handleConfirm}
          >
            <span>Ingresar con {currentProfile.name}</span>
            <span className="btn-arrow">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
