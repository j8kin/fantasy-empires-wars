import Phaser from 'phaser';
import { axialToPixel, offsetToAxial } from '../../utils/hexGeometry';
import { getMapBuildingImg, getMageTowerImg } from '../../../assets/getMapBuildingImg';
import { isMageType } from '../../../domain/unit/unitTypeChecks';
import { getLandOwner, getVisibleLands } from '../../../selectors/landSelectors';
import { getPlayer, getUnitsAllowedToRecruit } from '../../../selectors/playerSelectors';
import { getLandId } from '../../../state/map/land/LandId';
import { BuildingName } from '../../../types/Building';
import { HEX_SIZE } from '../../utils/hexGeometry';
import type { BuildingType } from '../../../types/Building';
import type { GameState } from '../../../state/GameState';

// ─────────────────────────────────────────────────────────────────────────────
// TUNING — edit the values below to adjust building sprite appearance.
// Changes take effect on the next STATE_UPDATE (no restart required).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fraction of HEX_SIZE that becomes the sprite's longest side before BUILDING_SCALE.
 *
 * 1.0 means the longest side equals HEX_SIZE (60 px).
 * Tweak this to change the overall size class without losing the per-type multiplier.
 */
export const BUILDING_FIT_RATIO: Record<BuildingType, number> = {
  [BuildingName.STRONGHOLD]: 2.0,
  [BuildingName.BARRACKS]: 2.0,
  [BuildingName.MAGE_TOWER]: 2.5,
  [BuildingName.WATCH_TOWER]: 2.7,
  [BuildingName.OUTPOST]: 2.0,
  [BuildingName.WALL]: 0, // not used. placed via wall segments layer
  [BuildingName.DEMOLITION]: 0, // not used. this is an action not a building
};

/**
 * Per-building-type position offset in screen pixels, relative to the hex tile center.
 *
 * Use this to place each building type exactly where it looks best on the tile art.
 * Positive X = right, positive Y = down.
 *
 * Examples:
 *   Stronghold: center of tile     → { x: 0,  y: 0  }
 *   Barracks:   slightly left      → { x: -8, y: 4  }
 *   Watch Tower: upper half        → { x: 0,  y: -12 }
 */
export const BUILDING_OFFSET: Record<BuildingType, { x: number; y: number }> = {
  [BuildingName.STRONGHOLD]: { x: 0, y: -15 },
  [BuildingName.BARRACKS]: { x: 0, y: 0 },
  [BuildingName.MAGE_TOWER]: { x: 0, y: -45 },
  [BuildingName.WATCH_TOWER]: { x: 0, y: -40 },
  [BuildingName.OUTPOST]: { x: 0, y: -18 },
  [BuildingName.WALL]: { x: 0, y: 0 }, // rendered via wall segments — unused here
  [BuildingName.DEMOLITION]: { x: 0, y: 0 }, // no map sprite — unused here
};

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export const drawBuildingLayer = (
  container: Phaser.GameObjects.Container,
  scene: Phaser.Scene,
  state: GameState
): void => {
  container.removeAll(true);

  const visibleIds = new Set(getVisibleLands(state).map(getLandId));

  Object.values(state.map.lands).forEach((land) => {
    if (!visibleIds.has(getLandId(land.mapPos))) return;
    if (!land.buildings.length) return;

    const { q, r } = offsetToAxial(land.mapPos);
    const center = axialToPixel(q, r);

    const landPlayer = getPlayer(state, getLandOwner(state, land.mapPos));

    land.buildings.forEach((building) => {
      let asset: [string, string] | undefined;
      if (building.type === BuildingName.MAGE_TOWER) {
        const mages = getUnitsAllowedToRecruit(landPlayer, land).filter(isMageType);
        asset = getMageTowerImg(mages);
      } else {
        asset = getMapBuildingImg(building.type);
      }
      if (!asset) return; // Castle Wall / Demolition — no map sprite

      const [textureKey] = asset;
      if (!scene.textures?.exists(textureKey)) return;

      const offset = BUILDING_OFFSET[building.type] ?? { x: 0, y: 0 };

      try {
        const sprite = scene.add.image(center.x + offset.x, center.y + offset.y, textureKey);
        sprite.setOrigin(0.5, 0.5);
        const baseScale = (HEX_SIZE * BUILDING_FIT_RATIO[building.type]) / Math.max(sprite.width, sprite.height);
        sprite.setScale(baseScale);
        container.add(sprite);
      } catch (e) {
        console.warn(`buildingLayer: failed to render ${building.type}:`, e);
      }
    });
  });
};
