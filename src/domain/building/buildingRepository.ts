import { BuildingName } from '../../types/Building';
import type { BuildingType } from '../../types/Building';

/**
 * BuildingTemplate represents static building characteristics
 * This is the template/configuration for a building type
 */
export interface BuildingInfo {
  type: BuildingType;
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
        type: buildingType,
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
      };
    case BuildingName.BARRACKS:
      return {
        type: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
      };
    case BuildingName.MAGE_TOWER:
      return {
        type: buildingType,
        buildCost: 15000,
        maintainCost: 2000,
        description: 'Allows recruitment of Mage units',
      };
    case BuildingName.WATCH_TOWER:
      return {
        type: buildingType,
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
      };
    case BuildingName.OUTPOST:
      return {
        type: buildingType,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'The army stationed at the outpost defend all lands within a radius of 4',
      };
    case BuildingName.WALL:
      return {
        type: buildingType,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
    // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
    case BuildingName.DEMOLITION:
      return {
        type: buildingType,
        buildCost: 2000,
        maintainCost: -1,
        description: 'Demolish building and prepare territory for a new construction',
      };
  }
};
