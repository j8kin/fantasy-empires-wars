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

const BUILDINGS: Record<BuildingType, BuildingInfo> = {
  [BuildingName.STRONGHOLD]: {
    type: BuildingName.STRONGHOLD,
    buildCost: 15000,
    maintainCost: 0,
    description: 'Protect army and produce gold',
  },
  [BuildingName.BARRACKS]: {
    type: BuildingName.BARRACKS,
    buildCost: 10000,
    maintainCost: 1000,
    description: 'Allows recruitment of military units',
  },
  [BuildingName.MAGE_TOWER]: {
    type: BuildingName.MAGE_TOWER,
    buildCost: 15000,
    maintainCost: 2000,
    description: 'Allows recruitment of Mage units',
  },
  [BuildingName.WATCH_TOWER]: {
    type: BuildingName.WATCH_TOWER,
    buildCost: 5000,
    maintainCost: 300,
    description: 'Increases vision range and provides early warning',
  },
  [BuildingName.OUTPOST]: {
    type: BuildingName.OUTPOST,
    buildCost: 10000,
    maintainCost: 1000,
    description: 'The army stationed at the outpost defend all lands within a radius of 4',
  },
  [BuildingName.WALL]: {
    type: BuildingName.WALL,
    buildCost: 5000,
    maintainCost: 100,
    description: 'Provides strong defensive bonuses',
  },
  // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
  [BuildingName.DEMOLITION]: {
    type: BuildingName.DEMOLITION,
    buildCost: 2000,
    maintainCost: -1,
    description: 'Demolish building and prepare territory for a new construction',
  },
};

export const getBuildingInfo = (buildingType: BuildingType): BuildingInfo => BUILDINGS[buildingType];
