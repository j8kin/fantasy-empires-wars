import { LAND_TYPE } from '../types/Land';

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

export const getLandImg = (landType: LAND_TYPE): string | undefined => {
  switch (landType) {
    case LAND_TYPE.PLAINS:
      return plainsImg;
    case LAND_TYPE.HILLS:
      return hillsImg;
    case LAND_TYPE.MOUNTAINS:
      return mountainsImg;
    case LAND_TYPE.SWAMP:
      return swampImg;
    case LAND_TYPE.DESERT:
      return desertImg;
    case LAND_TYPE.GREEN_FOREST:
      return greenForestImg;
    case LAND_TYPE.DARK_FOREST:
      return darkForestImg;
    // special lands
    case LAND_TYPE.VOLCANO:
      return volcanoImg;
    case LAND_TYPE.LAVA:
      return lavaImg;
    case LAND_TYPE.SUN_SPIRE_PEAKS:
      return sunSpirePeaks;
    case LAND_TYPE.GOLDEN_PLAINS:
      return goldenPlains;
    case LAND_TYPE.CRISTAL_BASIN:
      return crystalBasinImg;
    case LAND_TYPE.MISTY_GLADES:
      return mistyGladesImg;
    case LAND_TYPE.SHADOW_MIRE:
      return shadowMireImg;
    case LAND_TYPE.BLIGHTED_FEN:
      return blightedFenImg;
    case LAND_TYPE.HEARTWOOD_COVE:
      return heartwoodGroveImg;
    case LAND_TYPE.VERDANT_GLADE:
      return verdantGladeImg;
    default:
      return undefined;
  }
};
