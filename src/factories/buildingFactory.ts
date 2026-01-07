import { v4 as uuid } from 'uuid';
import { BuildingName } from '../types/Building';
import { RegularUnitName } from '../types/UnitType';
import type { BuildingType, RecruitmentSlot } from '../types/Building';
import type { BuildingState } from '../state/map/building/BuildingState';

// Building slot constants
const BARRACKS_SLOTS = 3;
const MAGE_TOWER_SLOTS = 1;

/**
 * Factory function to create a building instance with proper slot initialization
 */
export const buildingFactory = (type: BuildingType): BuildingState => {
  return {
    id: Object.freeze(uuid()),
    type: Object.freeze(type),
    slots: slotsFactory(type),
  };
};

/**
 * Create an empty recruitment slot
 */
const recruitmentSlotFactory = (): RecruitmentSlot => ({
  isOccupied: false,
  unit: RegularUnitName.WARRIOR, // Dummy value, ignored when isOccupied = false
  turnsRemaining: 0, // Dummy value, ignored when isOccupied = false
});

const isMageTower = (building: BuildingType): boolean => building.toString().includes('Mage Tower');

const slotsFactory = (buildingType: BuildingType): RecruitmentSlot[] => {
  if (buildingType === BuildingName.BARRACKS) {
    return Array(BARRACKS_SLOTS)
      .fill(null)
      .map(() => recruitmentSlotFactory());
  }
  if (isMageTower(buildingType)) {
    return Array(MAGE_TOWER_SLOTS)
      .fill(null)
      .map(() => recruitmentSlotFactory());
  }
  return [];
};
