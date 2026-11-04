import * as Phaser from 'phaser';
import type { MainScene } from '../scenes/MainScene';
import type { CharacterId } from '../models/CharacterModel';
import type { AgentLiveState } from '../../services/api';

export class OfficeAgentNPC extends Phaser.GameObjects.Container {
  public readonly agentCode: 'ASSISTANT' | 'COWORKER' | 'MANAGER';
  public readonly characterId: CharacterId;
  public readonly gridCol: number;
  public readonly gridRow: number;

  private sprite: Phaser.GameObjects.Sprite;
  private currentState?: AgentLiveState;

  constructor(
    scene: MainScene,
    gridCol: number,
    gridRow: number,
    agentCode: 'ASSISTANT' | 'COWORKER' | 'MANAGER',
    characterId: CharacterId,
    initialState?: AgentLiveState
  ) {
    const worldPoint = scene.gridToWorld(gridCol + 0.5, gridRow + 0.5);
    super(scene, worldPoint.x, worldPoint.y);

    this.agentCode = agentCode;
    this.characterId = characterId;
    this.gridCol = gridCol;
    this.gridRow = gridRow;

    // Pixel-art character sprite setup
    this.sprite = scene.add.sprite(0, 0, 'characters_atlas', `${characterId}_idle_south`);
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setScale(0.62);

    const idleKey = `${characterId}_idle_south`;
    if (scene.anims.exists(idleKey)) {
      this.sprite.play(idleKey);
    }

    // Add sprite to this container
    this.add(this.sprite);

    // Depth sorting based on isometric Y position
    this.setDepth(worldPoint.y);

    // Setup interactive events strictly on the character sprite
    this.setupInteractivity(scene);

    if (initialState) {
      this.updateLiveState(initialState);
    }

    scene.add.existing(this);
  }

  /**
   * Configures pixel-perfect interactive click detection strictly on the character body.
   * Clicks in nearby empty space or on the floor will NOT trigger this agent.
   */
  private setupInteractivity(scene: MainScene): void {
    // Only the sprite is interactive, testing the exact non-transparent pixels of the character
    this.sprite.setInteractive({
      useHandCursor: true,
      pixelPerfect: true,
      alphaTolerance: 30,
    });

    // Hover feedback on the character's body
    this.sprite.on('pointerover', () => {
      this.scene.input.setDefaultCursor('pointer');
      scene.tweens.killTweensOf(this.sprite);
      scene.tweens.add({
        targets: this.sprite,
        scaleX: 0.66,
        scaleY: 0.66,
        duration: 120,
        ease: 'Cubic.easeOut',
      });
    });

    this.sprite.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      scene.tweens.killTweensOf(this.sprite);
      scene.tweens.add({
        targets: this.sprite,
        scaleX: 0.62,
        scaleY: 0.62,
        duration: 120,
        ease: 'Cubic.easeOut',
      });
    });

    // Activation happens ONLY when releasing a left click inside the character's body
    this.sprite.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0 && pointer.getDistance() < 10) {
        // Tactile bounce feedback
        scene.tweens.killTweensOf(this.sprite);
        scene.tweens.add({
          targets: this.sprite,
          scaleX: 0.56,
          scaleY: 0.68,
          yoyo: true,
          duration: 110,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.sprite.setScale(0.62);
          },
        });

        // Emit event to open the agent's report modal
        scene.game.events.emit('agent-selected', this.agentCode);
      }
    });
  }

  public showBubble(): void {
    // Report comment on map removed to keep the office map clean
  }

  public hideBubble(): void {
    // Report comment on map removed to keep the office map clean
  }

  public updateLiveState(state: AgentLiveState): void {
    this.currentState = state;

    // Update sprite animation based on live status
    let animKey = `${this.characterId}_idle_south`;
    switch (state.status) {
      case 'WORKING':
        animKey = `${this.characterId}_talking_south`;
        break;
      case 'ERROR':
        animKey = `${this.characterId}_agitated_south`;
        break;
      case 'SUCCESS':
      case 'IDLE':
      default:
        animKey = `${this.characterId}_idle_south`;
        break;
    }
    if (this.scene.anims.exists(animKey) && this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }
  }

  public getCurrentState(): AgentLiveState | undefined {
    return this.currentState;
  }
}
