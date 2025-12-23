import type { PlayerState } from './player/PlayerState';
import type { MapState } from './map/MapState';
import type { TurnPhaseType } from '../turn/TurnPhase';
import type { Armies } from './army/ArmyState';

export interface GameState {
  map: MapState;

  players: PlayerState[];

  armies: Armies;

  turn: number;
  turnOwner: string;
  turnPhase: TurnPhaseType;
}
