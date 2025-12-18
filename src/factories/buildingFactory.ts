import { BuildingType } from '../types/Building';
import { RegularUnitType } from '../types/UnitType';
import type { Building, RecruitmentSlot } from '../types/Building';

// Building slot constants
const BARRACKS_SLOTS = 3;
const MAGE_TOWER_SLOTS = 1;

/**
 * Create an empty recruitment slot
 */
const createEmptySlot = (): RecruitmentSlot => ({
  isOccupied: false,
  unit: RegularUnitType.WARRIOR, // Dummy value, ignored when isOccupied = false
  turnsRemaining: 0, // Dummy value, ignored when isOccupied = false
});

/**
 * Factory function to create a building instance with proper slot initialization
 */
export const buildingFactory = (type: BuildingType): Building => {
  const building: Building = {
    id: type,
    slots: [],
  };

  if (type === BuildingType.BARRACKS) {
    building.slots = Array(BARRACKS_SLOTS)
      .fill(null)
      .map(() => createEmptySlot());
  } else if (
    type === BuildingType.WHITE_MAGE_TOWER ||
    type === BuildingType.BLACK_MAGE_TOWER ||
    type === BuildingType.BLUE_MAGE_TOWER ||
    type === BuildingType.GREEN_MAGE_TOWER ||
    type === BuildingType.RED_MAGE_TOWER
  ) {
    building.slots = Array(MAGE_TOWER_SLOTS)
      .fill(null)
      .map(() => createEmptySlot());
  }
  // Other buildings get empty slots array

  return building;
};

/**
 * Check if a building has any available (unoccupied) recruitment slots
 */
export const hasAvailableSlot = (building: Building): boolean => {
  return building.slots.some((slot) => !slot.isOccupied);
};

/**
 * Find the index of the first available slot, or -1 if none available
 */
export const findAvailableSlotIndex = (building: Building): number => {
  return building.slots.findIndex((slot) => !slot.isOccupied);
};

/**
 * Get count of available slots
 */
export const getAvailableSlotsCount = (building: Building): number => {
  return building.slots.filter((slot) => !slot.isOccupied).length;
};

/**
 * Get count of occupied slots
 */
export const getOccupiedSlotsCount = (building: Building): number => {
  return building.slots.filter((slot) => slot.isOccupied).length;
};
