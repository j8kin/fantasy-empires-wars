import { LandKind } from '../../types/Land';
import type { LandType } from '../../types/Land';

/**
 * Returns the land types that surround a special land type
 * @returns Array of land types that can surround the given special land
 * @param landKind
 */
export const getSurroundingLands = (landKind: LandType): LandType[] => {
  switch (landKind) {
    case LandKind.VOLCANO:
      return [LandKind.MOUNTAINS, LandKind.DARK_FOREST];
    case LandKind.SUN_SPIRE_PEAKS:
      return [LandKind.DARK_FOREST, LandKind.HILLS];
    case LandKind.HEARTWOOD_COVE:
      return [LandKind.SWAMP, LandKind.GREEN_FOREST];
    case LandKind.CRISTAL_BASIN:
      return [LandKind.DESERT, LandKind.HILLS];
    case LandKind.SHADOW_MIRE:
      return [LandKind.PLAINS, LandKind.SWAMP];
    default:
      return [];
  }
};

/**
 * Maps main special lands to their nearby counterpart lands
 * @param id - The main special land type
 * @returns The corresponding nearby special land type
 */
export const getNearSpecialLandKinds = (id: LandType): LandType => {
  switch (id) {
    case LandKind.VOLCANO:
      return LandKind.LAVA;
    case LandKind.SUN_SPIRE_PEAKS:
      return LandKind.GOLDEN_PLAINS;
    case LandKind.HEARTWOOD_COVE:
      return LandKind.VERDANT_GLADE;
    case LandKind.CRISTAL_BASIN:
      return LandKind.MISTY_GLADES;
    case LandKind.SHADOW_MIRE:
      return LandKind.BLIGHTED_FEN;
    default:
      return LandKind.NONE;
  }
};
