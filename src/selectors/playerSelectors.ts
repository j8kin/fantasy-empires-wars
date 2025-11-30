import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';
import { LandState } from '../state/map/land/LandState';
import { BuildingType } from '../types/Building';
import { getTilesInRadius } from '../map/utils/mapAlgorithms';
import { getLand } from './landSelectors';

export const getPlayer = (state: GameState, id: string): PlayerState =>
  state.players.find((p) => p.id === id)!;

export const getTurnOwner = (state: GameState): PlayerState => getPlayer(state, state.turnOwner);

export const getPlayerLands = (state: GameState, playerId?: string): LandState[] => {
  return getPlayer(state, playerId ?? state.turnOwner)
    .landsOwned.values()
    .toArray()
    .map((landId) => state.map.lands[landId]);
};

/** return all lands controlled by all strongholds of the player
 **/
export const getRealmLands = (state: GameState): LandState[] => {
  const realm = new Set<LandState>();

  const playerStrongholds = getPlayerLands(state).filter((l) =>
    l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
  );
  playerStrongholds.forEach((s) =>
    getTilesInRadius(state.map.dimensions, s.mapPos, 1).forEach((pos) =>
      realm.add(getLand(state, pos))
    )
  );
  return realm.values().toArray();
};
