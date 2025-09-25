import { Alignment } from './Alignment';

export const enum LandType {
  NONE = 'none',
  PLAINS = 'plains',
  MOUNTAINS = 'mountains',
  GREENFOREST = 'greenforest',
  DARKFOREST = 'darkforest',
  HILLS = 'hills',
  SWAMP = 'swamp',
  DESERT = 'desert',
  LAVA = 'lava',
  VOLCANO = 'volcano',
}

export interface Land {
  id: LandType;
  name: string;
  alignment: Alignment;
  imageName: string;
  goldPerTurn: { min: number; max: number };
}

export const LAND_TYPES: { [key: string]: Land } = {
  // none is used only for map generation
  none: {
    id: LandType.NONE,
    name: 'none',
    alignment: 'neutral',
    imageName: 'none.png',
    goldPerTurn: { min: 0, max: 0 },
  },
  plains: {
    id: LandType.PLAINS,
    name: 'Plains',
    alignment: 'neutral',
    imageName: 'plains.png',
    goldPerTurn: { min: 2, max: 4 },
  },
  mountains: {
    id: LandType.MOUNTAINS,
    name: 'Mountains',
    alignment: 'lawful',
    imageName: 'mountains.png',
    goldPerTurn: { min: 4, max: 6 },
  },
  greenforest: {
    id: LandType.GREENFOREST,
    name: 'Green Forest',
    alignment: 'lawful',
    imageName: 'greenforest.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  darkforest: {
    id: LandType.DARKFOREST,
    name: 'Dark Forest',
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  hills: {
    id: LandType.HILLS,
    name: 'Hills',
    alignment: 'neutral',
    imageName: 'hills.png',
    goldPerTurn: { min: 3, max: 5 },
  },
  swamp: {
    id: LandType.SWAMP,
    name: 'Swamp',
    alignment: 'chaotic',
    imageName: 'swamp.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  desert: {
    id: LandType.DESERT,
    name: 'Desert',
    alignment: 'neutral',
    imageName: 'desert.png',
    goldPerTurn: { min: 0, max: 1 },
  },
  lava: {
    id: LandType.LAVA,
    name: 'Lava Fields',
    alignment: 'chaotic',
    imageName: 'lava.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  volcano: {
    id: LandType.VOLCANO,
    name: 'Volcano',
    alignment: 'chaotic',
    imageName: 'volcano.png',
    goldPerTurn: { min: 0, max: 1 },
  },
};
