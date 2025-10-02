export enum BuildingType {
  STRONGHOLD = 'stronghold',
  BARRACKS = 'barracks',
  MAGE_TOWER = 'mage-tower',
  WATCH_TOWER = 'watch-tower',
  OUTPOST = 'outpost',
  WALL = 'wall',
}

export interface Building {
  id: BuildingType;
  name: string;
  buildCost: number;
  maintainCost: number;
  description: string;
  image?: string; // todo import the same way as GamePlayer.avatar
}

export const getBuilding = (building: BuildingType): Building => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return {
        id: BuildingType.STRONGHOLD,
        name: 'Stronghold',
        buildCost: 15000,
        maintainCost: 0,
        description: 'Protect army and produce gold',
      };
    case BuildingType.BARRACKS:
      return {
        id: BuildingType.BARRACKS,
        name: 'Barracks',
        buildCost: 10000,
        maintainCost: 1000,
        description: 'Allows recruitment of military units',
      };
    case BuildingType.MAGE_TOWER:
      return {
        id: BuildingType.MAGE_TOWER,
        name: 'Mage Tower',
        buildCost: 15000,
        maintainCost: 2000,
        description: 'Allows recruitment of Mage units',
      };
    case BuildingType.WATCH_TOWER:
      return {
        id: BuildingType.WATCH_TOWER,
        name: 'Watch Tower',
        buildCost: 5000,
        maintainCost: 300,
        description: 'Increases vision range and provides early warning',
      };
    case BuildingType.OUTPOST:
      return {
        id: BuildingType.OUTPOST,
        name: 'Outpost',
        buildCost: 10000,
        maintainCost: 1000,
        description:
          'The army stationed at the outpost becomes the defender for all border lands within a radius of 4',
      };
    case BuildingType.WALL:
      return {
        id: BuildingType.WALL,
        name: 'Castle Wall',
        buildCost: 5000,
        maintainCost: 100,
        description: 'Provides strong defensive bonuses',
      };
  }
};
