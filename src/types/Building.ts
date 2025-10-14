import { Alignment } from './Alignment';
import { UnitType } from './Army';
import { GamePlayer } from './GamePlayer';

export enum BuildingType {
  STRONGHOLD = 'Stronghold',
  BARRACKS = 'Barracks',
  WHITE_MAGE_TOWER = 'White Mage Tower',
  BLACK_MAGE_TOWER = 'Black Mage Tower',
  BLUE_MAGE_TOWER = 'Blue Mage Tower',
  GREEN_MAGE_TOWER = 'Green Mage Tower',
  RED_MAGE_TOWER = 'Red Mage Tower',
  WATCH_TOWER = 'Watch Tower',
  OUTPOST = 'Outpost',
  WALL = 'Castle Wall',
}

export interface Building {
  id: BuildingType;
  buildCost: number;
  maintainCost: number;
  description: string;
}

export const getBuilding = (building: BuildingType): Building => {
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
        description:
          'The army stationed at the outpost becomes the defender for all border lands within a radius of 4',
      };
    case BuildingType.WALL:
      return {
        id: BuildingType.WALL,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
  }
};

export const getAllBuildings = (player: GamePlayer): Building[] => {
  return Object.values(BuildingType)
    .map(getBuilding)
    .filter(
      (building) =>
        !building.id.toString().includes('Mage Tower') ||
        building.id === BuildingType.BLUE_MAGE_TOWER ||
        (building.id === BuildingType.WHITE_MAGE_TOWER && player.type === UnitType.CLERIC) ||
        (building.id === BuildingType.WHITE_MAGE_TOWER && player.alignment === Alignment.LAWFUL) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER && player.type === UnitType.NECROMANCER) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER && player.alignment === Alignment.CHAOTIC) ||
        (building.id === BuildingType.GREEN_MAGE_TOWER && player.alignment !== Alignment.CHAOTIC) ||
        (building.id === BuildingType.RED_MAGE_TOWER && player.alignment !== Alignment.LAWFUL)
    );
};
