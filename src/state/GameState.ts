import { PlayerState } from './player/PlayerState';
import { MapState } from './map/MapState';
import { TurnPhase } from '../turn/TurnPhase';

export interface GameState {
  map: MapState;

  players: PlayerState[];

  turn: number;
  turnOwner: string;
  turnPhase: TurnPhase;
}
