import { BuildingKind } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { HeroUnitName } from '../../types/UnitType';
import type { PlayerState } from '../../state/player/PlayerState';
import type { BuildingType } from '../../types/Building';

/**
 * BuildingTemplate represents static building characteristics
 * This is the template/configuration for a building type
 */
export interface BuildingInfo {
  id: BuildingType;
  buildCost: number;
  maintainCost: number;
  description: string;
}

/**
 * Get static building information by type
 */
export const getBuildingInfo = (buildingType: BuildingType): BuildingInfo => {
  switch (buildingType) {
    case BuildingKind.STRONGHOLD:
      return {
        id: buildingType,
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
      };
    case BuildingKind.BARRACKS:
      return {
        id: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
      };
    case BuildingKind.WHITE_MAGE_TOWER:
    case BuildingKind.BLACK_MAGE_TOWER:
    case BuildingKind.GREEN_MAGE_TOWER:
    case BuildingKind.BLUE_MAGE_TOWER:
    case BuildingKind.RED_MAGE_TOWER:
      return {
        id: buildingType,
        buildCost: 15000,
        maintainCost: 2000,
        description: 'Allows recruitment of Mage units',
      };
    case BuildingKind.WATCH_TOWER:
      return {
        id: buildingType,
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
      };
    case BuildingKind.OUTPOST:
      return {
        id: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'The army stationed at the outpost defend all lands within a radius of 4',
      };
    case BuildingKind.WALL:
      return {
        id: buildingType,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
    // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
    case BuildingKind.DEMOLITION:
      return {
        id: buildingType,
        buildCost: 2000,
        maintainCost: -1,
        description: 'Demolish building and prepare territory for a new construction',
      };
  }
};

export const getAllBuildings = (player: PlayerState): BuildingInfo[] => {
  const playerProfile = player.playerProfile;
  return Object.values(BuildingKind)
    .map(getBuildingInfo)
    .filter(
      (building) =>
        !building.id.toString().includes('Mage Tower') ||
        building.id === BuildingKind.BLUE_MAGE_TOWER ||
        (building.id === BuildingKind.WHITE_MAGE_TOWER &&
          playerProfile.type === HeroUnitName.CLERIC) ||
        (building.id === BuildingKind.WHITE_MAGE_TOWER &&
          playerProfile.alignment === Alignment.LAWFUL) ||
        (building.id === BuildingKind.BLACK_MAGE_TOWER &&
          playerProfile.type === HeroUnitName.NECROMANCER) ||
        (building.id === BuildingKind.BLACK_MAGE_TOWER &&
          playerProfile.alignment === Alignment.CHAOTIC) ||
        (building.id === BuildingKind.GREEN_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.CHAOTIC) ||
        (building.id === BuildingKind.RED_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.LAWFUL)
    );
};

export const isMageTower = (building: BuildingType): boolean =>
  building.toString().includes('Mage Tower');
