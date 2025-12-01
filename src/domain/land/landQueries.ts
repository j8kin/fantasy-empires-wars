import { LandType } from '../../types/Land';

/**
 * Returns all special land types
 * @returns Array of special land types
 */
export const getSpecialLandTypes = (): LandType[] => [
  LandType.VOLCANO,
  LandType.LAVA,
  LandType.SUN_SPIRE_PEAKS,
  LandType.GOLDEN_PLAINS,
  LandType.HEARTWOOD_COVE,
  LandType.VERDANT_GLADE,
  LandType.CRISTAL_BASIN,
  LandType.MISTY_GLADES,
  LandType.SHADOW_MIRE,
  LandType.BLIGHTED_FEN,
];

/**
 * Returns all regular (non-special) land types
 * @returns Array of regular land types
 */
export const getRegularLandTypes = (): LandType[] => {
  return [
    LandType.PLAINS,
    LandType.MOUNTAINS,
    LandType.GREEN_FOREST,
    LandType.DARK_FOREST,
    LandType.HILLS,
    LandType.SWAMP,
    LandType.DESERT,
  ];
};

/**
 * Returns the main special land types (primary special lands)
 * @returns Array of main special land types
 */
export const getMainSpecialLandTypes = (): LandType[] => {
  return [
    LandType.VOLCANO,
    LandType.SUN_SPIRE_PEAKS,
    LandType.HEARTWOOD_COVE,
    LandType.CRISTAL_BASIN,
    LandType.SHADOW_MIRE,
  ];
};
