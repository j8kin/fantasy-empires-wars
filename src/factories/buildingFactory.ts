import { isMageTower } from '../domain/building/buildingRepository';

import { BuildingType } from '../types/Building';
import { RegularUnitType } from '../types/UnitType';
import type { BuildingState } from '../state/map/building/BuildingState';
import type { RecruitmentSlot } from '../types/Building';

// Building slot constants
const BARRACKS_SLOTS = 3;
const MAGE_TOWER_SLOTS = 1;

/**
 * Create an empty recruitment slot
 */
const recruitmentSlotFactory = (): RecruitmentSlot => ({
  isOccupied: false,
  unit: RegularUnitType.WARRIOR, // Dummy value, ignored when isOccupied = false
  turnsRemaining: 0, // Dummy value, ignored when isOccupied = false
});

/**
 * Factory function to create a building instance with proper slot initialization
 */
export const buildingFactory = (type: BuildingType): BuildingState => {
  const building: BuildingState = {
    type: type,
    slots: [],
  };

  if (type === BuildingType.BARRACKS) {
    building.slots = Array(BARRACKS_SLOTS)
      .fill(null)
      .map(() => recruitmentSlotFactory());
  } else if (isMageTower(type)) {
    building.slots = Array(MAGE_TOWER_SLOTS)
      .fill(null)
      .map(() => recruitmentSlotFactory());
  }
  // Other buildings get empty slots array

  return building;
};
