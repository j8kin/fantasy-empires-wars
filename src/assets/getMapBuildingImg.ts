import { BuildingName } from '../types/Building';
import type { BuildingType } from '../types/Building';
import { HeroUnitName } from '../types/UnitType';
import type { HeroUnitType } from '../types/UnitType';

import strongholdImg from './buildings/map/stronghold.png';
import barracksImg from './buildings/map/barracks.png';
import watchTowerImg from './buildings/map/watch-tower.png';
import outpostImg from './buildings/map/outpost.png';

// Mage tower — one image per mage-color combination
import mageTowerAllImg         from './buildings/map/magic-tower/mage-tower-all.png';
import mageTowerWhiteImg       from './buildings/map/magic-tower/magic-tower-white.png';
import mageTowerGreenImg       from './buildings/map/magic-tower/mage-tower-green.png';
import mageTowerBlueImg        from './buildings/map/magic-tower/magic-tower-blue.png';
import mageTowerRedImg         from './buildings/map/magic-tower/magic-tower-red.png';
import mageTowerBlackImg       from './buildings/map/magic-tower/mage-tower-black.png';
import mageTowerWhiteGreenBlueImg from './buildings/map/magic-tower/magic-tower-white-green-blue.png';
import mageTowerGreenBlueRedImg   from './buildings/map/magic-tower/mage-tower-green-blue-red.png';
import mageTowerBlueRedBlackImg   from './buildings/map/magic-tower/magic-tower-blue-red-black.png';

/** Phaser texture key prefix for map-scale building sprites */
const KEY_PREFIX = 'map-building-';

/**
 * Returns [textureKey, imagePath] for a building type that has a map-scale sprite,
 * or undefined for building types without a dedicated map image (Castle Wall, Demolition,
 * Mage Tower — the last is handled via getMageTowerImg below).
 */
const MAP_BUILDING_ASSETS: Partial<Record<BuildingType, [string, string]>> = {
  [BuildingName.STRONGHOLD]:  [`${KEY_PREFIX}stronghold`,  strongholdImg],
  [BuildingName.BARRACKS]:    [`${KEY_PREFIX}barracks`,    barracksImg],
  [BuildingName.WATCH_TOWER]: [`${KEY_PREFIX}watch-tower`, watchTowerImg],
  [BuildingName.OUTPOST]:     [`${KEY_PREFIX}outpost`,     outpostImg],
  // Mage Tower: handled by getMageTowerImg — not included here.
  // Castle Wall: rendered via wall segments — no dedicated tile sprite.
  // Demolition:  transient action marker — no map sprite.
};

// ─────────────────────────────────────────────────────────────────────────────
// Mage Tower variants
//
// Key = mage hero types sorted alphabetically and joined with '|'.
// Covers every combination that can occur from getLandUnitsToRecruit().
// ─────────────────────────────────────────────────────────────────────────────

const MAGE_TOWER_VARIANTS: Record<string, [string, string]> = {
  // Single-color towers
  [HeroUnitName.CLERIC]:                                         [`${KEY_PREFIX}mage-tower-white`,           mageTowerWhiteImg],
  [HeroUnitName.DRUID]:                                          [`${KEY_PREFIX}mage-tower-green`,           mageTowerGreenImg],
  [HeroUnitName.ENCHANTER]:                                      [`${KEY_PREFIX}mage-tower-blue`,            mageTowerBlueImg],
  [HeroUnitName.PYROMANCER]:                                     [`${KEY_PREFIX}mage-tower-red`,             mageTowerRedImg],
  [HeroUnitName.NECROMANCER]:                                    [`${KEY_PREFIX}mage-tower-black`,           mageTowerBlackImg],
  // Three-color towers (keys must be sorted: Cleric < Druid < Enchanter < Necromancer < Pyromancer)
  [`${HeroUnitName.CLERIC}|${HeroUnitName.DRUID}|${HeroUnitName.ENCHANTER}`]:                [`${KEY_PREFIX}mage-tower-white-green-blue`, mageTowerWhiteGreenBlueImg],
  [`${HeroUnitName.DRUID}|${HeroUnitName.ENCHANTER}|${HeroUnitName.PYROMANCER}`]:            [`${KEY_PREFIX}mage-tower-green-blue-red`,   mageTowerGreenBlueRedImg],
  [`${HeroUnitName.ENCHANTER}|${HeroUnitName.NECROMANCER}|${HeroUnitName.PYROMANCER}`]:      [`${KEY_PREFIX}mage-tower-blue-red-black`,   mageTowerBlueRedBlackImg],
  // All-color tower (five mages, corrupted lands)
  [
    `${HeroUnitName.CLERIC}|${HeroUnitName.DRUID}|${HeroUnitName.ENCHANTER}|${HeroUnitName.NECROMANCER}|${HeroUnitName.PYROMANCER}`
  ]: [`${KEY_PREFIX}mage-tower-all`, mageTowerAllImg],
};

/** Fallback used when the mage set does not match any known combination */
const MAGE_TOWER_FALLBACK: [string, string] = [`${KEY_PREFIX}mage-tower-all`, mageTowerAllImg];

/**
 * Returns the mage tower [textureKey, imagePath] that best represents the given
 * set of available mage heroes. Pass the result of
 * `getLandUnitsToRecruit(land.type, land.corrupted).filter(isMageType)`.
 */
export const getMageTowerImg = (mageTypes: HeroUnitType[]): [string, string] => {
  const key = [...mageTypes].sort().join('|');
  return MAGE_TOWER_VARIANTS[key] ?? MAGE_TOWER_FALLBACK;
};

export const getMapBuildingImg = (type: BuildingType): [string, string] | undefined =>
  MAP_BUILDING_ASSETS[type];

export const getAllMapBuildingImages = (): [string, string][] => [
  ...(Object.values(MAP_BUILDING_ASSETS) as [string, string][]),
  ...Object.values(MAGE_TOWER_VARIANTS),
];
