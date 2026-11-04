import { useState, useMemo } from 'react';
import {
  OFFICE_OBJECTS_CATALOG,
  type ObjectCategory,
  type AtlasKey,
  type OfficeObjectDefinition,
} from '../game/models/OfficeObjectModel';
import {
  GridAllIcon,
  MonitorIcon,
  ChairIcon,
  SofaIcon,
  ArchiveIcon,
  ZapIcon,
  PlantIcon,
  BoxIcon,
  TrashIcon,
  CloseIcon,
} from './Icons';

interface ObjectCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlacement: (objectId: string) => void;
  activePlacingObjectId: string | null;
  onClearAll: () => void;
}

type CategoryFilter = 'all' | ObjectCategory;
type AtlasFilter = 'all' | AtlasKey;

interface AtlasTab {
  id: AtlasFilter;
  label: string;
  badge: number;
}

const ATLAS_TABS: AtlasTab[] = [
  { id: 'all', label: 'All', badge: 160 },
  { id: 'tech_office_atlas', label: 'Tech Office', badge: 78 },
  { id: 'modern_office_atlas', label: 'Modern Office', badge: 82 },
];

interface CategoryTab {
  id: CategoryFilter;
  label: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'all', label: 'All' },
  { id: 'desk', label: 'Desks' },
  { id: 'chair', label: 'Chairs' },
  { id: 'seating', label: 'Sofas / Lounge' },
  { id: 'storage', label: 'Storage & Racks' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'decoration', label: 'Plants & Decor' },
  { id: 'accessory', label: 'Accessories' },
];

const renderCategoryIcon = (category: CategoryFilter) => {
  switch (category) {
    case 'desk':
      return <MonitorIcon size={16} />;
    case 'chair':
      return <ChairIcon size={16} />;
    case 'seating':
      return <SofaIcon size={16} />;
    case 'storage':
      return <ArchiveIcon size={16} />;
    case 'electronics':
      return <ZapIcon size={16} />;
    case 'decoration':
      return <PlantIcon size={16} />;
    case 'accessory':
      return <BoxIcon size={16} />;
    case 'all':
    default:
      return <GridAllIcon size={16} />;
  }
};

export const ObjectCatalogDrawer = ({
  isOpen,
  onClose,
  onStartPlacement,
  activePlacingObjectId,
  onClearAll,
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
    <aside
      className="catalog-drawer-overlay"
      aria-label="Furniture & Equipment Catalog"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="catalog-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="catalog-header">
          <div className="catalog-title-group">
            <h2 className="catalog-title">Sleeply Furniture Catalog</h2>
            <span className="catalog-subtitle">
              {filteredObjects.length} of {OFFICE_OBJECTS_CATALOG.length} objects available
            </span>
          </div>

          <div className="catalog-header-actions">
            <button
              type="button"
              className="catalog-tool-btn danger"
              onClick={() => {
                if (window.confirm('Do you want to clear all placed objects in the office?')) {
                  onClearAll();
                }
              }}
              title="Clear all floor objects"
            >
              <TrashIcon size={14} />
              <span className="btn-label">Clear All</span>
            </button>

            <button
              type="button"
              className="catalog-close-btn"
              onClick={onClose}
              aria-label="Close catalog"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </header>

        {/* Filter controls */}
        <div className="catalog-controls">
          {/* Atlas Collection Filter */}
          <div className="catalog-atlas-tabs" role="tablist" aria-label="Filter by spritesheet collection">
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
              placeholder="Search by name (e.g. workstation, desk, rack, chair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <nav className="catalog-category-tabs" aria-label="Filter by category">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`category-tab-btn ${selectedCategory === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                <span className="tab-icon">{renderCategoryIcon(tab.id)}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Objects Grid */}
        <div className="catalog-items-grid">
          {filteredObjects.length === 0 ? (
            <div className="catalog-empty-state">
              <p>No objects found matching the selected search query and filters.</p>
            </div>
          ) : (
            filteredObjects.map((item: OfficeObjectDefinition) => {
              const isSelected = activePlacingObjectId === item.id;
              return (
                <div
                  key={item.id}
                  className={`catalog-item-card ${isSelected ? 'placing' : ''}`}
                  onClick={() => onStartPlacement(item.id)}
                  title={`Click to place: ${item.name} (${item.footprint.width}x${item.footprint.height})`}
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
                    {isSelected ? 'Placing...' : 'Place'}
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
