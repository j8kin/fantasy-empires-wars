export type AlignmentType = 'lawful' | 'neutral' | 'chaotic';

export interface LandType {
  id: string;
  name: string;
  alignment: AlignmentType;
  imageName: string;
  relatedLands: string[];
}

export const LAND_TYPES: { [key: string]: LandType } = {
  plains: {
    id: 'plains',
    name: 'Plains',
    alignment: 'neutral',
    imageName: 'plains.png',
    relatedLands: ['hills', 'greenforest', 'swamp'],
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    alignment: 'lawful',
    imageName: 'mountains.png',
    relatedLands: ['hills', 'volcano'],
  },
  greenforest: {
    id: 'greenforest',
    name: 'Green Forest',
    alignment: 'neutral',
    imageName: 'greenforest.png',
    relatedLands: ['plains', 'darkforest'],
  },
  darkforest: {
    id: 'darkforest',
    name: 'Dark Forest',
    alignment: 'chaotic',
    imageName: 'darkforest.png',
    relatedLands: ['greenforest', 'lava'],
  },
  hills: {
    id: 'hills',
    name: 'Hills',
    alignment: 'lawful',
    imageName: 'hills.png',
    relatedLands: ['plains', 'mountains', 'swamp'],
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    alignment: 'chaotic',
    imageName: 'swamp.png',
    relatedLands: ['plains', 'hills'],
  },
  lava: {
    id: 'lava',
    name: 'Lava Fields',
    alignment: 'chaotic',
    imageName: 'lava.png',
    relatedLands: ['volcano', 'darkforest'],
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    alignment: 'chaotic',
    imageName: 'volcano.png',
    relatedLands: ['lava', 'mountains'],
  },
};
