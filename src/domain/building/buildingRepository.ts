import { BuildingName } from '../../types/Building';
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
    case BuildingName.STRONGHOLD:
      return {
        id: buildingType,
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
      };
    case BuildingName.BARRACKS:
      return {
        id: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
      };
    case BuildingName.WHITE_MAGE_TOWER:
    case BuildingName.BLACK_MAGE_TOWER:
    case BuildingName.GREEN_MAGE_TOWER:
    case BuildingName.BLUE_MAGE_TOWER:
    case BuildingName.RED_MAGE_TOWER:
      return {
        id: buildingType,
        buildCost: 15000,
        maintainCost: 2000,
        description: 'Allows recruitment of Mage units',
      };
    case BuildingName.WATCH_TOWER:
      return {
        id: buildingType,
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
      };
    case BuildingName.OUTPOST:
      return {
        id: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'The army stationed at the outpost defend all lands within a radius of 4',
      };
    case BuildingName.WALL:
      return {
        id: buildingType,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
    // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
    case BuildingName.DEMOLITION:
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
  return Object.values(BuildingName)
    .map(getBuildingInfo)
    .filter(
      (building) =>
        !building.id.toString().includes('Mage Tower') ||
        building.id === BuildingName.BLUE_MAGE_TOWER ||
        (building.id === BuildingName.WHITE_MAGE_TOWER &&
          playerProfile.type === HeroUnitName.CLERIC) ||
        (building.id === BuildingName.WHITE_MAGE_TOWER &&
          playerProfile.alignment === Alignment.LAWFUL) ||
        (building.id === BuildingName.BLACK_MAGE_TOWER &&
          playerProfile.type === HeroUnitName.NECROMANCER) ||
        (building.id === BuildingName.BLACK_MAGE_TOWER &&
          playerProfile.alignment === Alignment.CHAOTIC) ||
        (building.id === BuildingName.GREEN_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.CHAOTIC) ||
        (building.id === BuildingName.RED_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.LAWFUL)
    );
};

export const isMageTower = (building: BuildingType): boolean =>
  building.toString().includes('Mage Tower');
