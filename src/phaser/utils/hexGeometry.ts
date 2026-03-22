/**
 * Hex geometry utilities for coordinate conversion and rendering
 * Works with the game's offset coordinate system:
 * - Even rows (0, 2, 4...): standard columns
 * - Odd rows (1, 3, 5...): shifted right by 0.5 tile width, one fewer tile
 */

import Phaser from 'phaser';
import { LandPosition } from '../../state/map/land/LandPosition';

/**
 * Convert offset coordinates (row, col) to cube coordinates for hex math
 * Uses standard even-r offset system where even rows are at x=0
 */
export const offsetToAxial = (landPos: LandPosition): { q: number; r: number } => {
  // For even-r offset (even rows at x=0, odd rows offset right)
  // q = col - floor(row / 2)
  // r = row
  const q = landPos.col - Math.floor(landPos.row / 2);
  const r = landPos.row;
  return { q, r };
};

/**
 * Convert axial coordinates (q, r) of the center of Hexagon to pixel coordinates (x, y)
 * Assumes pointy-top hexagons with size = half-width
 * Accounts for hex overlap: rows overlap by 25% (0.75 * height)
 */
export const axialToPixel = (q: number, r: number, size: number): Phaser.Geom.Point => {
  // For pointy-top hexagons in offset-r coordinate system:
  // The q coordinate drifts negative for higher rows due to formula: q = col - floor(row/2)
  // So we need a row-dependent offset: add floor(r/2) to compensate

  const height = size * Math.sqrt(3);

  // Base x position - odd rows offset right
  // Horizontal spacing multiplier
  const HORIZONTAL_SPACING = Math.sqrt(3);
  const ODD_ROW_OFFSET = HORIZONTAL_SPACING / 2; // Half of horizontal spacing
  const LEFT_MARGIN = 100; // Fixed left margin from canvas edge

  // Row-dependent offset to prevent leftward drift
  // Each even row (0, 2, 4...) gets more negative q values, so we add an offset
  const rowOffset = Math.floor(r / 2);

  const x = LEFT_MARGIN + HORIZONTAL_SPACING * size * (q + rowOffset) + (r % 2) * ODD_ROW_OFFSET * size;

  // Vertical spacing with TOP OFFSET to show top hexagons
  const TOP_OFFSET = 100;
  const y = TOP_OFFSET + (HORIZONTAL_SPACING / 2) * height * r;

  return new Phaser.Geom.Point(x, y);
};

/**
 * Get the corner points of a hexagon for drawing
 * Assumes pointy-top hexagons (flat edges on top/bottom)
 */
export const hexCorners = (center: Phaser.Geom.Point, size: number): Phaser.Geom.Point[] => {
  const corners: Phaser.Geom.Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i + 30; // 30° offset for pointy-top
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = center.x + size * Math.cos(angle_rad);
    const y = center.y + size * Math.sin(angle_rad);
    corners.push(new Phaser.Geom.Point(x, y));
  }
  return corners;
};
