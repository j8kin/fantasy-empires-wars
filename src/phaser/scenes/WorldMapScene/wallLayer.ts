import Phaser from 'phaser';
import { axialToPixel, HEX_SIZE, offsetToAxial } from '../../utils/hexGeometry';
import { getLand, getLandOwner, hasBuilding, getVisibleLands } from '../../../selectors/landSelectors';
import { getLandId } from '../../../state/map/land/LandId';
import { BuildingName } from '../../../types/Building';
import { WALL_TEXTURE } from '../../../assets/getWallSegmentImg';
import type { GameState } from '../../../state/GameState';
import type { LandPosition } from '../../../state/map/land/LandPosition';

// ─────────────────────────────────────────────────────────────────────────────
// TUNING — edit the values below to change the visual appearance.
// All changes take effect on the next STATE_UPDATE (hot-reload friendly).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scale multiplier for the angle segment (SE / NW / SW / NE edges).
 *
 * The base scale is computed so that `Math.max(sprite.width, sprite.height)`
 * equals HEX_SIZE (60 px).  Multiply here to grow or shrink the segment.
 *
 * Examples:
 *   1.0  → sprite longest side = 60 px  (default)
 *   1.5  → longer side = 90 px (larger, covers more of the edge)
 *   0.7  → longer side = 42 px (tighter, less overlap with tile art)
 */
export const ANGLE_SEGMENT_SCALE = 1.0;

/**
 * Scale multiplier for the vertical segment (E / W edges).
 *
 * Base scale makes `sprite.height` equal to HEX_SIZE (60 px) so the segment
 * fills the full vertical edge.
 *
 * Examples:
 *   1.0  → height = 60 px  (default, matches edge length exactly)
 *   1.2  → height = 72 px  (slight overlap at vertices — good if seams show)
 *   0.8  → height = 48 px  (shorter — avoids corner overlap if rooks are added)
 */
export const VERTICAL_SEGMENT_SCALE = 1.0;

/**
 * Per-edge pixel nudge applied AFTER the computed edge midpoint.
 *
 * Use these to correct for any residual misalignment once you see the segments
 * on screen.  Positive X is right, positive Y is down (screen coordinates).
 *
 * Typical workflow:
 *   1. Start with all zeros.
 *   2. Run the game and inspect each edge visually.
 *   3. Nudge the offending edge by a few pixels.
 */
