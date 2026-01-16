import { LandName } from '../../types/Land';
import type { LandType } from '../../types/Land';

const surroundingLands: Partial<Record<LandType, LandType[]>> = {
  [LandName.SUN_SPIRE_PEAKS]: [LandName.DARK_FOREST, LandName.HILLS],
  [LandName.HEARTWOOD_GROVE]: [LandName.SWAMP, LandName.GREEN_FOREST],
  [LandName.CRISTAL_BASIN]: [LandName.DESERT, LandName.HILLS],
  [LandName.VOLCANO]: [LandName.MOUNTAINS, LandName.DARK_FOREST],
  [LandName.SHADOW_MIRE]: [LandName.PLAINS, LandName.SWAMP],
};
/**
 * Returns the land types that surround a special land type
 * @returns Array of land types that can surround the given special land
 * @param landType
 */
export const getSurroundingLands = (landType: LandType): LandType[] => {
  return surroundingLands[landType] ?? [];
};

const nearbySpecialLands: Partial<Record<LandType, LandType>> = {
  [LandName.SUN_SPIRE_PEAKS]: LandName.GOLDEN_PLAINS,
  [LandName.HEARTWOOD_GROVE]: LandName.VERDANT_GLADE,
  [LandName.CRISTAL_BASIN]: LandName.MISTY_GLADES,
  [LandName.VOLCANO]: LandName.LAVA,
  [LandName.SHADOW_MIRE]: LandName.BLIGHTED_FEN,
};
/**
 * Maps main special lands to their nearby counterpart lands
 * @param landType - The main special land type
 * @returns The corresponding nearby special land type
 */
export const getNearSpecialLandKinds = (landType: LandType): LandType => {
  return nearbySpecialLands[landType] ?? LandName.NONE;
};

/**
 * Returns all special land types
 * @returns Array of special land types
 */
export const getSpecialLandKinds = (): LandType[] => [
  LandName.VOLCANO,
  LandName.LAVA,
  LandName.SUN_SPIRE_PEAKS,
  LandName.GOLDEN_PLAINS,
  LandName.HEARTWOOD_GROVE,
  LandName.VERDANT_GLADE,
  LandName.CRISTAL_BASIN,
  LandName.MISTY_GLADES,
  LandName.SHADOW_MIRE,
  LandName.BLIGHTED_FEN,
];

/**
 * Returns all regular (non-special) land types
 * @returns Array of regular land types
 */
export const getRegularLandKinds = (): LandType[] => [
  LandName.PLAINS,
  LandName.MOUNTAINS,
  LandName.GREEN_FOREST,
  LandName.DARK_FOREST,
  LandName.HILLS,
  LandName.SWAMP,
  LandName.DESERT,
];

/**
 * Returns the main special land types (primary special lands)
 * @returns Array of main special land types
 */
export const getMainSpecialLandKinds = (): LandType[] => [
  LandName.VOLCANO,
  LandName.SUN_SPIRE_PEAKS,
  LandName.HEARTWOOD_GROVE,
  LandName.CRISTAL_BASIN,
  LandName.SHADOW_MIRE,
];
