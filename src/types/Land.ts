import { Alignment } from './Alignment';

export const enum LandType {
  NONE = 'none',
  PLAINS = 'Plains',
  MOUNTAINS = 'Mountains',
  GREENFOREST = 'Green Forest',
  DARKFOREST = 'Dark Forest',
  HILLS = 'Hills',
  SWAMP = 'Swamp',
  DESERT = 'Desert',
  LAVA = 'Lava',
  VOLCANO = 'Volcano',
}

export interface Land {
  id: LandType;
  alignment: Alignment;
  imageName: string;
  goldPerTurn: { min: number; max: number };
}

export const getLandById = (id: LandType): Land => LAND_TYPES.find((land) => land.id === id)!;

const LAND_TYPES: Land[] = [
  // none is used only for map generation
  {
    id: LandType.NONE,
    alignment: 'neutral',
    imageName: 'none.png',
    goldPerTurn: { min: 0, max: 0 },
  },
  {
    id: LandType.PLAINS,
    alignment: 'neutral',
    imageName: 'plains.png',
    goldPerTurn: { min: 2, max: 4 },
  },
  {
    id: LandType.MOUNTAINS,
    alignment: 'lawful',
    imageName: 'mountains.png',
    goldPerTurn: { min: 4, max: 6 },
  },
  {
    id: LandType.GREENFOREST,
    alignment: 'lawful',
    imageName: 'greenforest.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  {
    id: LandType.DARKFOREST,
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  {
    id: LandType.HILLS,
    alignment: 'neutral',
    imageName: 'hills.png',
    goldPerTurn: { min: 3, max: 5 },
  },
  {
    id: LandType.SWAMP,
    alignment: 'chaotic',
    imageName: 'swamp.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  {
    id: LandType.DESERT,
    alignment: 'neutral',
    imageName: 'desert.png',
    goldPerTurn: { min: 0, max: 1 },
  },
  {
    id: LandType.LAVA,
    alignment: 'chaotic',
    imageName: 'lava.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  {
    id: LandType.VOLCANO,
    alignment: 'chaotic',
    imageName: 'volcano.png',
    goldPerTurn: { min: 0, max: 1 },
  },
];
