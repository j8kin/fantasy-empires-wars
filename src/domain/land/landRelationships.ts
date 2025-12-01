import { LandType } from '../../types/Land';

/**
 * Returns the land types that surround a special land type
 * @param landType - The special land type to get surrounding lands for
 * @returns Array of land types that can surround the given special land
 */
export const getSurroundingLands = (landType: LandType): LandType[] => {
  switch (landType) {
    case LandType.VOLCANO:
      return [LandType.MOUNTAINS, LandType.DARK_FOREST];
    case LandType.SUN_SPIRE_PEAKS:
      return [LandType.DARK_FOREST, LandType.HILLS];
    case LandType.HEARTWOOD_COVE:
      return [LandType.SWAMP, LandType.GREEN_FOREST];
    case LandType.CRISTAL_BASIN:
      return [LandType.DESERT, LandType.HILLS];
    case LandType.SHADOW_MIRE:
      return [LandType.PLAINS, LandType.SWAMP];
    default:
      return [];
  }
};

/**
 * Maps main special lands to their nearby counterpart lands
 * @param id - The main special land type
 * @returns The corresponding nearby special land type
 */
export const getNearSpecialLandTypes = (id: LandType): LandType => {
  switch (id) {
    case LandType.VOLCANO:
      return LandType.LAVA;
    case LandType.SUN_SPIRE_PEAKS:
      return LandType.GOLDEN_PLAINS;
    case LandType.HEARTWOOD_COVE:
      return LandType.VERDANT_GLADE;
    case LandType.CRISTAL_BASIN:
      return LandType.MISTY_GLADES;
    case LandType.SHADOW_MIRE:
      return LandType.BLIGHTED_FEN;
    default:
      return LandType.NONE;
  }
};
