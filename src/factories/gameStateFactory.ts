import { MapState } from '../state/map/MapState';
import { NO_PLAYER } from '../data/players/predefinedPlayers';
import { GameState } from '../state/GameState';
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
