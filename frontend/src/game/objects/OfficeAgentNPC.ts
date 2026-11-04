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
  private bubbleContainer: Phaser.GameObjects.Container;
  private bubbleBg: Phaser.GameObjects.Graphics;
  private headerText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private statusBadgeText: Phaser.GameObjects.Text;
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

    // Sprite setup
    this.sprite = scene.add.sprite(0, 0, 'characters_atlas', `${characterId}_frame_0`);
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setScale(0.62);

    const idleKey = `${characterId}_idle_down`;
    if (scene.anims.exists(idleKey)) {
      this.sprite.play(idleKey);
    }

    // Add sprite to this container
    this.add(this.sprite);

    // Setup speech bubble container above character
    this.bubbleContainer = scene.add.container(0, -145);
    this.bubbleBg = scene.add.graphics();
    this.bubbleContainer.add(this.bubbleBg);

    // Header: Name & Role
    this.headerText = scene.add.text(0, -28, '', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#38bdf8',
      align: 'center',
    });
    this.headerText.setOrigin(0.5, 0.5);
    this.bubbleContainer.add(this.headerText);

    // Message Text
    this.messageText = scene.add.text(0, -6, '', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '10px',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: 190, useAdvancedWrap: true },
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.bubbleContainer.add(this.messageText);

    // Status Badge
    this.statusBadgeText = scene.add.text(0, 16, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#22c55e',
      align: 'center',
    });
    this.statusBadgeText.setOrigin(0.5, 0.5);
    this.bubbleContainer.add(this.statusBadgeText);

    this.add(this.bubbleContainer);

    // Depth sorting based on isometric Y position
    this.setDepth(worldPoint.y);

    // Setup interactive events
    this.setupInteractivity(scene);

    if (initialState) {
      this.updateLiveState(initialState);
    } else {
      this.drawSpeechBubble('Conectando...', 'En espera de automatización', 'IDLE');
    }

    scene.add.existing(this);
  }

  private setupInteractivity(scene: MainScene): void {
    this.setSize(70, 140);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-35, -140, 70, 140),
      Phaser.Geom.Rectangle.Contains
    );

    this.on('pointerover', () => {
      this.scene.input.setDefaultCursor('pointer');
      scene.tweens.killTweensOf(this.bubbleContainer);
      scene.tweens.add({
        targets: this.bubbleContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Cubic.easeOut',
      });
    });

    this.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      scene.tweens.killTweensOf(this.bubbleContainer);
      scene.tweens.add({
        targets: this.bubbleContainer,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 150,
        ease: 'Cubic.easeOut',
      });
    });

    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        scene.game.events.emit('agent-selected', this.agentCode);
      }
    });
  }

  public updateLiveState(state: AgentLiveState): void {
    this.currentState = state;
    this.drawSpeechBubble(
      `${state.name} • ${state.role}`,
      state.bubbleMessage || state.currentAction,
      state.status
    );

    // Play a gentle pop animation to indicate fresh activity
    this.scene.tweens.killTweensOf(this.bubbleContainer);
    this.scene.tweens.add({
      targets: this.bubbleContainer,
      y: -152,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.bubbleContainer.setY(-145);
      },
    });
  }

  private drawSpeechBubble(header: string, message: string, status: string): void {
    this.headerText.setText(header);
    this.messageText.setText(message);

    let statusLabel = '[ACTIVO]';
    let statusColor = '#22c55e'; // Green
    let borderTint = 0x38bdf8; // Sky blue
    let bgTint = 0x0f172a; // Deep slate

    switch (status) {
      case 'WORKING':
        statusLabel = '[TRABAJANDO • N8N]';
        statusColor = '#38bdf8';
        borderTint = 0x0284c7;
        break;
      case 'SUCCESS':
        statusLabel = '[COMPLETADO]';
        statusColor = '#4ade80';
        borderTint = 0x22c55e;
        break;
      case 'ERROR':
        statusLabel = '[ERROR EN NODO]';
        statusColor = '#f87171';
        borderTint = 0xef4444;
        break;
      case 'IDLE':
      default:
        statusLabel = '[LISTO]';
        statusColor = '#22c55e';
        borderTint = 0x38bdf8;
        break;
    }

    this.statusBadgeText.setText(statusLabel);
    this.statusBadgeText.setColor(statusColor);

    // Calculate dynamic bubble dimensions
    const width = 210;
    const height = 70;
    const radius = 10;
    const arrowHeight = 8;
    const arrowWidth = 12;

    this.bubbleBg.clear();

    // Bubble Drop Shadow
    this.bubbleBg.fillStyle(0x000000, 0.4);
    this.bubbleBg.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width, height, radius);

    // Bubble Body
    this.bubbleBg.fillStyle(bgTint, 0.92);
    this.bubbleBg.lineStyle(2, borderTint, 0.95);
    this.bubbleBg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.bubbleBg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    // Speech Bubble Pointer Arrow pointing down to character
    this.bubbleBg.fillStyle(bgTint, 0.92);
    this.bubbleBg.beginPath();
    this.bubbleBg.moveTo(-arrowWidth / 2, height / 2);
    this.bubbleBg.lineTo(arrowWidth / 2, height / 2);
    this.bubbleBg.lineTo(0, height / 2 + arrowHeight);
    this.bubbleBg.closePath();
    this.bubbleBg.fillPath();

    this.bubbleBg.lineStyle(2, borderTint, 0.95);
    this.bubbleBg.beginPath();
    this.bubbleBg.moveTo(-arrowWidth / 2, height / 2);
    this.bubbleBg.lineTo(0, height / 2 + arrowHeight);
    this.bubbleBg.lineTo(arrowWidth / 2, height / 2);
    this.bubbleBg.strokePath();
  }

  public getCurrentState(): AgentLiveState | undefined {
    return this.currentState;
  }
}
