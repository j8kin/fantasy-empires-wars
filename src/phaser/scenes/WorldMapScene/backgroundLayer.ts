import type Phaser from 'phaser';
import { MapDimensions } from '../../../state/map/MapDimensions';
import { HEX_SIZE } from '../../utils/hexGeometry';

/**
 * Calculate grid bounds based on map dimensions.
 * Sets camera bounds and map dimensions for dynamic sizing.
 * Gracefully handles test environments where Phaser cameras may not exist.
 */
const calculateGridBounds = (mapDimensions: MapDimensions): { mapWidth: number; mapHeight: number } => {
  // Derived from axialToPixel formulas:
  //   LEFT_MARGIN = ceil(hexSize * sqrt(3) / 2) + PADDING
  //   x_right of last even-col tile = sqrt(3) * hexSize * cols + PADDING
  //   TOP_OFFSET = hexSize + PADDING
  //   y_bottom of last row = hexSize * (1.5 * rows + 0.5) + PADDING
  const PADDING = 4;
  const mapWidth = Math.ceil(Math.sqrt(3) * HEX_SIZE * mapDimensions.cols) + PADDING;
  const mapHeight = Math.ceil(HEX_SIZE * (1.5 * mapDimensions.rows + 0.5)) + PADDING;
  return { mapWidth, mapHeight };
};

export const drawBackgroundLayer = (
  backgroundTile: Phaser.GameObjects.TileSprite,
  scene: Phaser.Scene,
  mapDimensions: MapDimensions
) => {
  // Calculate grid bounds dynamically based on map dimensions
  const { mapWidth, mapHeight } = calculateGridBounds(mapDimensions);
  if (scene.cameras?.main) {
    scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  }
  // Resize background tile to cover both the map area and the full canvas viewport.
  // The canvas can be wider/taller than the map, so we take the max of both to avoid
  // the Phaser backgroundColor showing through at the edges.
  const canvasWidth = scene.scale?.width ?? 0;
  const canvasHeight = scene.scale?.height ?? 0;
  backgroundTile.setSize(Math.max(mapWidth, canvasWidth), Math.max(mapHeight, canvasHeight));
};
