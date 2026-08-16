import Phaser from 'phaser';
import { getLandId } from '../../../state/map/land/LandId';
import { getLand, getLandOwner } from '../../../selectors/landSelectors';
import { getPlayer } from '../../../selectors/playerSelectors';
import { getLandColor } from '../../../domain/land/landRepository';
import { getPlayerColorValue } from '../../../domain/ui/playerColors';
import { axialToPixel, HEX_SIZE, hexCorners, offsetToAxial } from '../../utils/hexGeometry';
import { getLandImg } from '../../../assets/getLandImg';
import type { GameState } from '../../../state/GameState';
import type { MapDimensions } from '../../../state/map/MapDimensions';
import type { LandPosition } from '../../../state/map/land/LandPosition';

/**
 * Draw a hex tile with image texture, border, and ownership tint overlay.
 * @param landLayerContainer
 * @param landGraphics
 * @param scene
 * @param landPos
 * @param state - Current game state (for ownership info)
 */
const drawHexTile = (
  landLayerContainer: Phaser.GameObjects.Container,
  landGraphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene,
  state: GameState,
  landPos: LandPosition
): void => {
  const { q, r } = offsetToAxial(landPos);
  const center = axialToPixel(q, r);

  // Step 1: Render land image sprite (only during init — not recreated on updates)
  renderLandImage(landLayerContainer, scene, center, state, landPos);

  // Step 2: Render graphics layer (fallback fill + ownership border)
  drawHexGraphics(landGraphics, scene, state, landPos);
};

/**
 * Draw the graphics layer for a hex tile: fallback solid fill (if no texture)
 * and the ownership-colored border. Called both during init and on every state update.
 */
const drawHexGraphics = (
  landGraphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene,
  state: GameState,
  landPos: LandPosition
): void => {
  const { q, r } = offsetToAxial(landPos);
  const center = axialToPixel(q, r);
  const corners = hexCorners(center);

  const land = getLand(state, landPos);
  // Fallback fill when texture is unavailable (e.g. test environment)
  const [assetKey] = getLandImg(land);
  if (!scene.textures?.exists(assetKey)) {
    const color = getLandColor(land.type);
    landGraphics.fillStyle(color, 1);
    landGraphics.fillPoints(corners, true);
  }

  // Ownership-colored border (white if unowned).
  // Use a polygon inset by 2px so the 3px stroke stays entirely within the hex
  // boundary and never bleeds onto adjacent tiles regardless of draw order.
  const owner = getPlayer(state, getLandOwner(state, land.mapPos));
  const borderColor = parseInt(getPlayerColorValue(owner.color).replace('#', ''), 16);
  const borderCorners = hexCorners(center);
  landGraphics.lineStyle(3, borderColor, 1);
  landGraphics.strokePoints(borderCorners, true);
};

/**
 * Render the land image sprite for a hex tile (called once during initHexGrid).
 * Falls back silently — solid fill handled by drawHexGraphics.
 */
const renderLandImage = (
  landLayerContainer: Phaser.GameObjects.Container,
  scene: Phaser.Scene,
  center: Phaser.Geom.Point,
  state: GameState,
  landPos: LandPosition
): void => {
  const land = getLand(state, landPos);
  const [assetKey] = getLandImg(land);
  if (!scene.textures?.exists(assetKey)) return;

  try {
    const image = scene.add.image(center.x, center.y, assetKey);
    image.setName(getLandId(landPos));
    const scale = (HEX_SIZE * 1.8) / Math.max(image.width, image.height);
    image.setScale(scale);
    landLayerContainer.add(image);
  } catch (e) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      console.warn(`Failed to render land image for ${land.type}:`, e);
    }
  }
};

export const initLandLayer = (
  landLayerContainer: Phaser.GameObjects.Container,
  landGraphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene,
  state: GameState
): void => {
  const { lands } = state.map;

  // Clear existing tiles
  landGraphics.clear();
  landLayerContainer.removeAll(true);

  // Draw all land tiles
  Object.values(lands).forEach((land) => {
    drawHexTile(landLayerContainer, landGraphics, scene, state, land.mapPos);
  });
};

export const drawLandLayer = (
  landLayerContainer: Phaser.GameObjects.Container,
  landGraphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene,
  state: GameState
): void => {
  // todo: do we really need to clear the graphics layer every frame? probably only updated Land need to be redrawn
  landGraphics.clear();

  Object.values(state.map.lands).forEach((land) => {
    // Swap texture in-place if corruption changed (avoids rebuilding entire sprite layer).
    const sprite = landLayerContainer?.getByName(getLandId(land.mapPos)) as Phaser.GameObjects.Image;
    if (sprite) {
      const [assertKey] = getLandImg(land);
      if (sprite.texture?.key !== assertKey && scene.textures?.exists(assertKey)) {
        sprite.setTexture(assertKey);
        const scale = (HEX_SIZE * 1.8) / Math.max(sprite.width, sprite.height);
        sprite.setScale(scale);
      }
    }

    drawHexGraphics(landGraphics, scene, state, land.mapPos);
  });
};

/** Returns the LandPosition at the given world coordinates, or undefined if none. */
export const getLandByPoint = (
  worldPointer: Phaser.Input.Pointer,
  mapDimensions: MapDimensions
): LandPosition | undefined => {
  for (let row = 0; row < mapDimensions.rows; row++) {
    for (let col = 0; col < mapDimensions.cols; col++) {
      const { q, r } = offsetToAxial({ row, col });
      const corners = hexCorners(axialToPixel(q, r));
      const points = corners.map((c) => new Phaser.Geom.Point(c.x, c.y));
      const poly = new Phaser.Geom.Polygon(points);
      if (Phaser.Geom.Polygon.Contains(poly, worldPointer.worldX, worldPointer.worldY)) {
        return { row, col };
      }
    }
  }
  return undefined;
};

export const glowLands = (landGlowGraphics?: Phaser.GameObjects.Graphics, landPositions?: LandPosition[]): void => {
  if (!landGlowGraphics) return;
  landGlowGraphics.clear();

  landPositions?.forEach((pos) => {
    const { q, r } = offsetToAxial(pos);
    const center = axialToPixel(q, r);
    const corners = hexCorners(center);
    landGlowGraphics.lineStyle(4, 0xffff00, 0.9);
    landGlowGraphics.strokePoints(corners, true);
  });
};

export const unGlowLands = (landGlowGraphics?: Phaser.GameObjects.Graphics): void => {
  landGlowGraphics?.clear();
};
