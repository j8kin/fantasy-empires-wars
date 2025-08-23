export type BuildingType =
  | 'mage-tower'
  | 'barracks'
  | 'castle-wall'
  | 'watch-tower'
  | 'stronghold';

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  goldCost: number;
  goldPerTurn: number;
  description: string;
}

export const BUILDING_TYPES: { [key: string]: Building } = {
  'mage-tower': {
    id: 'mage-tower',
    type: 'mage-tower',
    name: 'Mage Tower',
    goldCost: 150,
    goldPerTurn: 5,
    description: 'Allows recruitment of Mage units',
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
  stronghold: {
    id: 'stronghold',
    type: 'stronghold',
    name: 'Stronghold',
    goldCost: 140,
    goldPerTurn: 0, 
    description: 'Protect army and produce gold',
  },
};
