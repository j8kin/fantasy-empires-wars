export enum BuildingType {
  STRONGHOLD = 'Stronghold',
  BARRACKS = 'Barracks',
  MAGE_TOWER = 'Mage Tower',
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
    case BuildingType.MAGE_TOWER:
      return {
        id: BuildingType.MAGE_TOWER,
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

export const getAllBuildings = (): Building[] => {
  return Object.values(BuildingType).map(getBuilding);
};
