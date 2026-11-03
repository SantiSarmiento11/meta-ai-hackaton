import * as Phaser from 'phaser';
import {
  OFFICE_OBJECTS_CATALOG,
  type OfficeObjectDefinition,
  getOfficeObjectById,
  getOccupiedGridCells,
} from '../models/OfficeObjectModel';
import { GRID_SIZE } from '../config';
import type { MainScene } from '../scenes/MainScene';

export interface PlacedObjectInstance {
  id: string;
  definition: OfficeObjectDefinition;
  gridCol: number;
  gridRow: number;
  sprite: Phaser.GameObjects.Image;
  footprintGraphics?: Phaser.GameObjects.Graphics;
}

export interface GhostState {
  objectId: string;
  definition: OfficeObjectDefinition;
  gridCol: number;
  gridRow: number;
  isValid: boolean;
  sprite: Phaser.GameObjects.Image;
  footprintGraphics: Phaser.GameObjects.Graphics;
  movingInstanceId?: string; // If we are moving an existing object
}

export class OfficeObjectManager {
  private scene: MainScene;
  private placedObjects: Map<string, PlacedObjectInstance> = new Map();
  private occupiedGridMap: Map<string, string> = new Map(); // key "col,row" -> objectInstanceId
  private furnitureStaticGroup: Phaser.Physics.Arcade.StaticGroup;

  // Placement mode state
  private activeGhost: GhostState | null = null;
  private selectedInstanceId: string | null = null;
  private selectionGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.furnitureStaticGroup = this.scene.physics.add.staticGroup();