export const EDGE_OFFSET: Record<string, { extraX: number; extraY: number }> = {
  NE: { extraX: 0, extraY: 0 },
  E: { extraX: 0, extraY: 0 },
  SE: { extraX: 0, extraY: 0 },
  SW: { extraX: 0, extraY: 0 },
  W: { extraX: 0, extraY: 0 },
  NW: { extraX: 0, extraY: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Edge geometry (pointy-top hex, even-r offset coordinate system)
// ─────────────────────────────────────────────────────────────────────────────
//
// Pointy-top hex corners at distance HEX_SIZE from center (angles: 30°+60°·i):
//
//           V_top  (0, -1)
//          /               \
//   V_ul (-√3/2, -½)     V_ur (+√3/2, -½)
//   |                               |
//   V_ll (-√3/2, +½)     V_lr (+√3/2, +½)
//          \               /
//           V_bot  (0, +1)
//
// Edge midpoints (as fractions of HEX_SIZE, y-down screen space):
//   NE: V_top→V_ur  = (+√3/4, -¾)  ≈ (+0.433, -0.75)
//   E:  V_ur→V_lr   = (+√3/2, 0)   ≈ (+0.866, 0)
//   SE: V_lr→V_bot  = (+√3/4, +¾)  ≈ (+0.433, +0.75)
//   SW: V_bot→V_ll  = (-√3/4, +¾)  ≈ (-0.433, +0.75)
//   W:  V_ll→V_ul   = (-√3/2, 0)   ≈ (-0.866, 0)
//   NW: V_ul→V_top  = (-√3/4, -¾)  ≈ (-0.433, -0.75)
//
// Sprite mapping (all rotations are 0 — sprites were designed to fit naturally):
//   SE / NW : angle-segment  (as-is)
//   SW / NE : angle-segment  (flipX — mirror image)
//   E       : vertical-segment (as-is)
//   W       : vertical-segment (flipX — mirror image)

const SQRT3_2 = Math.sqrt(3) / 2; // ≈ 0.866

interface EdgeConfig {
  /** Midpoint relative to hex center, as fraction of HEX_SIZE */
  readonly offsetFractionX: number;
  readonly offsetFractionY: number;
  /** Phaser rotation in radians (0 = sprite drawn exactly as PNG) */
  readonly rotation: number;
  /** Flip sprite horizontally to mirror the segment for the opposite diagonal */
  readonly flipX: boolean;
  /** Texture key to render */
  readonly textureKey: string;
  /** Neighbor offset [dRow, dCol] for even rows */
  readonly neighborEven: readonly [number, number];
  /** Neighbor offset [dRow, dCol] for odd rows */
  readonly neighborOdd: readonly [number, number];
}

const EDGE_CONFIGS: Record<string, EdgeConfig> = {
  NE: {
    offsetFractionX: SQRT3_2 / 2, //  ≈ +0.433
    offsetFractionY: -0.75,
    rotation: 0,
    flipX: true, // mirror of SE
    textureKey: WALL_TEXTURE.ANGLE,
    neighborEven: [-1, 0] as const,
    neighborOdd: [-1, +1] as const,
  },
  E: {
    offsetFractionX: SQRT3_2, //  ≈ +0.866
    offsetFractionY: 0,
    rotation: 0,
    flipX: false,
    textureKey: WALL_TEXTURE.VERTICAL,
    neighborEven: [0, +1] as const,
    neighborOdd: [0, +1] as const,
  },
  SE: {
    offsetFractionX: SQRT3_2 / 2, //  ≈ +0.433
    offsetFractionY: 0.75,
    rotation: 0,
    flipX: false,
    textureKey: WALL_TEXTURE.ANGLE,
    neighborEven: [+1, 0] as const,
    neighborOdd: [+1, +1] as const,
  },
  SW: {
    offsetFractionX: -SQRT3_2 / 2, //  ≈ -0.433
    offsetFractionY: 0.75,
    rotation: 0,
    flipX: true, // mirror of SE
    textureKey: WALL_TEXTURE.ANGLE,
    neighborEven: [+1, -1] as const,
    neighborOdd: [+1, 0] as const,
  },
  W: {
    offsetFractionX: -SQRT3_2, //  ≈ -0.866
    offsetFractionY: 0,
    rotation: 0,
    flipX: true, // mirror of E
    textureKey: WALL_TEXTURE.VERTICAL,
    neighborEven: [0, -1] as const,
    neighborOdd: [0, -1] as const,
  },
  NW: {
    offsetFractionX: -SQRT3_2 / 2, //  ≈ -0.433
    offsetFractionY: -0.75,
    rotation: 0,
    flipX: false,
    textureKey: WALL_TEXTURE.ANGLE,
    neighborEven: [-1, -1] as const,
    neighborOdd: [-1, 0] as const,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function shouldShowWall(state: GameState, landPos: LandPosition, edgeKey: string): boolean {
  const land = getLand(state, landPos);
  if (!land || !hasBuilding(land, BuildingName.WALL)) return false;

  const cfg = EDGE_CONFIGS[edgeKey];
  const isEven = landPos.row % 2 === 0;
  const [dRow, dCol] = isEven ? cfg.neighborEven : cfg.neighborOdd;
  const neighborPos: LandPosition = { row: landPos.row + dRow, col: landPos.col + dCol };

  const neighbor = getLand(state, neighborPos);
  if (!neighbor) return true; // map boundary — always show wall on open edges

  return getLandOwner(state, landPos) !== getLandOwner(state, neighborPos);
}

function computeScale(sprite: Phaser.GameObjects.Image, textureKey: string): number {
  if (textureKey === WALL_TEXTURE.VERTICAL) {
    // Scale so the sprite's height matches the hex edge length (vertical wall fills the edge)
    return (HEX_SIZE / sprite.height) * VERTICAL_SEGMENT_SCALE;
  }
  // Scale so the sprite's longest side matches HEX_SIZE
  return (HEX_SIZE / Math.max(sprite.width, sprite.height)) * ANGLE_SEGMENT_SCALE;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const drawWallLayer = (container: Phaser.GameObjects.Container, scene: Phaser.Scene, state: GameState): void => {
  container.removeAll(true);

  const visibleIds = new Set(getVisibleLands(state).map(getLandId));

  Object.values(state.map.lands).forEach((land) => {
    if (!visibleIds.has(getLandId(land.mapPos))) return;
    const { q, r } = offsetToAxial(land.mapPos);
    const center = axialToPixel(q, r);

    for (const [edgeKey, cfg] of Object.entries(EDGE_CONFIGS)) {
      if (!shouldShowWall(state, land.mapPos, edgeKey)) continue;
      if (!scene.textures?.exists(cfg.textureKey)) continue;

      const tweak = EDGE_OFFSET[edgeKey] ?? { extraX: 0, extraY: 0 };
      const x = center.x + cfg.offsetFractionX * HEX_SIZE + tweak.extraX;
      const y = center.y + cfg.offsetFractionY * HEX_SIZE + tweak.extraY;

      try {
        const sprite = scene.add.image(x, y, cfg.textureKey);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(cfg.rotation);
        sprite.setScale(computeScale(sprite, cfg.textureKey));
        sprite.setFlipX(cfg.flipX);
        container.add(sprite);
      } catch (e) {
        console.warn(`wallLayer: failed to place segment on edge ${edgeKey}:`, e);
      }
    }
  });
};
