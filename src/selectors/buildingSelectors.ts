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
  if (building.slots.every((slot) => slot.isOccupied)) return false;

  const maxSlotsForUnit = Object.values(slotTraits).reduce((acc, unitSet) => {
    return unitSet?.has(unitType) ? acc + 1 : acc;
  }, 0);

  const slotsOccupiedByUnit = building.slots.filter(
    (slot) => slot.isOccupied && slot.unit === unitType
  ).length;

  return slotsOccupiedByUnit < maxSlotsForUnit;
};

/**
 * Get count of available slots
 */
export const getAvailableSlotsCount = (building: BuildingState): number => {
  return building.slots.filter((slot) => !slot.isOccupied).length;
};
/**
 * Get count of occupied slots
 */
export const getOccupiedSlotsCount = (building: BuildingState): number => {
  return building.slots.filter((slot) => slot.isOccupied).length;
};
