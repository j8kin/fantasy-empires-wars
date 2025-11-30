import { PlayerState } from './player/PlayerState';
import { MapState } from './map/MapState';
import { TurnPhase } from '../turn/TurnPhase';
import { Armies } from './army/ArmyState';

export interface GameState {
  map: MapState;

  players: PlayerState[];

  armies: Armies;

  turn: number;
  turnOwner: string;
  turnPhase: TurnPhase;
}
