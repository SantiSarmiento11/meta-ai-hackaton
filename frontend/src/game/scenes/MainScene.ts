import * as Phaser from 'phaser';
import dayRoomUrl from '../../assets/Rooms/Rooms FInal Version/Oficina isométrica  dia con logo Sleeply.png';
import nightRoomUrl from '../../assets/Rooms/Rooms FInal Version/Oficina nocturna con neón Sleeply.png';
import techOfficeAtlasUrl from '../../assets/Spritesheets/Atlas isométrico de oficina tecnológica.png';
import modernOfficeAtlasUrl from '../../assets/Spritesheets/Hoja de sprites de oficina moderna.png';
import charactersSpritesheetUrl from '../../assets/Spritesheets/Hoja de sprites pixel art transparente.png';
import { OfficeObjectManager } from '../objects/OfficeObjectManager';
import { OFFICE_OBJECTS_CATALOG, type OfficeObjectDefinition } from '../models/OfficeObjectModel';
import {
  CHARACTERS_ATLAS_DATA,
  registerCharacterAnimations,
  type CharacterId,
} from '../models/CharacterModel';
import { Player } from '../objects/Player';
import { OfficeAgentManager } from '../objects/OfficeAgentManager';
import type { AgentLiveState } from '../../services/api';

export type OperatingMode = 'day' | 'night';

export interface GridCoordinates {
  col: number;
  row: number;
}

export interface WorldPoint {
  x: number;
  y: number;
}

export class MainScene extends Phaser.Scene {
  public static readonly KEY = 'MainScene';
  public static readonly GRID_SIZE = 20;

  // Zoom bounds
  public static readonly MIN_ZOOM = 0.75;
  public static readonly MAX_ZOOM = 1.45;
  public static readonly DEFAULT_ZOOM = 1.0;

  // Floor isometric anchor coordinates calibrated to the new room diorama
  private readonly topVertex: WorldPoint = { x: 848, y: 297 };
  private readonly stepU: WorldPoint = { x: 34.40, y: 15.15 };
  private readonly stepV: WorldPoint = { x: -34.40, y: 15.15 };

  private dayOfficeImage?: Phaser.GameObjects.Image;
  private nightOfficeImage?: Phaser.GameObjects.Image;
  private gridGraphics?: Phaser.GameObjects.Graphics;

  private objectManager?: OfficeObjectManager;
  private agentManager?: OfficeAgentManager;
  private player?: Player;
  private currentMode: OperatingMode = 'day';
  private isTransitioning: boolean = false;
  private targetZoom: number = MainScene.DEFAULT_ZOOM;
  private isPhysicsDebugActive: boolean = false;

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload(): void {
    this.load.image('day_office', dayRoomUrl);
    this.load.image('night_office', nightRoomUrl);
    // Load both unified high-resolution isometric atlases (1536x1024, 160 items total)
    this.load.image('tech_office_atlas', techOfficeAtlasUrl);
    this.load.image('modern_office_atlas', modernOfficeAtlasUrl);
    // Load pixel-art character atlas with mapped animations
    this.load.atlas('characters_atlas', charactersSpritesheetUrl, CHARACTERS_ATLAS_DATA);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Set background color to pure black matching room artwork
    this.cameras.main.setBackgroundColor('#000000');

    // Render daytime office background as base
    this.dayOfficeImage = this.add.image(centerX, centerY, 'day_office');
    this.dayOfficeImage.setOrigin(0.5);
    this.dayOfficeImage.setDepth(0);

    // Render nighttime office background directly above, starting fully transparent
    this.nightOfficeImage = this.add.image(centerX, centerY, 'night_office');
    this.nightOfficeImage.setOrigin(0.5);
    this.nightOfficeImage.setAlpha(0);
    this.nightOfficeImage.setDepth(1);

    // Initialize the Office Object Manager with multi-atlas support and register all 160 frames
    this.objectManager = new OfficeObjectManager(this);
    this.objectManager.initializeFrames();

    // Register character animations across all 4 characters
    registerCharacterAnimations(this);

    // Initialize Office Agent NPC Manager for virtual office automation representation
    this.agentManager = new OfficeAgentManager(this);

    // Spawns the default CEO avatar immediately on scene creation
    this.spawnPlayer('char_0');

    // Build the 20x20 isometric floor grid (invisible by default, shows in placement mode)
    this.createIsometricGrid();

    // Setup interactive placement and cursor tracking
    this.setupPlacementControls();

    // Setup interactive camera zoom (camera position stays fixed)
    this.setupCameraControls();

    // Setup global game event bridge for external UI controls (React)
    this.setupEventBridge();

    // Notify listeners that the scene is fully initialized
    this.game.events.emit('scene-ready', this);
    this.game.events.emit('zoom-changed', this.targetZoom);
  }

