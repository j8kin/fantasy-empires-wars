import { LandName } from '../types/Land';
import type { LandType } from '../types/Land';
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
import sunSpirePeaksImg from './lands/sunspire-peaks.png';
import goldenPlainsImg from './lands/golden-plains.png';
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

const landNormalImg: Partial<Record<LandType, string>> = {
  [LandName.PLAINS]: plainsImg,
  [LandName.HILLS]: hillsImg,
  [LandName.DESERT]: desertImg,
  [LandName.MOUNTAINS]: mountainsImg,
  [LandName.GREEN_FOREST]: greenForestImg,
  [LandName.SWAMP]: swampImg,
  [LandName.DARK_FOREST]: darkForestImg,
  // special lands
  [LandName.VOLCANO]: volcanoImg,
  [LandName.LAVA]: lavaImg,
  [LandName.SUN_SPIRE_PEAKS]: sunSpirePeaksImg,
  [LandName.GOLDEN_PLAINS]: goldenPlainsImg,
  [LandName.CRISTAL_BASIN]: crystalBasinImg,
  [LandName.MISTY_GLADES]: mistyGladesImg,
  [LandName.SHADOW_MIRE]: shadowMireImg,
  [LandName.BLIGHTED_FEN]: blightedFenImg,
  [LandName.HEARTWOOD_GROVE]: heartwoodGroveImg,
  [LandName.VERDANT_GLADE]: verdantGladeImg,
};
const landCorruptedImg: Partial<Record<LandType, string>> = {
  [LandName.PLAINS]: plainsCorruptedImg,
  [LandName.HILLS]: hillsCorruptedImg,
  [LandName.MOUNTAINS]: mountainsCorruptedImg,
  [LandName.GREEN_FOREST]: greenForestCorruptedImg,
};

export const getLandImg = (land: LandState): string | undefined => {
  return land.corrupted ? landCorruptedImg[land.land.id] : landNormalImg[land.land.id];
};
