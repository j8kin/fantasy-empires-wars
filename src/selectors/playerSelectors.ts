import { playerFactory } from '../factories/playerFactory';
import { isMageType } from '../domain/unit/unitTypeChecks';
import { getBuildingInfo } from '../domain/building/buildingRepository';
import { isItem } from '../domain/treasure/treasureRepository';
import { getLandUnitsToRecruit } from '../domain/land/landRepository';
import { hasAvailableSlotForUnit } from './buildingSelectors';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { EffectKind } from '../types/Effect';
import { BuildingName } from '../types/Building';
import { DiplomacyStatus } from '../types/Diplomacy';
import type { GameState } from '../state/GameState';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import type { LandState } from '../state/map/land/LandState';
import type { LandType } from '../types/Land';
import type { BuildingState } from '../state/map/building/BuildingState';
import type { BuildingInfo } from '../domain/building/buildingRepository';
import type { EffectSourceId } from '../types/Effect';
import type { Item, TreasureType } from '../types/Treasures';
import type { DiplomacyStatusType } from '../types/Diplomacy';
import type { UnitType } from '../types/UnitType';

const NONE = playerFactory(NO_PLAYER, 'computer');

export const getPlayer = (state: GameState, id: string): PlayerState => state.players.find((p) => p.id === id) ?? NONE;

export const getTurnOwner = (state: GameState): PlayerState => getPlayer(state, state.turnOwner);

/**
 * Filters players by diplomacy status relative to turn owner
 * @param gameState - The current game state
 * @param statuses - Array of diplomacy statuses to filter by
 * @returns Array of players matching the diplomacy criteria
 */
export const getPlayersByDiplomacy = (gameState: GameState, statuses: DiplomacyStatusType[]): PlayerState[] => {
  const { turnOwner } = gameState;
  return gameState.players.filter(
    (p) => p.id !== turnOwner && p.diplomacy[turnOwner] != null && statuses.includes(p.diplomacy[turnOwner].status)
  );
};

export const hasActiveEffectByPlayer = (state: PlayerState, effectSourceId: EffectSourceId): boolean => {
  return state.effects.some(
    (e) => e.sourceId === effectSourceId && (e.rules.duration > 0 || e.rules.type === EffectKind.PERMANENT)
  );
};

export const hasTreasureByPlayer = (player: PlayerState, treasure: TreasureType): boolean => {
  return player.empireTreasures?.some((t) => t.treasure.type === treasure);
};

export const getTreasureItem = (player: PlayerState, itemType: TreasureType): Item | undefined => {
  const item = player.empireTreasures?.find((t) => t.treasure.type === itemType);
  if (!item) return undefined;
  return isItem(item) ? item : undefined;
};

export const getTreasureItemById = (player: PlayerState, itemId: string): Item | undefined => {
  const item = player.empireTreasures?.find((t) => t.id === itemId);
  if (!item) return undefined;
  return isItem(item) ? item : undefined;
};

const hasAvailableMageUnits = (traits: PlayerTraits): boolean => {
  return Object.values(traits.recruitedUnitsPerLand).some((units) =>
    Array.from(units).some((unit) => isMageType(unit))
  );
};

export const getAllowedBuildings = (state: PlayerState): BuildingInfo[] => {
  const canRecruitMages = hasAvailableMageUnits(state.traits);

  return Object.values(BuildingName)
    .filter((building) => building !== BuildingName.MAGE_TOWER || canRecruitMages)
    .map(getBuildingInfo)
    .filter((b) => b.buildCost <= state.vault);
};

const getAllPossibleUnitTypes = (traits: Record<LandType, Set<string>>): Set<string> => {
  return Object.values(traits).reduce((resultSet, valueSet) => {
    valueSet.forEach((value) => resultSet.add(value));
    return resultSet;
  }, new Set<string>());
};

/**
 * Return units Allowed to recruited on related land
 * @param player
 * @param land
 * @param building - if null return all units if not return available for current building
 */
export const getUnitsAllowedToRecruit = (
  player: PlayerState,
  land: LandState,
  building?: BuildingState
): UnitType[] => {
  const unitsPerLand = getLandUnitsToRecruit(land.type, land.corrupted); // list of all possible unit type available on this land type
  // if land corrupted check that user allow to recruit units from corrupted land
  const unitsPlayerCouldRecruit = land.corrupted
    ? getAllPossibleUnitTypes(player.traits.recruitedUnitsPerLand)
    : (player.traits.recruitedUnitsPerLand[land.type] ?? new Set<UnitType>());
  const allowedUnits = unitsPerLand.filter((unit) => unitsPlayerCouldRecruit.has(unit));
  if (building == null) return allowedUnits;

  const slotTraits = player.traits.recruitmentSlots[building.type]!;
  return Array.from(allowedUnits).filter((unit) => hasAvailableSlotForUnit(building, unit, slotTraits));
};

export const getDiplomacyStatus = (state: GameState, playerId: string, opponent: string): DiplomacyStatusType => {
  if (playerId === opponent) return DiplomacyStatus.NO_TREATY;
  if (playerId === NO_PLAYER.id || opponent === NO_PLAYER.id) return DiplomacyStatus.NO_TREATY; // fallback to no treaty if player or opponent is not found
  return getPlayer(state, playerId).diplomacy[opponent].status;
};
