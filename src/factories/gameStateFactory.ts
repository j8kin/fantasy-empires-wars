import { MapState } from '../state/map/MapState';
import { GameState } from '../state/GameState';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { TurnPhase } from '../turn/TurnPhase';

export const gameStateFactory = (map: MapState): GameState => {
  return {
    map: map,
    players: [],
    armies: [],
    turnOwner: NO_PLAYER.id,
    turn: 1,
    turnPhase: TurnPhase.START,
  };
};
