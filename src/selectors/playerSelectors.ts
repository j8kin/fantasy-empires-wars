import { playerFactory } from '../factories/playerFactory';
import { unitsBaseStats } from '../domain/unit/unitRepository';
import { isMageType } from '../domain/unit/unitTypeChecks';
import { getBuildingInfo } from '../domain/building/buildingRepository';
import { isItem } from '../domain/treasure/treasureRepository';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { EffectKind } from '../types/Effect';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';
import { Mana } from '../types/Mana';
import { LandName } from '../types/Land';
import { BuildingName } from '../types/Building';
import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { LandState } from '../state/map/land/LandState';
import type { BuildingInfo } from '../domain/building/buildingRepository';
import type { EffectSourceId } from '../types/Effect';
import type { Item, TreasureType } from '../types/Treasures';
import type { DiplomacyStatusType } from '../types/Diplomacy';
import type { BuildingType } from '../types/Building';
import type { UnitType } from '../types/UnitType';
import type { ManaType } from '../types/Mana';

const NONE = playerFactory(NO_PLAYER, 'computer');

export const getPlayer = (state: GameState, id: string): PlayerState =>
  state.players.find((p) => p.id === id) ?? NONE;

export const getTurnOwner = (state: GameState): PlayerState => getPlayer(state, state.turnOwner);

/**
 * Filters players by diplomacy status relative to turn owner
 * @param gameState - The current game state
 * @param statuses - Array of diplomacy statuses to filter by
 * @returns Array of players matching the diplomacy criteria
 */
export const getPlayersByDiplomacy = (
  gameState: GameState,
  statuses: DiplomacyStatusType[]
): PlayerState[] => {
  const { turnOwner } = gameState;
  return gameState.players.filter(
    (p) => p.id !== turnOwner && statuses.includes(p.diplomacy[turnOwner])
  );
};

export const hasActiveEffectByPlayer = (
  state: PlayerState,
  effectSourceId: EffectSourceId
): boolean => {
  return state.effects.some(
    (e) =>
      e.sourceId === effectSourceId &&
      (e.rules.duration > 0 || e.rules.type === EffectKind.PERMANENT)
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

const MANA_TO_MAGE_TOWER: Partial<Record<BuildingType, ManaType>> = {
  [BuildingName.WHITE_MAGE_TOWER]: Mana.WHITE,
  [BuildingName.GREEN_MAGE_TOWER]: Mana.GREEN,
  [BuildingName.BLUE_MAGE_TOWER]: Mana.BLUE,
  [BuildingName.RED_MAGE_TOWER]: Mana.RED,
  [BuildingName.BLACK_MAGE_TOWER]: Mana.BLACK,
};

export const getAllowedBuildings = (state: PlayerState): BuildingInfo[] => {
  return Object.values(BuildingName)
    .filter(
      (building) =>
        MANA_TO_MAGE_TOWER[building] == null ||
        !state.traits.restrictedMagic.has(MANA_TO_MAGE_TOWER[building])
    )
    .map(getBuildingInfo)
    .filter((b) => b.buildCost <= state.vault);
};

export const getUnitsAllowedToRecruit = (
  player: PlayerState,
  land: LandState,
  buildingType: BuildingType
): UnitType[] => {
  if (buildingType === BuildingName.BARRACKS) {
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
      return Array.from(availableUnits);
    }
    return Array.from(player.traits.recruitedUnitsPerLand[land.land.id]);
  }
  // Mage Tower. Return related hero type
  return Object.values(HeroUnitName).filter(
    (hero) => isMageType(hero) && unitsBaseStats(hero).recruitedIn === buildingType
  );
};
