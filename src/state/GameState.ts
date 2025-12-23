import type { MapState } from './map/MapState';
import type { PlayerState } from './player/PlayerState';
import type { ArmyState } from './army/ArmyState';
import type { TurnPhaseType } from '../turn/TurnPhase';

export interface GameState {
  map: MapState;

  players: PlayerState[];

  armies: ArmyState[];

  turn: number;
  turnOwner: string;
  turnPhase: TurnPhaseType;
}
