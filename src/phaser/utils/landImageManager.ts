import type { LandType } from '../../types/Land';
import { LandName } from '../../types/Land';
// Import all land assets for Vite bundling
import plainsPng from '../../assets/lands/plains.png';
import hillsPng from '../../assets/lands/hills.png';
import desertPng from '../../assets/lands/desert.png';
import mountainsPng from '../../assets/lands/mountains.png';
import greenforestPng from '../../assets/lands/greenforest.png';
import swampPng from '../../assets/lands/swamp.png';
import darkforestPng from '../../assets/lands/darkforest.png';
import volcanoPng from '../../assets/lands/volcano.png';
import lavaPng from '../../assets/lands/lava.png';
import sunspirePeaksPng from '../../assets/lands/sunspire-peaks.png';
import goldenPlainsPng from '../../assets/lands/golden-plains.png';
import crystalBasinPng from '../../assets/lands/crystal-basin.png';
import mistyGladesPng from '../../assets/lands/misty-glades.png';
import shadowMirePng from '../../assets/lands/shadow-mire.png';
import blightedFenPng from '../../assets/lands/blighted-fen.png';
import heartwoodGrovePng from '../../assets/lands/heartwood-grove.png';
import verdantGladePng from '../../assets/lands/verdant-glade.png';
import plainsCorruptedPng from '../../assets/lands/plains-corrupted.png';
import hillsCorruptedPng from '../../assets/lands/hills-corrupted.png';
import mountainsCorruptedPng from '../../assets/lands/mountains-corrupted.png';
import greenForestCorruptedPng from '../../assets/lands/green-forest-corrupted.png';

/**
 * Maps land types and corruption status to Phaser texture asset keys.
 * This allows easy lookup of which texture to render for each land tile.
 */

const landNormalAssetKeys: Record<LandType, string> = {
  [LandName.PLAINS]: 'land_plains',
  [LandName.HILLS]: 'land_hills',
  [LandName.DESERT]: 'land_desert',
  [LandName.MOUNTAINS]: 'land_mountains',
  [LandName.GREEN_FOREST]: 'land_greenforest',
  [LandName.SWAMP]: 'land_swamp',
  [LandName.DARK_FOREST]: 'land_darkforest',
  [LandName.VOLCANO]: 'land_volcano',
  [LandName.LAVA]: 'land_lava',
  [LandName.SUN_SPIRE_PEAKS]: 'land_sunspire-peaks',
  [LandName.GOLDEN_PLAINS]: 'land_golden-plains',
  [LandName.CRISTAL_BASIN]: 'land_crystal-basin',
  [LandName.MISTY_GLADES]: 'land_misty-glades',
  [LandName.SHADOW_MIRE]: 'land_shadow-mire',
  [LandName.BLIGHTED_FEN]: 'land_blighted-fen',
  [LandName.HEARTWOOD_GROVE]: 'land_heartwood-grove',
  [LandName.VERDANT_GLADE]: 'land_verdant-glade',
  [LandName.NONE]: 'land_none',
};

const landCorruptedAssetKeys: Partial<Record<LandType, string>> = {
  [LandName.PLAINS]: 'land_plains-corrupted',
  [LandName.HILLS]: 'land_hills-corrupted',
  [LandName.MOUNTAINS]: 'land_mountains-corrupted',
  [LandName.GREEN_FOREST]: 'land_green-forest-corrupted',
};

/**
 * Get the Phaser texture asset key for a land type and corruption status.
 * Returns the appropriate texture key to use when rendering a land tile.
 */
export function getLandAssetKey(landType: LandType, corrupted: boolean): string {
  if (corrupted) {
    // Use corrupted variant if available, otherwise fall back to normal
    return landCorruptedAssetKeys[landType] || landNormalAssetKeys[landType];
  }
  return landNormalAssetKeys[landType];
}

/**
 * Get all asset keys for preloading.
 * Returns a set of unique asset keys to load in preload().
 */
export function getAllLandAssetKeys(): string[] {
  const allKeys = new Set([...Object.values(landNormalAssetKeys), ...Object.values(landCorruptedAssetKeys)]);
  return Array.from(allKeys);
}

/**
 * Get the file paths for all land image assets for preloading.
 * Returns an array of [key, filePath] tuples for use in Phaser.load.image().
 * Uses dynamic imports so Vite can properly resolve and bundle the assets.
 */
export function getLandAssetPaths(): Array<[string, string]> {
  return [
    // Normal land types
    ['land_plains', plainsPng],
    ['land_hills', hillsPng],
    ['land_desert', desertPng],
    ['land_mountains', mountainsPng],
    ['land_greenforest', greenforestPng],
    ['land_swamp', swampPng],
    ['land_darkforest', darkforestPng],
    ['land_volcano', volcanoPng],
    ['land_lava', lavaPng],
    ['land_sunspire-peaks', sunspirePeaksPng],
    ['land_golden-plains', goldenPlainsPng],
    ['land_crystal-basin', crystalBasinPng],
    ['land_misty-glades', mistyGladesPng],
    ['land_shadow-mire', shadowMirePng],
    ['land_blighted-fen', blightedFenPng],
    ['land_heartwood-grove', heartwoodGrovePng],
    ['land_verdant-glade', verdantGladePng],
    // Corrupted land types
    ['land_plains-corrupted', plainsCorruptedPng],
    ['land_hills-corrupted', hillsCorruptedPng],
    ['land_mountains-corrupted', mountainsCorruptedPng],
    ['land_green-forest-corrupted', greenForestCorruptedPng],
  ];
}
