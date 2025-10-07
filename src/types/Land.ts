import { Alignment } from './Alignment';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Lands

export const LAND_TYPE = {
  NONE: 'None',
  PLAINS: 'Plains',
  MOUNTAINS: 'Mountains',
  GREENFOREST: 'Green Forest',
  DARKFOREST: 'Dark Forest',
  HILLS: 'Hills',
  SWAMP: 'Swamp',
  DESERT: 'Desert',
  LAVA: 'Lava',
  VOLCANO: 'Volcano',
} as const;

export type LandType = (typeof LAND_TYPE)[keyof typeof LAND_TYPE];

export interface Land {
  id: LandType;
  alignment: Alignment;
  imageName: string;
  goldPerTurn: { min: number; max: number };
}

export const getLandById = (id: LandType): Land => PREDEFINED_LANDS.find((land) => land.id === id)!;

const PREDEFINED_LANDS: Land[] = [
  // none is used only for map generation
  {
    id: LAND_TYPE.NONE,
    alignment: Alignment.NEUTRAL,
    imageName: 'none.png',
    goldPerTurn: { min: 0, max: 0 },
  },
  {
    id: LAND_TYPE.PLAINS,
    alignment: Alignment.NEUTRAL,
    imageName: 'plains.png',
    goldPerTurn: { min: 2000, max: 3000 },
  },
  {
    id: LAND_TYPE.MOUNTAINS,
    alignment: Alignment.LAWFUL,
    imageName: 'mountains.png',
    goldPerTurn: { min: 2700, max: 3400 },
  },
  {
    id: LAND_TYPE.GREENFOREST,
    alignment: Alignment.LAWFUL,
    imageName: 'greenforest.png',
    goldPerTurn: { min: 2500, max: 2800 },
  },
  {
    id: LAND_TYPE.DARKFOREST,
    alignment: Alignment.CHAOTIC,
    imageName: 'darkforest.png',
    goldPerTurn: { min: 2500, max: 2800 },
  },
  {
    id: LAND_TYPE.HILLS,
    alignment: Alignment.NEUTRAL,
    imageName: 'hills.png',
    goldPerTurn: { min: 1500, max: 2200 },
  },
  {
    id: LAND_TYPE.SWAMP,
    alignment: Alignment.CHAOTIC,
    imageName: 'swamp.png',
    goldPerTurn: { min: 1100, max: 1700 },
  },
  {
    id: LAND_TYPE.DESERT,
    alignment: Alignment.NEUTRAL,
    imageName: 'desert.png',
    goldPerTurn: { min: 500, max: 700 },
  },
  {
    id: LAND_TYPE.LAVA,
    alignment: Alignment.CHAOTIC,
    imageName: 'lava.png',
    goldPerTurn: { min: 1500, max: 1900 },
  },
  {
    id: LAND_TYPE.VOLCANO,
    alignment: Alignment.CHAOTIC,
    imageName: 'volcano.png',
    goldPerTurn: { min: 3000, max: 3000 },
  },
];