  /**
   * Configures mouse pointer tracking for placement mode, object selection and click-to-move.
   */
  private setupPlacementControls(): void {
    const tryMovePlayer = (pointer: Phaser.Input.Pointer, isInitialClick: boolean = false) => {
      if (!this.player || this.objectManager?.isPlacing()) return;

      // Check if interactive objects (NPC agent sprite or furniture) were clicked
      const hits = this.input.hitTestPointer(pointer);
      const isOverInteractive = hits && hits.some(obj => obj !== this.player && obj.input && obj.input.enabled);
      if (isOverInteractive) return;

      const grid = this.worldToGrid(pointer.worldX, pointer.worldY);
      if (grid.col >= -2 && grid.col <= 22 && grid.row >= -2 && grid.row <= 22) {
        const clampedCol = Phaser.Math.Clamp(grid.col, 0.6, 19.4);
        const clampedRow = Phaser.Math.Clamp(grid.row, 0.6, 19.4);
        const targetWorld = this.gridToWorld(clampedCol, clampedRow);
        this.player.moveTo(targetWorld.x, targetWorld.y, isInitialClick);
      }
    };

    // Track pointer movement across isometric grid (and continuous click-to-move when holding left button)
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.objectManager?.isPlacing()) {
        const grid = this.worldToGrid(pointer.worldX, pointer.worldY);
        const col = Math.floor(grid.col);
        const row = Math.floor(grid.row);
        this.objectManager.updatePlacementGhost(col, row);
      } else if (pointer.isDown && pointer.button === 0) {
        tryMovePlayer(pointer, false);
      }
    });

    // Handle clicks for confirming placement, deselecting, or initiating movement
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        // Right click cancels placement or deselects
        if (this.objectManager?.isPlacing()) {
          this.objectManager.cancelPlacement();
        } else {
          this.objectManager?.selectObject(null);
        }
        return;
      }

      if (pointer.leftButtonDown()) {
        if (this.objectManager?.isPlacing()) {
          this.objectManager.confirmPlacement();
        } else {
          tryMovePlayer(pointer, true);
        }
      }
    });

    // Ensure final target update on releasing mouse
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0 && !this.objectManager?.isPlacing()) {
        tryMovePlayer(pointer, false);
      }
    });

    // Keyboard controls (Esc to cancel, Delete to remove)
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.objectManager?.isPlacing()) {
        this.objectManager.cancelPlacement();
      } else {
        this.objectManager?.selectObject(null);
      }
    });

    this.input.keyboard?.on('keydown-DELETE', () => {
      this.objectManager?.removeSelectedObject();
    });

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      this.objectManager?.removeSelectedObject();
    });
  }

  /**
   * Generates the 20x20 isometric grid mapping over the office floor.
   * Rendered in a dedicated graphics layer.
   */
  private createIsometricGrid(): void {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(9999);
    this.gridGraphics.setVisible(false);

    this.drawGridLines();
  }

  /**
   * Draws the isometric grid lines over the floor and highlights placed object footprints.
   */
  private drawGridLines(): void {
    if (!this.gridGraphics) return;

    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x00ffff, 0.4);

    const size = MainScene.GRID_SIZE;

    // Draw U-aligned lines (constant row, varying col)
    for (let r = 0; r <= size; r++) {
      const start = this.gridToWorld(0, r);
      const end = this.gridToWorld(size, r);
      this.gridGraphics.beginPath();
      this.gridGraphics.moveTo(start.x, start.y);
      this.gridGraphics.lineTo(end.x, end.y);
      this.gridGraphics.strokePath();
    }

    // Draw V-aligned lines (constant col, varying row)
    for (let c = 0; c <= size; c++) {
      const start = this.gridToWorld(c, 0);
      const end = this.gridToWorld(c, size);
      this.gridGraphics.beginPath();
      this.gridGraphics.moveTo(start.x, start.y);
      this.gridGraphics.lineTo(end.x, end.y);
      this.gridGraphics.strokePath();
    }

    // Draw footprint bounds for all placed objects in yellow
    if (this.objectManager) {
      this.objectManager.drawFootprints(this.gridGraphics);
    }
  }

  /**
   * Maps grid coordinates (col, row) to world coordinates (x, y) on the isometric floor.
   */
  public gridToWorld(col: number, row: number): WorldPoint {
    const x = this.topVertex.x + col * this.stepU.x + row * this.stepV.x;
    const y = this.topVertex.y + col * this.stepU.y + row * this.stepV.y;
    return { x, y };
  }

  /**
   * Returns the center point of a given grid tile (col, row).
   */
  public getCellCenter(col: number, row: number): WorldPoint {
    return this.gridToWorld(col + 0.5, row + 0.5);
  }

  /**
   * Converts world coordinates (x, y) to continuous grid coordinates (col, row).
   */
  public worldToGrid(x: number, y: number): GridCoordinates {
    const dx = x - this.topVertex.x;
    const dy = y - this.topVertex.y;
    const avgStepY = (this.stepU.y + this.stepV.y) / 2;

    const col = 0.5 * (dx / this.stepU.x + dy / avgStepY);
    const row = 0.5 * (dy / avgStepY - dx / this.stepU.x);

    return { col, row };
  }

  /**
   * Toggles the visibility of the isometric floor grid for debug or inspection.
   */
  public toggleGridVisibility(): boolean {
    if (!this.gridGraphics) return false;
    const nextState = !this.gridGraphics.visible;
    this.gridGraphics.setVisible(nextState);
    if (nextState) {
      this.drawGridLines();
    }
    this.game.events.emit('grid-visibility-changed', nextState);
    return nextState;
  }

  public setGridVisible(visible: boolean): void {
    if (!this.gridGraphics) return;
    this.gridGraphics.setVisible(visible);
    if (visible) {
      this.drawGridLines();
    }
    this.game.events.emit('grid-visibility-changed', visible);
  }

  public isGridVisible(): boolean {
    return this.gridGraphics?.visible ?? false;
  }

  public setInputEnabled(enabled: boolean): void {
    this.input.enabled = enabled;
    if (this.input.keyboard) {
      this.input.keyboard.enabled = enabled;
      if (enabled) {
        this.input.keyboard.resetKeys();
      }
    }
  }

  /**
   * Toggles visual rendering of Arcade Physics colliders.
   */
  public togglePhysicsDebug(): boolean {
    this.isPhysicsDebugActive = !this.isPhysicsDebugActive;
    this.physics.world.drawDebug = this.isPhysicsDebugActive;

    if (!this.physics.world.debugGraphic) {
      this.physics.world.createDebugGraphic();
    }
    this.physics.world.debugGraphic.setVisible(this.isPhysicsDebugActive);

    this.game.events.emit('physics-debug-toggled', this.isPhysicsDebugActive);
    return this.isPhysicsDebugActive;
  }

  public isPhysicsDebug(): boolean {
    return this.isPhysicsDebugActive;
  }

  public getCurrentMode(): OperatingMode {
    return this.currentMode;
  }

  public getZoom(): number {
    return this.targetZoom;
  }

  public getObjectManager(): OfficeObjectManager | undefined {
    return this.objectManager;
  }

  public getCatalog(): OfficeObjectDefinition[] {
    return OFFICE_OBJECTS_CATALOG;
  }

  /**
   * Changes the camera zoom with a smooth easing animation, strictly maintaining camera scroll at (0, 0).
   */
  public setZoom(target: number, duration: number = 300): void {
    const clamped = Phaser.Math.Clamp(target, MainScene.MIN_ZOOM, MainScene.MAX_ZOOM);
    this.targetZoom = Math.round(clamped * 100) / 100;

    this.tweens.killTweensOf(this.cameras.main);
    this.cameras.main.setScroll(0, 0);

    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.targetZoom,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.cameras.main.setScroll(0, 0);
      },
      onComplete: () => {
        this.cameras.main.setScroll(0, 0);
      },
    });

    this.game.events.emit('zoom-changed', this.targetZoom);
  }

  public zoomIn(step: number = 0.15): void {
    this.setZoom(this.targetZoom + step);
  }

  public zoomOut(step: number = 0.15): void {
    this.setZoom(this.targetZoom - step);
  }

  public resetZoom(): void {
    this.setZoom(MainScene.DEFAULT_ZOOM);
  }

  /**
   * Configures wheel zoom. Camera displacement is prohibited; camera scroll is permanently fixed at (0, 0).
   */
  private setupCameraControls(): void {
    this.cameras.main.setScroll(0, 0);

    this.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: unknown[],
        _deltaX: number,
        deltaY: number
      ) => {
        const factor = deltaY > 0 ? -0.1 : 0.1;
        this.setZoom(this.targetZoom + factor, 180);
      }
    );
  }

  /**
   * Executes a smooth cross-fade animation between Day and Night environments.
   */
  public setOperatingMode(targetMode: OperatingMode, duration: number = 750): void {
    if (this.currentMode === targetMode && !this.isTransitioning) return;
    if (!this.dayOfficeImage || !this.nightOfficeImage) return;

    this.isTransitioning = true;
    const isToNight = targetMode === 'night';

    this.tweens.killTweensOf([this.dayOfficeImage, this.nightOfficeImage]);

    this.tweens.add({
      targets: this.nightOfficeImage,
      alpha: isToNight ? 1 : 0,
      duration,
      ease: 'Quad.easeInOut',
    });

    this.tweens.add({
      targets: this.dayOfficeImage,
      alpha: isToNight ? 0 : 1,
      duration,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.currentMode = targetMode;
        this.isTransitioning = false;
        this.game.events.emit('mode-changed', this.currentMode);
      },
    });
  }

  public toggleOperatingMode(duration: number = 750): void {
    const nextMode: OperatingMode = this.currentMode === 'day' ? 'night' : 'day';
    this.setOperatingMode(nextMode, duration);
  }

  /**
   * Registers event handlers to allow React to communicate with the scene.
   */
  private setupEventBridge(): void {
    const onToggleMode = () => this.toggleOperatingMode();
    const onSetMode = (mode: OperatingMode) => this.setOperatingMode(mode);
    const onToggleGrid = () => this.toggleGridVisibility();
    const onZoomIn = () => this.zoomIn();
    const onZoomOut = () => this.zoomOut();
    const onZoomReset = () => this.resetZoom();

    // Placement & management events
    const onStartPlacement = (objectId: string) => this.objectManager?.startPlacement(objectId);
    const onCancelPlacement = () => this.objectManager?.cancelPlacement();
    const onConfirmPlacement = () => this.objectManager?.confirmPlacement();
    const onRemoveSelected = () => this.objectManager?.removeSelectedObject();
    const onMoveSelected = () => this.objectManager?.startMovingSelected();
    const onClearAll = () => this.objectManager?.clearAll();
    const onTogglePhysicsDebug = () => this.togglePhysicsDebug();
    const onSelectCharacter = (characterId: CharacterId) => this.spawnPlayer(characterId);
    const onSetInputEnabled = (enabled: boolean) => this.setInputEnabled(enabled);

    // Office Agent NPC events
    const onSpawnAgents = (states?: AgentLiveState[]) => this.agentManager?.spawnAllAgents(states);
    const onUpdateAgentStates = (states: AgentLiveState[]) => this.agentManager?.updateAgentStates(states);
    const onUpdateSingleAgent = (state: AgentLiveState) => this.agentManager?.updateSingleAgent(state);
    const onHideAgentBubbles = () => this.agentManager?.hideAllAgentBubbles();
    const onAgentSelected = (code: string) => this.agentManager?.showAgentBubble(code);

    this.game.events.on('request-toggle-mode', onToggleMode);
    this.game.events.on('request-set-mode', onSetMode);
    this.game.events.on('request-toggle-grid', onToggleGrid);
    this.game.events.on('request-zoom-in', onZoomIn);
    this.game.events.on('request-zoom-out', onZoomOut);
    this.game.events.on('request-zoom-reset', onZoomReset);

    this.game.events.on('request-start-placement', onStartPlacement);
    this.game.events.on('request-cancel-placement', onCancelPlacement);
    this.game.events.on('request-confirm-placement', onConfirmPlacement);
    this.game.events.on('request-remove-selected', onRemoveSelected);
    this.game.events.on('request-move-selected', onMoveSelected);
    this.game.events.on('request-clear-all', onClearAll);
    this.game.events.on('request-toggle-physics-debug', onTogglePhysicsDebug);
    this.game.events.on('request-select-character', onSelectCharacter);
    this.game.events.on('request-set-input-enabled', onSetInputEnabled);

    this.game.events.on('request-spawn-agents', onSpawnAgents);
    this.game.events.on('request-update-agent-states', onUpdateAgentStates);
    this.game.events.on('request-update-single-agent', onUpdateSingleAgent);
    this.game.events.on('request-hide-agent-bubbles', onHideAgentBubbles);
    this.game.events.on('agent-selected', onAgentSelected);

    // Clean up event listeners when scene is shutdown or destroyed
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('request-toggle-mode', onToggleMode);
      this.game.events.off('request-set-mode', onSetMode);
      this.game.events.off('request-toggle-grid', onToggleGrid);
      this.game.events.off('request-zoom-in', onZoomIn);
      this.game.events.off('request-zoom-out', onZoomOut);
      this.game.events.off('request-zoom-reset', onZoomReset);

      this.game.events.off('request-start-placement', onStartPlacement);
      this.game.events.off('request-cancel-placement', onCancelPlacement);
      this.game.events.off('request-confirm-placement', onConfirmPlacement);
      this.game.events.off('request-remove-selected', onRemoveSelected);
      this.game.events.off('request-move-selected', onMoveSelected);
      this.game.events.off('request-clear-all', onClearAll);
      this.game.events.off('request-toggle-physics-debug', onTogglePhysicsDebug);
      this.game.events.off('request-select-character', onSelectCharacter);
      this.game.events.off('request-set-input-enabled', onSetInputEnabled);

      this.game.events.off('request-spawn-agents', onSpawnAgents);
      this.game.events.off('request-update-agent-states', onUpdateAgentStates);
      this.game.events.off('request-update-single-agent', onUpdateSingleAgent);
      this.game.events.off('request-hide-agent-bubbles', onHideAgentBubbles);
      this.game.events.off('agent-selected', onAgentSelected);
    });
  }

  /**
   * Spawns or updates the player character in the office.
   */
  public spawnPlayer(characterId: CharacterId = 'char_0'): Player {
    if (this.player) {
      this.player.setCharacter(characterId);
      this.game.events.emit('character-selected', characterId);
      return this.player;
    }

    const spawnPoint = this.gridToWorld(10, 10);
    this.player = new Player(this, spawnPoint.x, spawnPoint.y, characterId);

    if (this.objectManager) {
      this.physics.add.collider(this.player, this.objectManager.getPhysicsGroup());
    }

    this.game.events.emit('character-selected', characterId);
    return this.player;
  }

  public getPlayer(): Player | undefined {
    return this.player;
  }

  public getAgentManager(): OfficeAgentManager | undefined {
    return this.agentManager;
  }

  public setCharacter(characterId: CharacterId): void {
    this.spawnPlayer(characterId);
  }

  /**
   * Main Scene update loop.
   */
  override update(time: number, delta: number): void {
    super.update(time, delta);
    this.player?.update(time, delta);
  }
}
