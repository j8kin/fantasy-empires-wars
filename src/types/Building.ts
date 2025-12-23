import type { UnitType } from './UnitType';

export const BuildingName = {
  STRONGHOLD: 'Stronghold',
  BARRACKS: 'Barracks',
  WHITE_MAGE_TOWER: 'White Mage Tower',
  BLACK_MAGE_TOWER: 'Black Mage Tower',
  BLUE_MAGE_TOWER: 'Blue Mage Tower',
  GREEN_MAGE_TOWER: 'Green Mage Tower',
  RED_MAGE_TOWER: 'Red Mage Tower',
  WATCH_TOWER: 'Watch Tower',
  OUTPOST: 'Outpost',
  WALL: 'Castle Wall',
  DEMOLITION: 'Building Demolition',
} as const;

export type BuildingType = (typeof BuildingName)[keyof typeof BuildingName];

export interface RecruitmentSlot {
  isOccupied: boolean;
  unit: UnitType;
  turnsRemaining: number;
}
