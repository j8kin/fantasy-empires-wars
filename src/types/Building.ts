import { Alignment } from './Alignment';
import { HeroUnitType, UnitType } from './Army';
import { PlayerState } from './GamePlayer';

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
  DEMOLITION = 'Building Demolition',
}

interface BuildingSlot {
  unit: UnitType;
  turnsRemaining: number;
}

export interface Building {
  id: BuildingType;
  buildCost: number;
  maintainCost: number;
  description: string;
  numberOfSlots: number;
  slots?: BuildingSlot[];
}

export const getBuilding = (building: BuildingType): Building => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return {
        id: BuildingType.STRONGHOLD,
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
        numberOfSlots: 0,
      };
    case BuildingType.BARRACKS:
      return {
        id: BuildingType.BARRACKS,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
        numberOfSlots: 3,
        slots: [],
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
        numberOfSlots: 1,
        slots: [],
      };
    case BuildingType.WATCH_TOWER:
      return {
        id: BuildingType.WATCH_TOWER,
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
        numberOfSlots: 0,
      };
    case BuildingType.OUTPOST:
      return {
        id: BuildingType.OUTPOST,
        buildCost: 10000,
        maintainCost: 1000,
        description: 'The army stationed at the outpost defend all lands within a radius of 4',
        numberOfSlots: 0,
      };
    case BuildingType.WALL:
      return {
        id: BuildingType.WALL,
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
        numberOfSlots: 0,
      };
    // this is not an actual building this is only an action to destroy previous building to be able to construct a new one
    case BuildingType.DEMOLITION:
      return {
        id: BuildingType.DEMOLITION,
        buildCost: 2000,
        maintainCost: -1,
        description: 'Demolish building and prepare territory for a new construction',
        numberOfSlots: 0,
      };
  }
};

export const getAllBuildings = (player: PlayerState): Building[] => {
  const playerType = player.getType();
  const playerAlignment = player.getAlignment();
  return Object.values(BuildingType)
    .map(getBuilding)
    .filter(
      (building) =>
        !building.id.toString().includes('Mage Tower') ||
        building.id === BuildingType.BLUE_MAGE_TOWER ||
        (building.id === BuildingType.WHITE_MAGE_TOWER && playerType === HeroUnitType.CLERIC) ||
        (building.id === BuildingType.WHITE_MAGE_TOWER && playerAlignment === Alignment.LAWFUL) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER &&
          playerType === HeroUnitType.NECROMANCER) ||
        (building.id === BuildingType.BLACK_MAGE_TOWER && playerAlignment === Alignment.CHAOTIC) ||
        (building.id === BuildingType.GREEN_MAGE_TOWER && playerAlignment !== Alignment.CHAOTIC) ||
        (building.id === BuildingType.RED_MAGE_TOWER && playerAlignment !== Alignment.LAWFUL)
    );
};

export const isMageTower = (building: BuildingType): boolean =>
  building.toString().includes('Mage Tower');
