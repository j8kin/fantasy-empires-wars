import { UnitType } from './UnitType';

export enum BuildingType {
  STRONGHOLD = 'Stronghold',
  BARRACKS = 'Barracks',
  WHITE_MAGE_TOWER = 'White Mage Tower',
  BLACK_MAGE_TOWER = 'Black Mage Tower',
  BLUE_MAGE_TOWER = 'Blue Mage Tower',
  GREEN_MAGE_TOWER = 'Green Mage Tower',
  RED_MAGE_TOWER = 'Red Mage Tower',
  WATCH_TOWER = 'Watch Tower',
  OUTPOST = 'Outpost',
  WALL = 'Castle Wall',
  DEMOLITION = 'Building Demolition',
}

interface BuildingSlot {
  unit: UnitType;
  turnsRemaining: number;
}

export interface Building {
  id: BuildingType;
  buildCost: number;
  maintainCost: number;
  description: string;
  numberOfSlots: number;
  slots?: BuildingSlot[];
}
