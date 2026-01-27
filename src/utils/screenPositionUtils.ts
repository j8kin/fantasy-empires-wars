import type { GameState } from '../state/GameState';
import type { ScreenPosition } from '../contexts/ApplicationContext';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { MapDimensions } from '../state/map/MapDimensions';

/**
 * Constants for battlefield positioning calculation
 */
export const TOP_PANEL_HEIGHT = 300;
const DEFAULT_TILE_WIDTH = 100;
const HEX_RATIO = 1.1547;

/**
 * Calculate the screen position of a hex tile's center based on its StrategyMap position
 * This matches the CSS layout logic in StrategyMap.tsx and Hexagonal.module.css
 */
export const calculateTileScreenPosition = (
  strategyMapPosition: LandPosition,
  mapDimensions: { rows: number; cols: number },
  windowDimensions: { width: number; height: number } = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  }
): ScreenPosition => {
  const availableArea = {
    width: windowDimensions.width,
    height: windowDimensions.height - TOP_PANEL_HEIGHT,
  };

  // Calculate hex tile size (matches getHexTileSize from StrategyMap.tsx)
  const effectiveCols = mapDimensions.cols + 0.5;
  const calculatedWidthFromArea = (availableArea.width - 100) / effectiveCols;

  const effectiveRows = mapDimensions.rows + 0.25;
  const availableHeightPerRow = (availableArea.height - 100) / effectiveRows;
  const calculatedWidthFromHeight = availableHeightPerRow / HEX_RATIO;

  const tileWidth = Math.max(DEFAULT_TILE_WIDTH, calculatedWidthFromArea, calculatedWidthFromHeight);
  const tileHeight = tileWidth * HEX_RATIO;

  // Calculate position in the hex grid
  const { row, col } = strategyMapPosition;

  // Calculate X position
  let x: number;
  if (row % 2 === 0) {
    // Even rows: no offset
    x = col * tileWidth + tileWidth / 2;
  } else {
    // Odd rows: offset by half tile width
    x = col * tileWidth + tileWidth + tileWidth / 2; // col * tileWidth + offset + center
  }

  // Calculate Y position with row overlap
  const rowOverlap = tileHeight * 0.25;
  const y = row * (tileHeight - rowOverlap) + tileHeight / 2;

  // Add battlefield frame offset (padding and top panel)
  const battlefieldPadding = 50; // Approximate padding from battlefield container

  return {
    x: x + battlefieldPadding,
    y: y + TOP_PANEL_HEIGHT + battlefieldPadding,
  };
};

/**
 * Get the current map dimensions from game state
 * This is a utility to extract dimensions safely
 */
export const getMapDimensions = (gameState: GameState): MapDimensions => {
  return gameState.map.dimensions || { rows: 1, cols: 1 };
};
