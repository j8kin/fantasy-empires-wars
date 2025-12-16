import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player/PlayerState';
import { LandState } from '../state/map/land/LandState';
import { getLand } from './landSelectors';
import { BuildingType } from '../types/Building';
import { DiplomacyStatus } from '../types/Diplomacy';
import { SpellName } from '../types/Spell';
import { TreasureType } from '../types/Treasures';
import { getTilesInRadius } from '../map/utils/mapAlgorithms';

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

/**
 * Filters players by diplomacy status relative to turn owner
 * @param gameState - The current game state
 * @param statuses - Array of diplomacy statuses to filter by
 * @returns Array of players matching the diplomacy criteria
 */
export const getPlayersByDiplomacy = (
  gameState: GameState,
  statuses: DiplomacyStatus[]
): PlayerState[] => {
  const { turnOwner } = gameState;
  return gameState.players.filter(
    (p) => p.id !== turnOwner && statuses.includes(p.diplomacy[turnOwner])
  );
};

export const hasActiveEffectByPlayer = (state: PlayerState, spellId: SpellName): boolean => {
  return state.effects.some((e) => e.spell === spellId && e.duration > 0);
};

export const hasTreasureByPlayer = (player: PlayerState, treasure: TreasureType): boolean => {
  return player.empireTreasures?.some((t) => t.treasure.type === treasure);
};
