import { GameState } from '../state/GameState';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';

import { NO_PLAYER } from '../domain/player/playerRepository';

export const getLand = (state: GameState, landPos: LandPosition) =>
  state.map.lands[getLandId(landPos)];

export const getLandOwner = (state: GameState, landPos: LandPosition): string =>
  state.players.find((p) => p.landsOwned.has(getLandId(landPos)))?.id ?? NO_PLAYER.id;
