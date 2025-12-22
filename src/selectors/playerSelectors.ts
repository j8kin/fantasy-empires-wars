import { isRelic } from '../domain/treasure/treasureRepository';
import { playerFactory } from '../factories/playerFactory';

import { EffectType } from '../types/Effect';
import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { LandState } from '../state/map/land/LandState';
import type { SpellName } from '../types/Spell';
import type { Item, TreasureType } from '../types/Treasures';
import type { DiplomacyStatus } from '../types/Diplomacy';
import { NO_PLAYER } from '../domain/player/playerRepository';

const NONE = playerFactory(NO_PLAYER, 'computer');

export const getPlayer = (state: GameState, id: string): PlayerState =>
  state.players.find((p) => p.id === id) ?? NONE;

export const getTurnOwner = (state: GameState): PlayerState => getPlayer(state, state.turnOwner);

export const getPlayerLands = (state: GameState, playerId?: string): LandState[] => {
  return getPlayer(state, playerId ?? state.turnOwner)
    .landsOwned.values()
    .toArray()
    .map((landId) => state.map.lands[landId]);
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
  return state.effects.some(
    (e) => e.sourceId === spellId && (e.rules.duration > 0 || e.rules.type === EffectType.PERMANENT)
  );
};

export const hasTreasureByPlayer = (player: PlayerState, treasure: TreasureType): boolean => {
  return player.empireTreasures?.some((t) => t.treasure.type === treasure);
};

export const getTreasureItem = (player: PlayerState, itemType: TreasureType): Item | undefined => {
  const item = player.empireTreasures?.find((t) => t.treasure.type === itemType);
  if (!item) return undefined;
  return !isRelic(item) ? item : undefined;
};

export const getTreasureItemById = (player: PlayerState, itemId: string): Item | undefined => {
  const item = player.empireTreasures?.find((t) => t.id === itemId);
  if (!item) return undefined;
  return !isRelic(item) ? item : undefined;
};
