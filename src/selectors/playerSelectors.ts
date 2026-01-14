import { playerFactory } from '../factories/playerFactory';
import { isMageType } from '../domain/unit/unitTypeChecks';
import { getBuildingInfo } from '../domain/building/buildingRepository';
import { isItem } from '../domain/treasure/treasureRepository';
import { hasAvailableSlotForUnit } from './buildingSelectors';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { EffectKind } from '../types/Effect';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';
import { Mana } from '../types/Mana';
import { LandName } from '../types/Land';
import { BuildingName } from '../types/Building';
import { DiplomacyStatus } from '../types/Diplomacy';
import type { GameState } from '../state/GameState';
import type { PlayerState, PlayerTraits } from '../state/player/PlayerState';
import type { LandState } from '../state/map/land/LandState';
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

export const getUnitsAllowedToRecruit = (player: PlayerState, land: LandState, building: BuildingState): UnitType[] => {
  const landUnits = player.traits.recruitedUnitsPerLand[land.land.id] ?? new Set<UnitType>();
  const slotTraits = player.traits.recruitmentSlots[building.type]!;

  if (building.type === BuildingName.BARRACKS) {
    // non-magic players ignore corrupted lands
    if (land.corrupted && player.traits.restrictedMagic.size !== Object.values(Mana).length) {
      const availableUnits: Set<UnitType> = new Set(Object.values(WarMachineName));
      if (land.land.id === LandName.GREEN_FOREST) {
        availableUnits.add(RegularUnitName.DARK_ELF);
        availableUnits.add(HeroUnitName.SHADOW_BLADE);
      } else {
        availableUnits.add(RegularUnitName.ORC);
        availableUnits.add(HeroUnitName.OGR);
      }
      return Array.from(availableUnits).filter(
        (unit) => !isMageType(unit) && hasAvailableSlotForUnit(building, unit, slotTraits)
      );
    }
    return Array.from(landUnits).filter(
      (unit) => !isMageType(unit) && hasAvailableSlotForUnit(building, unit, slotTraits)
    );
  }
  if (building.type === BuildingName.MAGE_TOWER) {
    return Array.from(landUnits).filter(
      (unit) => isMageType(unit) && hasAvailableSlotForUnit(building, unit, slotTraits)
    );
  }
  return [];
};

export const getDiplomacyStatus = (state: GameState, playerId: string, opponent: string): DiplomacyStatusType => {
  if (playerId === opponent) return DiplomacyStatus.NO_TREATY;
  if (playerId === NO_PLAYER.id || opponent === NO_PLAYER.id) return DiplomacyStatus.NO_TREATY; // fallback to no treaty if player or opponent is not found
  return getPlayer(state, playerId).diplomacy[opponent].status;
};
