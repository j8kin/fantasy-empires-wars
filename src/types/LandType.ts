export type AlignmentType = 'lawful' | 'neutral' | 'chaotic';

export interface LandType {
  id: string;
  name: string;
  alignment: AlignmentType;
  imageName: string;
  goldPerTurn: { min: number; max: number };
}

export const LAND_TYPES: { [key: string]: LandType } = {
  // none is used only for map generation
  none: {
    id: 'none',
    name: 'none',
    alignment: 'neutral',
    imageName: 'none.png',
    goldPerTurn: { min: 0, max: 0 },
  },
  plains: {
    id: 'plains',
    name: 'Plains',
    alignment: 'neutral',
    imageName: 'plains.png',
    goldPerTurn: { min: 2, max: 4 },
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    alignment: 'lawful',
    imageName: 'mountains.png',
    goldPerTurn: { min: 4, max: 6 },
  },
  greenforest: {
    id: 'greenforest',
    name: 'Green Forest',
    alignment: 'lawful',
    imageName: 'greenforest.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  darkforest: {
    id: 'darkforest',
    name: 'Dark Forest',
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  hills: {
    id: 'hills',
    name: 'Hills',
    alignment: 'neutral',
    imageName: 'hills.png',
    goldPerTurn: { min: 3, max: 5 },
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    alignment: 'chaotic',
    imageName: 'swamp.png',
    goldPerTurn: { min: 0, max: 2 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    alignment: 'neutral',
    imageName: 'desert.png',
    goldPerTurn: { min: 0, max: 1 },
  },
  lava: {
    id: 'lava',
    name: 'Lava Fields',
    alignment: 'chaotic',
    imageName: 'lava.png',
    goldPerTurn: { min: 1, max: 3 },
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    alignment: 'chaotic',
    imageName: 'volcano.png',
    goldPerTurn: { min: 0, max: 1 },
  },
};
