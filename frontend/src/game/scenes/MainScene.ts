import * as Phaser from 'phaser';
import dayOfficeUrl from '../../assets/Rooms/DayOffice.png';
import nightOfficeUrl from '../../assets/Rooms/NightOffice.png';

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

  // Floor isometric anchor coordinates based on DayOffice/NightOffice analysis
  private readonly topVertex: WorldPoint = { x: 843, y: 342 };
  private readonly stepU: WorldPoint = { x: 30.35, y: 14.70 };
  private readonly stepV: WorldPoint = { x: -30.35, y: 14.80 };

  private dayOfficeImage?: Phaser.GameObjects.Image;
  private nightOfficeImage?: Phaser.GameObjects.Image;
  private gridGraphics?: Phaser.GameObjects.Graphics;

  private currentMode: OperatingMode = 'day';
  private isTransitioning: boolean = false;

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload(): void {
    this.load.image('day_office', dayOfficeUrl);
    this.load.image('night_office', nightOfficeUrl);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Render daytime office background as base
    this.dayOfficeImage = this.add.image(centerX, centerY, 'day_office');
    this.dayOfficeImage.setOrigin(0.5);
    this.dayOfficeImage.setDepth(0);

    // Render nighttime office background directly above, starting fully transparent
    this.nightOfficeImage = this.add.image(centerX, centerY, 'night_office');
    this.nightOfficeImage.setOrigin(0.5);
    this.nightOfficeImage.setAlpha(0);
    this.nightOfficeImage.setDepth(1);

    // Build the 20x20 isometric floor grid (invisible by default)
    this.createIsometricGrid();

    // Setup global game event bridge for external UI controls (React)
    this.setupEventBridge();

    // Notify listeners that the scene is fully initialized
    this.game.events.emit('scene-ready', this);
  }

  /**
   * Generates the 20x20 isometric grid mapping over the office floor.
   * Rendered in a dedicated graphics layer, kept invisible by default.
   */
  private createIsometricGrid(): void {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(10);
    this.gridGraphics.setVisible(false); // Invisible grid as required

    this.drawGridLines();
  }

  /**
   * Draws the isometric grid lines over the floor.
   */
  private drawGridLines(): void {
    if (!this.gridGraphics) return;

    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x00ffff, 0.45);

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
    this.game.events.emit('grid-visibility-changed', nextState);
    return nextState;
  }

  /**
   * Sets grid visibility explicitly.
   */
  public setGridVisible(visible: boolean): void {
    if (!this.gridGraphics) return;
    this.gridGraphics.setVisible(visible);
    this.game.events.emit('grid-visibility-changed', visible);
  }

  public isGridVisible(): boolean {
    return this.gridGraphics?.visible ?? false;
  }

  public getCurrentMode(): OperatingMode {
    return this.currentMode;
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
      alpha: isToNight ? 0.05 : 1,
      duration,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.currentMode = targetMode;
        this.isTransitioning = false;
        this.game.events.emit('mode-changed', this.currentMode);
      },
    });
  }

  /**
   * Toggles between Day (Vigilia) and Night (Sueño) modes.
   */
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

    this.game.events.on('request-toggle-mode', onToggleMode);
    this.game.events.on('request-set-mode', onSetMode);
    this.game.events.on('request-toggle-grid', onToggleGrid);

    // Clean up event listeners when scene is shutdown or destroyed
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('request-toggle-mode', onToggleMode);
      this.game.events.off('request-set-mode', onSetMode);
      this.game.events.off('request-toggle-grid', onToggleGrid);
    });
  }
}
