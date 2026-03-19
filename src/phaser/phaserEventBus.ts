import { EventEmitter } from 'eventemitter3';

export const phaserEventBus = new EventEmitter();

export const PhaserEvents = {
  // Phaser → React
  TILE_CLICKED: 'TILE_CLICKED',           // payload: LandPosition
  TILE_RIGHT_CLICKED: 'TILE_RIGHT_CLICKED', // payload: LandPosition
  ARMY_CLICKED: 'ARMY_CLICKED',           // payload: ArmyState
  SCENE_READY: 'SCENE_READY',            // payload: scene key

  // React → Phaser (Overworld)
  STATE_UPDATE: 'STATE_UPDATE',           // payload: GameState
  GLOW_TILES: 'GLOW_TILES',             // payload: LandPosition[]
  CLEAR_GLOW: 'CLEAR_GLOW',

  // Battle (future)
  START_DEPLOY: 'START_DEPLOY',          // payload: BattleConfig
  DEPLOY_CONFIRMED: 'DEPLOY_CONFIRMED',  // payload: DeploymentResult
  BATTLE_OVER: 'BATTLE_OVER',           // payload: BattleResult
} as const;

export type PhaserEventName = (typeof PhaserEvents)[keyof typeof PhaserEvents];
