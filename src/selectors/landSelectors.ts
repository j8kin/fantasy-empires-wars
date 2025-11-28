import { GameState } from '../state/GameState';

import { NO_PLAYER } from '../data/players/predefinedPlayers';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';

export const getLand = (state: GameState, landPos: LandPosition) =>
  state.map.lands[getLandId(landPos)];

export const getLandOwner = (state: GameState, landPos: LandPosition): string =>
  state.players.find((p) => p.landsOwned.has(getLandId(landPos)))?.id ?? NO_PLAYER.id;
