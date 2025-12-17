import type { PlayerState } from './player/PlayerState';
import type { MapState } from './map/MapState';
import type { TurnPhase } from '../turn/TurnPhase';
import type { Armies } from './army/ArmyState';

export interface GameState {
  map: MapState;

  players: PlayerState[];

  armies: Armies;

  turn: number;
  turnOwner: string;
  turnPhase: TurnPhase;
}
