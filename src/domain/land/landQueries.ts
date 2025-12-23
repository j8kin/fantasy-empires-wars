import { LandKind } from '../../types/Land';
import type { LandType } from '../../types/Land';

/**
 * Returns all special land types
 * @returns Array of special land types
 */
export const getSpecialLandKinds = (): LandType[] => [
  LandKind.VOLCANO,
  LandKind.LAVA,
  LandKind.SUN_SPIRE_PEAKS,
  LandKind.GOLDEN_PLAINS,
  LandKind.HEARTWOOD_COVE,
  LandKind.VERDANT_GLADE,
  LandKind.CRISTAL_BASIN,
  LandKind.MISTY_GLADES,
  LandKind.SHADOW_MIRE,
  LandKind.BLIGHTED_FEN,
];

/**
 * Returns all regular (non-special) land types
 * @returns Array of regular land types
 */
export const getRegularLandKinds = (): LandType[] => {
  return [
    LandKind.PLAINS,
    LandKind.MOUNTAINS,
    LandKind.GREEN_FOREST,
    LandKind.DARK_FOREST,
    LandKind.HILLS,
    LandKind.SWAMP,
    LandKind.DESERT,
  ];
};

/**
 * Returns the main special land types (primary special lands)
 * @returns Array of main special land types
 */
export const getMainSpecialLandKinds = (): LandType[] => {
  return [
    LandKind.VOLCANO,
    LandKind.SUN_SPIRE_PEAKS,
    LandKind.HEARTWOOD_COVE,
    LandKind.CRISTAL_BASIN,
    LandKind.SHADOW_MIRE,
  ];
};