    this.selectionGraphics = this.scene.add.graphics();
    this.selectionGraphics.setDepth(9998);
  }

  /**
   * Initializes individual named frames in Phaser's Texture Manager for all catalogued objects
   * across both spritesheets ('tech_office_atlas' and 'modern_office_atlas').
   */
  public initializeFrames(): void {
    for (const def of OFFICE_OBJECTS_CATALOG) {
      if (!this.scene.textures.exists(def.atlasKey)) {
        console.warn(`[OfficeObjectManager] Texture '${def.atlasKey}' not found in Phaser TextureManager.`);
        continue;
      }

      const texture = this.scene.textures.get(def.atlasKey);
      if (!texture.has(def.id)) {
        texture.add(
          def.id,
          0,
          def.frame.x,
          def.frame.y,
          def.frame.width,
          def.frame.height
        );
      }
    }
  }

  /**
   * Returns the Phaser static physics group containing all furniture obstacles.
   */
  public getPhysicsGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.furnitureStaticGroup;
  }

  /**
   * Checks whether the given grid cells are available and within the 20x20 floor bounds.
   */
  public canPlace(
    objectId: string,
    col: number,
    row: number,
    ignoreInstanceId?: string
  ): boolean {
    const def = getOfficeObjectById(objectId);
    if (!def) return false;

    // Check bounds within 20x20 grid
    if (
      col < 0 ||
      row < 0 ||
      col + def.footprint.width > GRID_SIZE ||
      row + def.footprint.height > GRID_SIZE
    ) {
      return false;
    }

    // Check collision with already placed objects
    const requiredCells = getOccupiedGridCells(
      col,
      row,
      def.footprint.width,
      def.footprint.height
    );
    for (const cell of requiredCells) {
      const key = `${cell.col},${cell.row}`;
      const occupantId = this.occupiedGridMap.get(key);
      if (occupantId && occupantId !== ignoreInstanceId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Spawns an office object onto the isometric floor grid at (col, row).
   * Computes accurate world positioning, isometric base anchor, and Arcade Physics StaticBody.
   */
  public placeObject(
    objectId: string,
    col: number,
    row: number,
    instanceId?: string
  ): PlacedObjectInstance | null {
    const def = getOfficeObjectById(objectId);
    if (!def) {
      console.warn(`[OfficeObjectManager] Object definition '${objectId}' not found.`);
      return null;
    }

    if (!this.canPlace(objectId, col, row, instanceId)) {
      return null;
    }

    const id = instanceId ?? `${objectId}_${col}_${row}_${Date.now()}`;

    // Compute center and base world coordinates of the isometric footprint
    const centerPoint = this.scene.gridToWorld(
      col + def.footprint.width / 2,
      row + def.footprint.height / 2
    );
    const basePoint = this.scene.gridToWorld(
      col + def.footprint.width,
      row + def.footprint.height
    );

    // Create the Phaser Image GameObject using the registered sub-frame from the proper atlas
    const sprite = this.scene.add.image(centerPoint.x, basePoint.y, def.atlasKey, def.id);
    sprite.setOrigin(def.origin.x, def.origin.y);
    sprite.setDepth(basePoint.y);

    // Add Arcade Physics StaticBody
    this.furnitureStaticGroup.add(sprite);
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    if (body && def.physics) {
      body.setSize(def.physics.bodyWidth, def.physics.bodyHeight);
      body.setOffset(def.physics.offsetX, def.physics.offsetY);
      body.updateFromGameObject();
    }

    // Make sprite interactive for selection & manipulation
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && !this.activeGhost) {
        this.selectObject(id);
      }
    });

    // Register occupied cells
    const cells = getOccupiedGridCells(col, row, def.footprint.width, def.footprint.height);
    for (const cell of cells) {
      this.occupiedGridMap.set(`${cell.col},${cell.row}`, id);
    }

    const instance: PlacedObjectInstance = {
      id,
      definition: def,
      gridCol: col,
      gridRow: row,
      sprite,
    };

    this.placedObjects.set(id, instance);

    // Game feel animation: slight scale bounce on spawn
    sprite.setScale(0.85, 0.85);
    this.scene.tweens.add({
      targets: sprite,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 220,
      ease: 'Back.easeOut',
    });

    this.scene.game.events.emit('object-placed', {
      instanceId: id,
      objectId: def.id,
      name: def.name,
      col,
      row,
      footprint: def.footprint,
    });

    return instance;
  }

  /**
   * Activates placement mode with a ghost preview tracking the cursor.
   */
  public startPlacement(objectId: string, movingInstanceId?: string): boolean {
    const def = getOfficeObjectById(objectId);
    if (!def) return false;

    // Clean up any existing ghost
    this.cancelPlacement();
    this.selectObject(null);

    // Ensure grid is visible to guide placement
    this.scene.setGridVisible(true);

    const footprintGraphics = this.scene.add.graphics();
    footprintGraphics.setDepth(9997);

    // Initial dummy position
    const centerPoint = this.scene.gridToWorld(def.footprint.width / 2, def.footprint.height / 2);
    const basePoint = this.scene.gridToWorld(def.footprint.width, def.footprint.height);

    const sprite = this.scene.add.image(centerPoint.x, basePoint.y, def.atlasKey, def.id);
    sprite.setOrigin(def.origin.x, def.origin.y);
    sprite.setAlpha(0.72);
    sprite.setDepth(9998);

    this.activeGhost = {
      objectId,
      definition: def,
      gridCol: 0,
      gridRow: 0,
      isValid: false,
      sprite,
      footprintGraphics,
      movingInstanceId,
    };

    // If moving an existing instance, temporarily hide its original sprite
    if (movingInstanceId) {
      const orig = this.placedObjects.get(movingInstanceId);
      if (orig) {
        orig.sprite.setVisible(false);
      }
    }

    this.scene.game.events.emit('placement-mode-started', {
      objectId: def.id,
      name: def.name,
      footprint: def.footprint,
      isMoving: !!movingInstanceId,
    });

    return true;
  }

  /**
   * Updates the position and visual feedback of the active placement ghost.
   */
  public updatePlacementGhost(col: number, row: number): void {
    if (!this.activeGhost) return;

    const { definition, sprite, footprintGraphics, movingInstanceId } = this.activeGhost;
    this.activeGhost.gridCol = col;
    this.activeGhost.gridRow = row;

    const isValid = this.canPlace(definition.id, col, row, movingInstanceId);
    this.activeGhost.isValid = isValid;

    const centerPoint = this.scene.gridToWorld(
      col + definition.footprint.width / 2,
      row + definition.footprint.height / 2
    );
    const basePoint = this.scene.gridToWorld(
      col + definition.footprint.width,
      row + definition.footprint.height
    );

    sprite.setPosition(centerPoint.x, basePoint.y);
    sprite.setDepth(basePoint.y + 10); // slightly above placed objects for clear preview

    if (isValid) {
      sprite.clearTint();
      sprite.setAlpha(0.85);
    } else {
      sprite.setTint(0xff5555);
      sprite.setAlpha(0.5);
    }

    // Draw isometric footprint diamond
    footprintGraphics.clear();
    const w = definition.footprint.width;
    const h = definition.footprint.height;

    const pTop = this.scene.gridToWorld(col, row);
    const pRight = this.scene.gridToWorld(col + w, row);
    const pBottom = this.scene.gridToWorld(col + w, row + h);
    const pLeft = this.scene.gridToWorld(col, row + h);

    if (isValid) {
      // Emerald green
      footprintGraphics.fillStyle(0x22c55e, 0.35);
      footprintGraphics.lineStyle(2, 0x16a34a, 0.95);
    } else {
      // Crimson red
      footprintGraphics.fillStyle(0xef4444, 0.45);
      footprintGraphics.lineStyle(2, 0xdc2626, 0.95);
    }

    footprintGraphics.beginPath();
    footprintGraphics.moveTo(pTop.x, pTop.y);
    footprintGraphics.lineTo(pRight.x, pRight.y);
    footprintGraphics.lineTo(pBottom.x, pBottom.y);
    footprintGraphics.lineTo(pLeft.x, pLeft.y);
    footprintGraphics.closePath();
    footprintGraphics.fillPath();
    footprintGraphics.strokePath();

    this.scene.game.events.emit('placement-mode-updated', {
      col,
      row,
      isValid,
    });
  }

  /**
   * Confirms placement at the current ghost coordinates.
   */
  public confirmPlacement(): PlacedObjectInstance | null {
    if (!this.activeGhost) return null;
    if (!this.activeGhost.isValid) return null;

    const { objectId, gridCol, gridRow, movingInstanceId } = this.activeGhost;

    // If we were moving an instance, remove the old one first
    if (movingInstanceId) {
      this.removeObject(movingInstanceId, false);
    }

    this.cancelPlacement(false);

    const placed = this.placeObject(objectId, gridCol, gridRow);
    if (placed) {
      this.selectObject(placed.id);
    }

    this.scene.game.events.emit('placement-mode-ended', { success: true });
    return placed;
  }

  /**
   * Cancels placement mode and restores previous state if moving an object.
   */
  public cancelPlacement(notifyEvent: boolean = true): void {
    if (!this.activeGhost) return;

    if (this.activeGhost.movingInstanceId) {
      const orig = this.placedObjects.get(this.activeGhost.movingInstanceId);
      if (orig) {
        orig.sprite.setVisible(true);
      }
    }

    this.activeGhost.sprite.destroy();
    this.activeGhost.footprintGraphics.destroy();
    this.activeGhost = null;

    if (notifyEvent) {
      this.scene.game.events.emit('placement-mode-ended', { success: false });
    }
  }

  public isPlacing(): boolean {
    return this.activeGhost !== null;
  }

  public getPlacingObjectId(): string | null {
    return this.activeGhost?.objectId ?? null;
  }

  /**
   * Selects an object and highlights it on screen.
   */
  public selectObject(instanceId: string | null): void {
    this.selectedInstanceId = instanceId;
    this.selectionGraphics.clear();

    if (!instanceId) {
      this.scene.game.events.emit('object-selected', null);
      return;
    }

    const instance = this.placedObjects.get(instanceId);
    if (!instance) {
      this.selectedInstanceId = null;
      this.scene.game.events.emit('object-selected', null);
      return;
    }

    const { gridCol, gridRow, definition } = instance;
    const w = definition.footprint.width;
    const h = definition.footprint.height;

    const pTop = this.scene.gridToWorld(gridCol, gridRow);
    const pRight = this.scene.gridToWorld(gridCol + w, gridRow);
    const pBottom = this.scene.gridToWorld(gridCol + w, gridRow + h);
    const pLeft = this.scene.gridToWorld(gridCol, gridRow + h);

    // Highlight diamond in vibrant cyan
    this.selectionGraphics.lineStyle(2.5, 0x38bdf8, 0.95);
    this.selectionGraphics.fillStyle(0x38bdf8, 0.2);
    this.selectionGraphics.beginPath();
    this.selectionGraphics.moveTo(pTop.x, pTop.y);
    this.selectionGraphics.lineTo(pRight.x, pRight.y);
    this.selectionGraphics.lineTo(pBottom.x, pBottom.y);
    this.selectionGraphics.lineTo(pLeft.x, pLeft.y);
    this.selectionGraphics.closePath();
    this.selectionGraphics.fillPath();
    this.selectionGraphics.strokePath();

    this.scene.game.events.emit('object-selected', {
      instanceId,
      objectId: definition.id,
      name: definition.name,
      category: definition.category,
      col: gridCol,
      row: gridRow,
      footprint: definition.footprint,
    });
  }

  public getSelectedInstanceId(): string | null {
    return this.selectedInstanceId;
  }

  /**
   * Initiates moving the currently selected object.
   */
  public startMovingSelected(): boolean {
    if (!this.selectedInstanceId) return false;
    const instance = this.placedObjects.get(this.selectedInstanceId);
    if (!instance) return false;

    return this.startPlacement(instance.definition.id, instance.id);
  }

  /**
   * Removes an existing object from the office.
   */
  public removeObject(instanceId: string, emitEvent: boolean = true): boolean {
    const instance = this.placedObjects.get(instanceId);
    if (!instance) return false;

    // Free occupied cells
    const cells = getOccupiedGridCells(
      instance.gridCol,
      instance.gridRow,
      instance.definition.footprint.width,
      instance.definition.footprint.height
    );
    for (const cell of cells) {
      this.occupiedGridMap.delete(`${cell.col},${cell.row}`);
    }

    if (this.selectedInstanceId === instanceId) {
      this.selectObject(null);
    }

    this.furnitureStaticGroup.remove(instance.sprite, true, true);
    instance.sprite.destroy();
    instance.footprintGraphics?.destroy();

    this.placedObjects.delete(instanceId);

    if (emitEvent) {
      this.scene.game.events.emit('object-removed', { instanceId });
    }

    return true;
  }

  /**
   * Removes the currently selected object.
   */
  public removeSelectedObject(): boolean {
    if (!this.selectedInstanceId) return false;
    return this.removeObject(this.selectedInstanceId);
  }

  /**
   * Clears all placed objects.
   */
  public clearAll(): void {
    this.cancelPlacement();
    this.selectObject(null);

    for (const instance of this.placedObjects.values()) {
      this.furnitureStaticGroup.remove(instance.sprite, true, true);
      instance.sprite.destroy();
      instance.footprintGraphics?.destroy();
    }
    this.placedObjects.clear();
    this.occupiedGridMap.clear();

    this.scene.game.events.emit('all-objects-cleared');
  }

  public getPlacedObjects(): PlacedObjectInstance[] {
    return Array.from(this.placedObjects.values());
  }

  /**
   * Renders a debug highlight on the floor for all placed object footprints.
   */
  public drawFootprints(graphics: Phaser.GameObjects.Graphics): void {
    graphics.lineStyle(1.5, 0xfacc15, 0.7);

    for (const instance of this.placedObjects.values()) {
      const { gridCol, gridRow, definition } = instance;
      const w = definition.footprint.width;
      const h = definition.footprint.height;

      const pTop = this.scene.gridToWorld(gridCol, gridRow);
      const pRight = this.scene.gridToWorld(gridCol + w, gridRow);
      const pBottom = this.scene.gridToWorld(gridCol + w, gridRow + h);
      const pLeft = this.scene.gridToWorld(gridCol, gridRow + h);

      graphics.beginPath();
      graphics.moveTo(pTop.x, pTop.y);
      graphics.lineTo(pRight.x, pRight.y);
      graphics.lineTo(pBottom.x, pBottom.y);
      graphics.lineTo(pLeft.x, pLeft.y);
      graphics.closePath();
      graphics.strokePath();
    }
  }
}
