import { NO_PLAYER } from '../domain/player/playerRepository';
import { TurnPhase } from '../turn/TurnPhase';

import type { MapState } from '../state/map/MapState';
import type { GameState } from '../state/GameState';

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
