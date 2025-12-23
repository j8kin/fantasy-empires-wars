import { LandName } from '../../types/Land';
import type { LandType } from '../../types/Land';

/**
 * Returns all special land types
 * @returns Array of special land types
 */
export const getSpecialLandKinds = (): LandType[] => [
  LandName.VOLCANO,
  LandName.LAVA,
  LandName.SUN_SPIRE_PEAKS,
  LandName.GOLDEN_PLAINS,
  LandName.HEARTWOOD_COVE,
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
export const getRegularLandKinds = (): LandType[] => {
  return [
    LandName.PLAINS,
    LandName.MOUNTAINS,
    LandName.GREEN_FOREST,
    LandName.DARK_FOREST,
    LandName.HILLS,
    LandName.SWAMP,
    LandName.DESERT,
  ];
};

/**
 * Returns the main special land types (primary special lands)
 * @returns Array of main special land types
 */
export const getMainSpecialLandKinds = (): LandType[] => {
  return [
    LandName.VOLCANO,
    LandName.SUN_SPIRE_PEAKS,
    LandName.HEARTWOOD_COVE,
    LandName.CRISTAL_BASIN,
    LandName.SHADOW_MIRE,
  ];
};
