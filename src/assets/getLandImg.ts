import { LandType } from '../types/Land';

import darkForestImg from './lands/darkforest.png';
import greenForestImg from './lands/greenforest.png';
import hillsImg from './lands/hills.png';
import mountainsImg from './lands/mountains.png';
import plainsImg from './lands/plains.png';
import swampImg from './lands/swamp.png';
import desertImg from './lands/desert.png';
import lavaImg from './lands/lava.png';
import volcanoImg from './lands/volcano.png';
import sunSpirePeaks from './lands/sunspire-peaks.png';
import goldenPlains from './lands/golden-plains.png';
import crystalBasinImg from './lands/crystal-basin.png';
import mistyGladesImg from './lands/misty-glades.png';
import shadowMireImg from './lands/shadow-mire.png';
import blightedFenImg from './lands/blighted-fen.png';
import heartwoodGroveImg from './lands/heartwood-grove.png';
import verdantGladeImg from './lands/verdant-glade.png';

export const getLandImg = (landType: LandType): string | undefined => {
  switch (landType) {
    case LandType.PLAINS:
      return plainsImg;
    case LandType.HILLS:
      return hillsImg;
    case LandType.MOUNTAINS:
      return mountainsImg;
    case LandType.SWAMP:
      return swampImg;
    case LandType.DESERT:
      return desertImg;
    case LandType.GREEN_FOREST:
      return greenForestImg;
    case LandType.DARK_FOREST:
      return darkForestImg;
    // special lands
    case LandType.VOLCANO:
      return volcanoImg;
    case LandType.LAVA:
      return lavaImg;
    case LandType.SUN_SPIRE_PEAKS:
      return sunSpirePeaks;
    case LandType.GOLDEN_PLAINS:
      return goldenPlains;
    case LandType.CRISTAL_BASIN:
      return crystalBasinImg;
    case LandType.MISTY_GLADES:
      return mistyGladesImg;
    case LandType.SHADOW_MIRE:
      return shadowMireImg;
    case LandType.BLIGHTED_FEN:
      return blightedFenImg;
    case LandType.HEARTWOOD_COVE:
      return heartwoodGroveImg;
    case LandType.VERDANT_GLADE:
      return verdantGladeImg;
    default:
      return undefined;
  }
};
