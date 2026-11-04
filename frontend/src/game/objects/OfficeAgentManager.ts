import type { MainScene } from '../scenes/MainScene';
import { OfficeAgentNPC } from './OfficeAgentNPC';
import type { AgentLiveState } from '../../services/api';

export class OfficeAgentManager {
  private scene: MainScene;
  private npcs: Map<string, OfficeAgentNPC> = new Map();

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public spawnAllAgents(states?: AgentLiveState[]): void {
    this.clearAll();

    // Map initial states by code if provided
    const stateMap = new Map<string, AgentLiveState>();
    if (states) {
      states.forEach((s) => stateMap.set(s.code, s));
    }

    // 1. Taylor Chen (Secretary / Assistant)
    const assistant = new OfficeAgentNPC(
      this.scene,
      5,
      13,
      'ASSISTANT',
      'char_2',
      stateMap.get('ASSISTANT')
    );
    this.npcs.set('ASSISTANT', assistant);

    // 2. Sam Rivera (Co-worker / Developer)
    const coworker = new OfficeAgentNPC(
      this.scene,
      13,
      13,
      'COWORKER',
      'char_1',
      stateMap.get('COWORKER')
    );
    this.npcs.set('COWORKER', coworker);

    // 3. Jordan Díaz (Manager / Supervisor)
    const manager = new OfficeAgentNPC(
      this.scene,
      13,
      5,
      'MANAGER',
      'char_3',
      stateMap.get('MANAGER')
    );
    this.npcs.set('MANAGER', manager);
  }

  public updateAgentStates(states: AgentLiveState[]): void {
    states.forEach((state) => {
      const npc = this.npcs.get(state.code);
      if (npc) {
        npc.updateLiveState(state);
      }
    });
  }

  public updateSingleAgent(state: AgentLiveState): void {
    const npc = this.npcs.get(state.code);
    if (npc) {
      npc.updateLiveState(state);
    }
  }

  public hideAllAgentBubbles(): void {
    this.npcs.forEach((npc) => npc.hideBubble());
  }

  public showAgentBubble(code: string): void {
    this.npcs.forEach((npc, agentCode) => {
      if (agentCode === code.toUpperCase()) {
        npc.showBubble();
      } else {
        npc.hideBubble();
      }
    });
  }

  public getAgent(code: string): OfficeAgentNPC | undefined {
    return this.npcs.get(code.toUpperCase());
  }

  public getAllAgents(): OfficeAgentNPC[] {
    return Array.from(this.npcs.values());
  }

  public clearAll(): void {
    this.npcs.forEach((npc) => npc.destroy());
    this.npcs.clear();
  }

  public destroy(): void {
    this.clearAll();
  }
}
