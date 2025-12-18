import { BuildingType } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { HeroUnitType } from '../../types/UnitType';
import type { PlayerState } from '../../state/player/PlayerState';

/**
 * BuildingTemplate represents static building characteristics
 * This is the template/configuration for a building type
 */
export interface BuildingTemplate {
  id: BuildingType;
  buildCost: number;
  maintainCost: number;
  description: string;
}

/**
 * Get static building information by type
 */
export const getBuilding = (building: BuildingType): BuildingTemplate => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return {
        id: BuildingType.STRONGHOLD,
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
      };
    case BuildingType.BARRACKS:
      return {
        id: BuildingType.BARRACKS,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
      };
    case BuildingType.WHITE_MAGE_TOWER:
    case BuildingType.BLACK_MAGE_TOWER:
    case BuildingType.GREEN_MAGE_TOWER:
    case BuildingType.BLUE_MAGE_TOWER:
    case BuildingType.RED_MAGE_TOWER:
      return {
        id: building,
        buildCost: 15000,
        maintainCost: 2000,
        description: 'Allows recruitment of Mage units',
      };
    case BuildingType.WATCH_TOWER:
      return {
        id: BuildingType.WATCH_TOWER,
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
      };
    case BuildingType.OUTPOST:
      return {
        id: BuildingType.OUTPOST,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'The army stationed at the outpost defend all lands within a radius of 4',
      };
    case BuildingType.WALL:
      return {
        id: BuildingType.WALL,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
    // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
    case BuildingType.DEMOLITION:
      return {
        id: BuildingType.DEMOLITION,
        buildCost: 2000,
        maintainCost: -1,
        description: 'Demolish building and prepare territory for a new construction',
      };
  }
};

export const getAllBuildings = (player: PlayerState): BuildingTemplate[] => {
  const playerProfile = player.playerProfile;
  return Object.values(BuildingType)
    .map(getBuilding)
    .filter(
      (building) =>
        !building.id.toString().includes('Mage Tower') ||
        building.id === BuildingType.BLUE_MAGE_TOWER ||
        (building.id === BuildingType.WHITE_MAGE_TOWER &&
          playerProfile.type === HeroUnitType.CLERIC) ||
        (building.id === BuildingType.WHITE_MAGE_TOWER &&
          playerProfile.alignment === Alignment.LAWFUL) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER &&
          playerProfile.type === HeroUnitType.NECROMANCER) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER &&
          playerProfile.alignment === Alignment.CHAOTIC) ||
        (building.id === BuildingType.GREEN_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.CHAOTIC) ||
        (building.id === BuildingType.RED_MAGE_TOWER &&
          playerProfile.alignment !== Alignment.LAWFUL)
    );
};

export const isMageTower = (building: BuildingType): boolean =>
  building.toString().includes('Mage Tower');
