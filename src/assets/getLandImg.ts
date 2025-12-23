import { LandName } from '../types/Land';
import type { LandState } from '../state/map/land/LandState';

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

// corrupted lands
import hillsCorruptedImg from './lands/hills-corrupted.png';
import mountainsCorruptedImg from './lands/mountains-corrupted.png';
import plainsCorruptedImg from './lands/plains-corrupted.png';
import greenForestCorruptedImg from './lands/green-forest-corrupted.png';

export const getLandImg = (land: LandState): string | undefined => {
  switch (land.land.id) {
    case LandName.PLAINS:
      return land.corrupted ? plainsCorruptedImg : plainsImg;
    case LandName.HILLS:
      return land.corrupted ? hillsCorruptedImg : hillsImg;
    case LandName.MOUNTAINS:
      return land.corrupted ? mountainsCorruptedImg : mountainsImg;
    case LandName.GREEN_FOREST:
      return land.corrupted ? greenForestCorruptedImg : greenForestImg;
    case LandName.DESERT:
      return desertImg;
    case LandName.SWAMP:
      return swampImg;
    case LandName.DARK_FOREST:
      return darkForestImg;
    // special lands
    case LandName.VOLCANO:
      return volcanoImg;
    case LandName.LAVA:
      return lavaImg;
    case LandName.SUN_SPIRE_PEAKS:
      return sunSpirePeaks;
    case LandName.GOLDEN_PLAINS:
      return goldenPlains;
    case LandName.CRISTAL_BASIN:
      return crystalBasinImg;
    case LandName.MISTY_GLADES:
      return mistyGladesImg;
    case LandName.SHADOW_MIRE:
      return shadowMireImg;
    case LandName.BLIGHTED_FEN:
      return blightedFenImg;
    case LandName.HEARTWOOD_COVE:
      return heartwoodGroveImg;
    case LandName.VERDANT_GLADE:
      return verdantGladeImg;
    default:
      return undefined;
  }
};
