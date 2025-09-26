import { Alignment } from './Alignment';

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
    alignment: 'neutral',
    imageName: 'none.png',
    goldPerTurn: { min: 0, max: 0 },
  },
  {
    id: LAND_TYPE.PLAINS,
    alignment: 'neutral',
    imageName: 'plains.png',
    goldPerTurn: { min: 2, max: 4 },
  },
  {
    id: LAND_TYPE.MOUNTAINS,
    alignment: 'lawful',
    imageName: 'mountains.png',
    goldPerTurn: { min: 4, max: 6 },
  },
  {
    id: LAND_TYPE.GREENFOREST,
    alignment: 'lawful',
    imageName: 'greenforest.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  {
    id: LAND_TYPE.DARKFOREST,
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  {
    id: LAND_TYPE.HILLS,
    alignment: 'neutral',
    imageName: 'hills.png',
    goldPerTurn: { min: 3, max: 5 },
  },
  {
    id: LAND_TYPE.SWAMP,
    alignment: 'chaotic',
    imageName: 'swamp.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  {
    id: LAND_TYPE.DESERT,
    alignment: 'neutral',
    imageName: 'desert.png',
    goldPerTurn: { min: 0, max: 1 },
  },
  {
    id: LAND_TYPE.LAVA,
    alignment: 'chaotic',
    imageName: 'lava.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  {
    id: LAND_TYPE.VOLCANO,
    alignment: 'chaotic',
    imageName: 'volcano.png',
    goldPerTurn: { min: 0, max: 1 },
  },
];
