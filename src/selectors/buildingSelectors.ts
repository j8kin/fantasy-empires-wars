import { BuildingState } from '../state/map/building/BuildingState';

/**
 * Check if a building has any available (unoccupied) recruitment slots
 */
export const hasAvailableSlot = (building: BuildingState): boolean => {
  return building.slots.some((slot) => !slot.isOccupied);
};
/**
 * Find the index of the first available slot, or -1 if none available
 */
export const findAvailableSlotIndex = (building: BuildingState): number => {
  return building.slots.findIndex((slot) => !slot.isOccupied);
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
