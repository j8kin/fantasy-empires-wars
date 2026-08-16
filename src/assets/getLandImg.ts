import { LandName } from '../types/Land';
import type { LandType } from '../types/Land';
import type { LandState } from '../state/map/land/LandState';
import type { ImmutablePair } from '../types/Pair';

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

const landNormalImg: Partial<Record<LandType, ImmutablePair>> = {
  [LandName.PLAINS]: ['land_plains', plainsImg],
  [LandName.HILLS]: ['land_hills', hillsImg],
  [LandName.DESERT]: ['land_desert', desertImg],
  [LandName.MOUNTAINS]: ['land_mountains', mountainsImg],
  [LandName.GREEN_FOREST]: ['land_greenforest', greenForestImg],
  [LandName.SWAMP]: ['land_swamp', swampImg],
  [LandName.DARK_FOREST]: ['land_darkforest', darkForestImg],
  // special lands
  [LandName.VOLCANO]: ['land_volcano', volcanoImg],
  [LandName.LAVA]: ['land_lava', lavaImg],
  [LandName.SUN_SPIRE_PEAKS]: ['land_sunspire-peaks', sunSpirePeaksImg],
  [LandName.GOLDEN_PLAINS]: ['land_golden-plains', goldenPlainsImg],
  [LandName.CRISTAL_BASIN]: ['land_crystal-basin', crystalBasinImg],
  [LandName.MISTY_GLADES]: ['land_misty-glades', mistyGladesImg],
  [LandName.SHADOW_MIRE]: ['land_shadow-mire', shadowMireImg],
  [LandName.BLIGHTED_FEN]: ['land_blighted-fen', blightedFenImg],
  [LandName.HEARTWOOD_GROVE]: ['land_heartwood-grove', heartwoodGroveImg],
  [LandName.VERDANT_GLADE]: ['land_verdant-glade', verdantGladeImg],
};
const landCorruptedImg: Partial<Record<LandType, ImmutablePair>> = {
  [LandName.PLAINS]: ['land_plains-corrupted', plainsCorruptedImg],
  [LandName.HILLS]: ['land_hills-corrupted', hillsCorruptedImg],
  [LandName.MOUNTAINS]: ['land_mountains-corrupted', mountainsCorruptedImg],
  [LandName.GREEN_FOREST]: ['land_green-forest-corrupted', greenForestCorruptedImg],
};

export const getLandImg = (land: LandState): ImmutablePair => {
  return land.corrupted ? landCorruptedImg[land.type]! : landNormalImg[land.type]!;
};

export const getAllLandImages = (): ImmutablePair[] => [
  ...Object.values(landNormalImg),
  ...Object.values(landCorruptedImg),
];
