export type UnitType = 'warrior' | 'archer' | 'knight' | 'mage' | 'scout' | 'catapult';

export interface Unit {
  id: string;
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  health: number;
  goldCost: number;
  movement: number;
}

export interface ArmyUnit {
  unit: Unit;
  count: number;
}

export interface Army {
  units: ArmyUnit[];
  totalCount: number;
}

export const UNIT_TYPES: { [key: string]: Unit } = {
  warrior: {
    id: 'warrior',
    type: 'warrior',
    name: 'Warrior',
    attack: 8,
    defense: 6,
    health: 25,
    goldCost: 40,
    movement: 2,
  },
  archer: {
    id: 'archer',
    type: 'archer',
    name: 'Archer',
    attack: 10,
    defense: 4,
    health: 20,
    goldCost: 50,
    movement: 3,
  },
  knight: {
    id: 'knight',
    type: 'knight',
    name: 'Knight',
    attack: 12,
    defense: 10,
    health: 40,
    goldCost: 120,
    movement: 3,
  },
  mage: {
    id: 'mage',
    type: 'mage',
    name: 'Mage',
    attack: 15,
    defense: 3,
    health: 18,
    goldCost: 100,
    movement: 2,
  },
  scout: {
    id: 'scout',
    type: 'scout',
    name: 'Scout',
    attack: 4,
    defense: 3,
    health: 15,
    goldCost: 25,
    movement: 5,
  },
  catapult: {
    id: 'catapult',
    type: 'catapult',
    name: 'Catapult',
    attack: 20,
    defense: 2,
    health: 30,
    goldCost: 200,
    movement: 1,
  },
};
