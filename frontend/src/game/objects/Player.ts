import * as Phaser from 'phaser';
import type { MainScene } from '../scenes/MainScene';
import {
  type CharacterId,
  getCharacterById,
  CHARACTERS_CATALOG,
} from '../models/CharacterModel';

export type MovementDirection =
  | 'south'
  | 'southeast'
  | 'east'
  | 'northeast'
  | 'north'
  | 'northwest'
  | 'west'
  | 'southwest';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public characterId: CharacterId;
  private currentDirection: MovementDirection = 'south';
  private targetPoint: Phaser.Math.Vector2 | null = null;
  private moveSpeed: number = 215;
  private mainScene: MainScene;

  // Keyboard controls
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  // Movement indicator
  private clickIndicator?: Phaser.GameObjects.Graphics;

  constructor(
    scene: MainScene,
    x: number,
    y: number,
    characterId: CharacterId = 'char_0'
  ) {
    const profile = getCharacterById(characterId) ?? CHARACTERS_CATALOG[0];
    super(scene, x, y, 'characters_atlas', `${characterId}_idle_south`);

    this.mainScene = scene;
    this.characterId = characterId;
    this.moveSpeed = profile.speed || 215;

    // Add to scene display & physics systems
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Visual setup
    this.setOrigin(0.5, 1.0);
    this.setScale(0.62);
    this.setDepth(this.y);

    // Setup Arcade Physics Body
    this.setupPhysicsBody();

    // Setup Keyboard Controls
    this.setupKeyboard();

    // Setup visual click indicator
    this.clickIndicator = scene.add.graphics();
    this.clickIndicator.setDepth(10);
    this.clickIndicator.setVisible(false);

    // Play default initial idle animation
    this.playAnimation('idle');
  }

  /**
   * Configures a tight, responsive collision box positioned at the character's feet.
   * Frame size is 160x180, feet centered around x=80, y=162..178.
   */
  private setupPhysicsBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    body.setSize(36, 16);
    body.setOffset(62, 162);
    body.setCollideWorldBounds(false);
  }

  /**
   * Initializes keyboard cursor keys and WASD inputs.
   */
  private setupKeyboard(): void {
    if (!this.mainScene.input.keyboard) return;

    this.cursors = this.mainScene.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      W: this.mainScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.mainScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.mainScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.mainScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  /**
   * Switches the active character skin, updating speed and animations seamlessly.
   */
  public setCharacter(characterId: CharacterId): void {
    if (this.characterId === characterId) return;

    const profile = getCharacterById(characterId);
    if (!profile) return;

    this.characterId = characterId;
    this.moveSpeed = profile.speed || 215;

    // Smooth bounce transition
    this.mainScene.tweens.add({
      targets: this,
      scaleX: 0.70,
      scaleY: 0.55,
      yoyo: true,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.setScale(0.62);
      },
    });

    const body = this.body as Phaser.Physics.Arcade.Body;
    const isMoving = body && (body.velocity.x !== 0 || body.velocity.y !== 0);
    this.playAnimation(isMoving ? 'walk' : 'idle');
  }

  /**
   * Commands the player to walk towards a world coordinate (click-to-move).
   */
  public moveTo(worldX: number, worldY: number, showRipple: boolean = true): void {
    // Validate target is on or clamp to the walkable diorama floor
    const grid = this.mainScene.worldToGrid(worldX, worldY);
    const clampedCol = Phaser.Math.Clamp(grid.col, 0.6, 19.4);
    const clampedRow = Phaser.Math.Clamp(grid.row, 0.6, 19.4);
    const clampedWorld = this.mainScene.gridToWorld(clampedCol, clampedRow);

    this.targetPoint = new Phaser.Math.Vector2(clampedWorld.x, clampedWorld.y);

    // Animate click ripple indicator
    if (showRipple && this.clickIndicator) {
      this.clickIndicator.clear();
      this.clickIndicator.lineStyle(2, 0x38bdf8, 0.9);
      this.clickIndicator.strokeCircle(clampedWorld.x, clampedWorld.y, 14);
      this.clickIndicator.setVisible(true);

      this.mainScene.tweens.killTweensOf(this.clickIndicator);
      this.clickIndicator.alpha = 1;
      this.clickIndicator.scale = 1;

      this.mainScene.tweens.add({
        targets: this.clickIndicator,
        alpha: 0,
        scale: 1.4,
        duration: 350,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.clickIndicator?.setVisible(false);
        },
      });
    }
  }

  /**
   * Stops any active movement.
   */
  public stopMoving(): void {
    this.targetPoint = null;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
    this.playAnimation('idle');
  }

  /**
   * Primary frame update loop: handles free movement, physics, bounds, depth sorting and animations.
   */
  public update(_time: number, _delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // If input is globally disabled (e.g. during active modal dialogs), freeze
    if (!this.mainScene.input.enabled || (this.mainScene.input.keyboard && !this.mainScene.input.keyboard.enabled)) {
      body.setVelocity(0, 0);
      this.targetPoint = null;
      this.playAnimation('idle');
      return;
    }

    let inputX = 0;
    let inputY = 0;

    // Check Keyboard Inputs (Arrow keys and WASD)
    const leftDown = Boolean(this.cursors?.left?.isDown || this.wasdKeys?.A?.isDown);
    const rightDown = Boolean(this.cursors?.right?.isDown || this.wasdKeys?.D?.isDown);
    const upDown = Boolean(this.cursors?.up?.isDown || this.wasdKeys?.W?.isDown);
    const downDown = Boolean(this.cursors?.down?.isDown || this.wasdKeys?.S?.isDown);

    if (leftDown) inputX -= 1;
    if (rightDown) inputX += 1;
    if (upDown) inputY -= 1;
    if (downDown) inputY += 1;

    const hasKeyboardInput = inputX !== 0 || inputY !== 0;

    if (hasKeyboardInput) {
      // Direct keyboard control cancels click target
      this.targetPoint = null;

      const inputVector = new Phaser.Math.Vector2(inputX, inputY).normalize();
      body.setVelocity(inputVector.x * this.moveSpeed, inputVector.y * this.moveSpeed);
      this.updateDirection(inputVector.x, inputVector.y);
      this.playAnimation('walk');
    } else if (this.targetPoint) {
      // Click-to-move pathing
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);

      if (dist < 6) {
        // Arrived at destination
        this.targetPoint = null;
        body.setVelocity(0, 0);
        this.playAnimation('idle');
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
        const vx = Math.cos(angle) * this.moveSpeed;
        const vy = Math.sin(angle) * this.moveSpeed;

        body.setVelocity(vx, vy);
        this.updateDirection(vx, vy);
        this.playAnimation('walk');
      }
    } else {
      // Stationary
      body.setVelocity(0, 0);
      this.playAnimation('idle');
    }

    // Keep within isometric floor perimeter
    this.constrainToWalkableFloor();

    // Maintain accurate isometric depth sorting
    this.setDepth(this.y + 2);
  }

  /**
   * Determines the 8-directional orientation based on movement velocity vector.
   */
  private updateDirection(vx: number, vy: number): void {
    if (vx === 0 && vy === 0) return;

    const angleDeg = Phaser.Math.RadToDeg(Math.atan2(vy, vx)); // -180 to 180

    if (angleDeg >= -22.5 && angleDeg < 22.5) {
      this.currentDirection = 'east';
    } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
      this.currentDirection = 'southeast';
    } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
      this.currentDirection = 'south';
    } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
      this.currentDirection = 'southwest';
    } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
      this.currentDirection = 'northeast';
    } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
      this.currentDirection = 'north';
    } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
      this.currentDirection = 'northwest';
    } else {
      this.currentDirection = 'west';
    }
  }

  /**
   * Selects and plays the corresponding animation for the current state and direction.
   */
  private playAnimation(state: 'idle' | 'walk'): void {
    const animKey = `${this.characterId}_${state}_${this.currentDirection}`;

    // All directions have dedicated hand-drawn sprites in atlas, no flipX needed
    this.setFlipX(false);

    if (this.anims.currentAnim?.key !== animKey) {
      if (this.mainScene.anims.exists(animKey)) {
        this.play(animKey, true);
      }
    }
  }

  /**
   * Constrains player feet to remain strictly within the 20x20 isometric diorama floor.
   */
  private constrainToWalkableFloor(): void {
    const grid = this.mainScene.worldToGrid(this.x, this.y);
    const minBound = 0.6;
    const maxBound = 19.4;

    let clamped = false;
    let clampedCol = grid.col;
    let clampedRow = grid.row;

    if (grid.col < minBound) {
      clampedCol = minBound;
      clamped = true;
    } else if (grid.col > maxBound) {
      clampedCol = maxBound;
      clamped = true;
    }

    if (grid.row < minBound) {
      clampedRow = minBound;
      clamped = true;
    } else if (grid.row > maxBound) {
      clampedRow = maxBound;
      clamped = true;
    }

    if (clamped) {
      const worldPos = this.mainScene.gridToWorld(clampedCol, clampedRow);
      this.setPosition(worldPos.x, worldPos.y);

      // Stop walking if clamped against perimeter
      if (this.targetPoint) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
        if (dist < 12) {
          this.targetPoint = null;
          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body) body.setVelocity(0, 0);
          this.playAnimation('idle');
        }
      }
    }
  }

  public override destroy(fromScene?: boolean): void {
    if (this.clickIndicator) {
      this.clickIndicator.destroy();
    }
    super.destroy(fromScene);
  }
}
