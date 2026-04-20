import { BuildingName } from '../types/Building';
import type { BuildingType } from '../types/Building';

import strongholdImg from './buildings/map/stronghold.png';
import barracksImg from './buildings/map/barracks.png';
import mageTowerImg from './buildings/map/mage-tower.png';
import watchTowerImg from './buildings/map/watch-tower.png';
import outpostImg from './buildings/map/outpost.png';

/** Phaser texture key prefix for map-scale building sprites */
const KEY_PREFIX = 'map-building-';

/**
 * Returns [textureKey, imagePath] for a building type that has a map-scale sprite,
 * or undefined for building types without a dedicated map image (Castle Wall, Demolition).
 */
const MAP_BUILDING_ASSETS: Partial<Record<BuildingType, [string, string]>> = {
  [BuildingName.STRONGHOLD]: [`${KEY_PREFIX}stronghold`, strongholdImg],
  [BuildingName.BARRACKS]: [`${KEY_PREFIX}barracks`, barracksImg],
  [BuildingName.MAGE_TOWER]: [`${KEY_PREFIX}mage-tower`, mageTowerImg],
  [BuildingName.WATCH_TOWER]: [`${KEY_PREFIX}watch-tower`, watchTowerImg],
  [BuildingName.OUTPOST]: [`${KEY_PREFIX}outpost`, outpostImg],
  // Castle Wall is rendered via wall segments — no dedicated tile sprite needed.
  // Demolition is a transient action marker — no map sprite.
};

export const getMapBuildingImg = (type: BuildingType): [string, string] | undefined => MAP_BUILDING_ASSETS[type];

export const getAllMapBuildingImages = (): [string, string][] =>
  Object.values(MAP_BUILDING_ASSETS) as [string, string][];
