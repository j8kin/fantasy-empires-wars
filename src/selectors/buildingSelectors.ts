import { BuildingState } from '../state/map/building/BuildingState';
import { UnitType } from '../types/UnitType';

/**
 * Check if a building has any available (unoccupied) recruitment slots
 */
export const hasAvailableSlotForUnit = (
  building: BuildingState,
  unitType: UnitType,
  slotTraits: Record<number, Set<UnitType>>
): boolean => {
  return building.slots.some((slot, index) => !slot.isOccupied && slotTraits[index]?.has(unitType));
};

/**
 * Get count of available slots
 */
export const getAvailableSlotsCount = (building?: BuildingState): number => {
  return building?.slots.filter((slot) => !slot.isOccupied).length ?? 0;
};
/**
 * Get count of occupied slots
 */
export const getOccupiedSlotsCount = (building: BuildingState): number => {
  return building.slots.filter((slot) => slot.isOccupied).length;
};
