export type BuildingType =
  | 'wizard-tower'
  | 'barracks'
  | 'castle-wall'
  | 'watch-tower'
  | 'market'
  | 'temple'
  | 'mine';

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  goldCost: number;
  goldPerTurn: number;
  description: string;
}

export const BUILDING_TYPES: { [key: string]: Building } = {
  'wizard-tower': {
    id: 'wizard-tower',
    type: 'wizard-tower',
    name: 'Wizard Tower',
    goldCost: 150,
    goldPerTurn: 5,
    description: 'Provides magical defense and research capabilities',
  },
  barracks: {
    id: 'barracks',
    type: 'barracks',
    name: 'Barracks',
    goldCost: 100,
    goldPerTurn: 0,
    description: 'Allows recruitment of military units',
  },
  'castle-wall': {
    id: 'castle-wall',
    type: 'castle-wall',
    name: 'Castle Wall',
    goldCost: 200,
    goldPerTurn: 0,
    description: 'Provides strong defensive bonuses',
  },
  'watch-tower': {
    id: 'watch-tower',
    type: 'watch-tower',
    name: 'Watch Tower',
    goldCost: 80,
    goldPerTurn: 2,
    description: 'Increases vision range and provides early warning',
  },
  market: {
    id: 'market',
    type: 'market',
    name: 'Market',
    goldCost: 120,
    goldPerTurn: 10,
    description: 'Generates gold through trade',
  },
  temple: {
    id: 'temple',
    type: 'temple',
    name: 'Temple',
    goldCost: 180,
    goldPerTurn: 3,
    description: 'Provides spiritual bonuses and healing',
  },
  mine: {
    id: 'mine',
    type: 'mine',
    name: 'Mine',
    goldCost: 140,
    goldPerTurn: 8,
    description: 'Extracts resources from the land',
  },
};
