import { Alignment } from './Alignment';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Lands

export enum LAND_TYPE {
  NONE = 'None',
  PLAINS = 'Plains',
  MOUNTAINS = 'Mountains',
  GREEN_FOREST = 'Green Forest',
  DARK_FOREST = 'Dark Forest',
  HILLS = 'Hills',
  SWAMP = 'Swamp',
  DESERT = 'Desert',
  LAVA = 'Lava',
  VOLCANO = 'Volcano',
}

export interface Land {
  id: LAND_TYPE;
  alignment: Alignment;
  goldPerTurn: { min: number; max: number };
}

export const getLandById = (id: LAND_TYPE): Land => {
  switch (id) {
    case LAND_TYPE.PLAINS:
      return {
        id: LAND_TYPE.PLAINS,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 2000, max: 3000 },
      };
    case LAND_TYPE.MOUNTAINS:
      return {
        id: LAND_TYPE.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 2700, max: 3400 },
      };
    case LAND_TYPE.GREEN_FOREST:
      return {
        id: LAND_TYPE.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 2500, max: 2800 },
      };
    case LAND_TYPE.DARK_FOREST:
      return {
        id: LAND_TYPE.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 2500, max: 2800 },
      };
    case LAND_TYPE.HILLS:
      return {
        id: LAND_TYPE.HILLS,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 1500, max: 2200 },
      };
    case LAND_TYPE.SWAMP:
      return {
        id: LAND_TYPE.SWAMP,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 1100, max: 1700 },
      };
    case LAND_TYPE.DESERT:
      return {
        id: LAND_TYPE.DESERT,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 500, max: 700 },
      };
    case LAND_TYPE.LAVA:
      return {
        id: LAND_TYPE.LAVA,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 1500, max: 1900 },
      };
    case LAND_TYPE.VOLCANO:
      return {
        id: LAND_TYPE.VOLCANO,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 3000, max: 3000 },
      };
    default:
      // use on map generation
      return {
        id: LAND_TYPE.NONE,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 0, max: 0 },
      };
  }
};
