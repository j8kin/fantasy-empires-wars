export type AlignmentType = 'lawful' | 'neutral' | 'chaotic';

export interface LandType {
  id: string;
  name: string;
  alignment: AlignmentType;
  imageName: string;
  relatedLands: string[];
  goldPerTurn: { min: number; max: number };
}

export const LAND_TYPES: { [key: string]: LandType } = {
  plains: {
    id: 'plains',
    name: 'Plains',
    alignment: 'neutral',
    imageName: 'plains.png',
    relatedLands: ['hills', 'greenforest', 'swamp', 'desert'],
    goldPerTurn: { min: 2, max: 4 },
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    alignment: 'lawful',
    imageName: 'mountains.png',
    relatedLands: ['hills', 'volcano'],
    goldPerTurn: { min: 4, max: 6 },
  },
  greenforest: {
    id: 'greenforest',
    name: 'Green Forest',
    alignment: 'neutral',
    imageName: 'greenforest.png',
    relatedLands: ['plains', 'darkforest', 'desert'],
    goldPerTurn: { min: 1, max: 3 },
  },
  darkforest: {
    id: 'darkforest',
    name: 'Dark Forest',
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    relatedLands: ['greenforest', 'lava', 'desert'],
    goldPerTurn: { min: 0, max: 2 },
  },
  hills: {
    id: 'hills',
    name: 'Hills',
    alignment: 'lawful',
    imageName: 'hills.png',
    relatedLands: ['plains', 'mountains', 'swamp', 'desert'],
    goldPerTurn: { min: 3, max: 5 },
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    alignment: 'chaotic',
    imageName: 'swamp.png',
    relatedLands: ['plains', 'hills'],
    goldPerTurn: { min: 0, max: 2 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    alignment: 'neutral',
    imageName: 'desert.png',
    relatedLands: ['plains', 'hills', 'greenforest', 'darkforest'],
    goldPerTurn: { min: 0, max: 1 },
  },
  lava: {
    id: 'lava',
    name: 'Lava Fields',
    alignment: 'chaotic',
    imageName: 'lava.png',
    relatedLands: ['volcano', 'darkforest'],
    goldPerTurn: { min: 1, max: 3 },
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    alignment: 'chaotic',
    imageName: 'volcano.png',
    relatedLands: ['lava', 'mountains'],
    goldPerTurn: { min: 0, max: 1 },
  },
};
