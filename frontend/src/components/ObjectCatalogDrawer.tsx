import { useState, useMemo } from 'react';
import {
  OFFICE_OBJECTS_CATALOG,
  type ObjectCategory,
  type AtlasKey,
  type OfficeObjectDefinition,
} from '../game/models/OfficeObjectModel';

interface ObjectCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlacement: (objectId: string) => void;
  activePlacingObjectId: string | null;
  onClearAll: () => void;
  isPhysicsDebug: boolean;
  onTogglePhysicsDebug: () => void;
}

type CategoryFilter = 'all' | ObjectCategory;
type AtlasFilter = 'all' | AtlasKey;

interface AtlasTab {
  id: AtlasFilter;
  label: string;
  badge: number;
}

const ATLAS_TABS: AtlasTab[] = [
  { id: 'all', label: 'Todos', badge: 160 },
  { id: 'tech_office_atlas', label: 'Oficina Tecnológica', badge: 78 },
  { id: 'modern_office_atlas', label: 'Oficina Moderna', badge: 82 },
];

interface CategoryTab {
  id: CategoryFilter;
  label: string;
  icon: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'all', label: 'Todos', icon: '✦' },
  { id: 'desk', label: 'Escritorios', icon: '🖥' },
  { id: 'chair', label: 'Sillas', icon: '💺' },
  { id: 'seating', label: 'Sofás / Lounge', icon: '🛋' },
  { id: 'storage', label: 'Archivadores & Racks', icon: '🗄' },
  { id: 'electronics', label: 'Tecnología', icon: '⚡' },
  { id: 'decoration', label: 'Plantas & Dec.', icon: '🪴' },
  { id: 'accessory', label: 'Accesorios', icon: '📦' },
];

export const ObjectCatalogDrawer = ({
  isOpen,
  onClose,
  onStartPlacement,
  activePlacingObjectId,
  onClearAll,
  isPhysicsDebug,
  onTogglePhysicsDebug,
}: ObjectCatalogDrawerProps) => {
  const [selectedAtlas, setSelectedAtlas] = useState<AtlasFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredObjects = useMemo(() => {
    return OFFICE_OBJECTS_CATALOG.filter((obj) => {
      const matchesAtlas =
        selectedAtlas === 'all' || obj.atlasKey === selectedAtlas;
      const matchesCategory =
        selectedCategory === 'all' || obj.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAtlas && matchesCategory && matchesSearch;
    });
  }, [selectedAtlas, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside className="catalog-drawer-overlay" aria-label="Catálogo de Mobiliario y Equipamiento">
      <div className="catalog-drawer-panel">
        {/* Header */}
        <header className="catalog-header">
          <div className="catalog-title-group">
            <h2 className="catalog-title">Catálogo de Mobiliario Sleeply</h2>
            <span className="catalog-subtitle">
              {filteredObjects.length} de {OFFICE_OBJECTS_CATALOG.length} objetos disponibles
            </span>
          </div>

          <div className="catalog-header-actions">
            <button
              type="button"
              className={`catalog-tool-btn ${isPhysicsDebug ? 'active' : ''}`}
              onClick={onTogglePhysicsDebug}
              title="Mostrar u ocultar cajas de colisión Arcade Physics"
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-label">{isPhysicsDebug ? 'Físicas: ON' : 'Físicas: OFF'}</span>
            </button>

            <button
              type="button"
              className="catalog-tool-btn danger"
              onClick={() => {
                if (window.confirm('¿Deseas eliminar todos los objetos colocados en la oficina?')) {
                  onClearAll();
                }
              }}
              title="Limpiar todos los objetos del piso"
            >
              <span className="btn-icon">🗑</span>
              <span className="btn-label">Limpiar Todo</span>
            </button>

            <button
              type="button"
              className="catalog-close-btn"
              onClick={onClose}
              aria-label="Cerrar catálogo"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Filter controls */}
        <div className="catalog-controls">
          {/* Atlas Collection Filter */}
          <div className="catalog-atlas-tabs" role="tablist" aria-label="Filtro por colección de spritesheet">
            {ATLAS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selectedAtlas === tab.id}
                className={`atlas-tab-btn ${selectedAtlas === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedAtlas(tab.id)}
              >
                <span>{tab.label}</span>
                <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>({tab.badge})</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="search-bar-container">
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Buscar por nombre (ej. estación, escritorio, rack, silla)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category tabs */}
          <nav className="catalog-category-tabs" aria-label="Filtro por categoría">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`category-tab-btn ${selectedCategory === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Objects Grid */}
        <div className="catalog-items-grid">
          {filteredObjects.length === 0 ? (
            <div className="catalog-empty-state">
              <p>No se encontraron objetos que coincidan con la búsqueda y filtros seleccionados.</p>
            </div>
          ) : (
            filteredObjects.map((item: OfficeObjectDefinition) => {
              const isSelected = activePlacingObjectId === item.id;
              return (
                <div
                  key={item.id}
                  className={`catalog-item-card ${isSelected ? 'placing' : ''}`}
                  onClick={() => onStartPlacement(item.id)}
                  title={`Clic para colocar: ${item.name} (${item.footprint.width}x${item.footprint.height})`}
                >
                  <div className="card-thumb-container">
                    <img
                      src={`/thumbs/${item.id}.png`}
                      alt={item.name}
                      className="card-thumb-image"
                      loading="lazy"
                    />
                    <span className="card-footprint-badge">
                      {item.footprint.width}x{item.footprint.height}
                    </span>
                  </div>

                  <div className="card-info">
                    <h3 className="card-name">{item.name}</h3>
                    <p className="card-desc">{item.description}</p>
                  </div>

                  <button
                    type="button"
                    className={`card-place-btn ${isSelected ? 'active' : ''}`}
                  >
                    {isSelected ? 'Colocando...' : 'Ubicar'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
