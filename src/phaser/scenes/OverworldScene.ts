import Phaser from 'phaser';
import { getLandId } from '../../state/map/land/LandId';
import { getLandColor } from '../../domain/land/landRepository';
import { getLandAssetKey, getLandAssetPaths } from '../utils/landImageManager';
import { offsetToAxial, axialToPixel, hexCorners } from '../utils/hexGeometry';
import { phaserEventBus, PhaserEvents } from '../phaserEventBus';
import { getLandOwner } from '../../selectors/landSelectors';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { LandState } from '../../state/map/land/LandState';

interface HexTile {
  q: number;
  r: number;
  landPos: LandPosition;
}

export class OverworldScene extends Phaser.Scene {
  static readonly KEY = 'OverworldScene';

  private hexSize = 64;
  private hexTiles: Map<string, HexTile> = new Map();
  private gameState?: GameState;
  private graphics?: Phaser.GameObjects.Graphics;
  private spriteLayer?: Phaser.GameObjects.Container;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor() {
    super({ key: OverworldScene.KEY });
  }

  preload(): void {
    // Load all land type images as textures (normal and corrupted variants)
    try {
      // todo replace with getLandImg or remove getLandImg
      const assetPaths = getLandAssetPaths();
      assetPaths.forEach(([key, path]) => {
        // Use dynamic import resolution for Vite
        this.load.image(key, path);
      });
    } catch (e) {
      // Assets may not be available in test environment
      console.debug('Could not load land images');
    }
  }

  create(): void {
    // Create graphics layer for hex borders and ownership tints
    this.graphics = this.add.graphics();

    // Create sprite layer container for land images
    this.spriteLayer = this.add.container(0, 0);

    // Subscribe to STATE_UPDATE events
    const onStateUpdate = (state: GameState) => {
      this.handleStateUpdate(state);
    };

    phaserEventBus.on(PhaserEvents.STATE_UPDATE, onStateUpdate);

    // Setup pointer handlers for tile clicks
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    phaserEventBus.emit(PhaserEvents.SCENE_READY, OverworldScene.KEY);
  }

  private handleStateUpdate(state: GameState): void {
    this.gameState = state;

    // Initialize hex tiles if not done yet
    if (this.hexTiles.size === 0 && this.graphics) {
      this.initHexGrid(state);
    } else if (this.graphics) {
      // Update tiles
      this.updateTiles(state);
    }
  }

  private initHexGrid(state: GameState): void {
    if (!this.graphics || !this.spriteLayer) return;

    const { lands, dimensions } = state.map;

    // Clear existing tiles
    this.hexTiles.clear();
    this.graphics.clear();
    this.spriteLayer.removeAll(true);

    // Calculate grid bounds dynamically based on map dimensions
    const { rows, cols } = dimensions;
    this.calculateGridBounds(rows, cols);

    // Draw all land tiles
    Object.values(lands).forEach((land) => {
      const tileKey = getLandId(land.mapPos);
      const { q, r } = offsetToAxial(land.mapPos);

      // Store tile info for click detection
      this.hexTiles.set(tileKey, {
        q,
        r,
        landPos: land.mapPos,
      });

      // Draw the tile
      this.drawHexTile(land, q, r, state);
    });
  }

  private updateTiles(state: GameState): void {
    if (!this.graphics || !this.spriteLayer) return;

    // Clear and redraw all tiles
    this.graphics.clear();
    this.spriteLayer.removeAll(true);

    const { lands } = state.map;

    Object.values(lands).forEach((land) => {
      const { q, r } = offsetToAxial(land.mapPos);
      this.drawHexTile(land, q, r, state);
    });
  }

  /**
   * Calculate grid bounds based on map dimensions.
   * Sets camera bounds and map dimensions for dynamic sizing.
   * Gracefully handles test environments where Phaser cameras may not exist.
   */
  private calculateGridBounds(rows: number, cols: number): void {
    // Calculate pixel dimensions based on hex positioning
    // Hexagon spacing: 3 × hexSize horizontally, 0.75 × sqrt(3) × hexSize vertically
    const hexSpacingX = 3 * this.hexSize;
    const hexSpacingY = 0.75 * Math.sqrt(3) * this.hexSize;

    // Calculate world bounds with padding for proper camera positioning
    this.mapWidth = cols * hexSpacingX + this.hexSize;
    this.mapHeight = rows * hexSpacingY + this.hexSize;

    // Set camera bounds (only if cameras exist - they may not in test environment)
    if (this.cameras?.main) {
      this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);

      // Enable camera drag for large maps
      this.input.mouse?.disableContextMenu();
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && (pointer.button === 1 || pointer.button === 2)) {
          // Middle or right button drag
          const camX = this.cameras.main.scrollX - pointer.velocity.x * 0.1;
          const camY = this.cameras.main.scrollY - pointer.velocity.y * 0.1;
          this.cameras.main.scrollX = camX;
          this.cameras.main.scrollY = camY;
        }
      });
    }
  }

  /**
   * Draw a hex tile with image texture, border, and ownership tint overlay.
   * @param land - The land state to render
   * @param q - Axial coordinate Q
   * @param r - Axial coordinate R
   * @param state - Current game state (for ownership info)
   */
  private drawHexTile(land: LandState, q: number, r: number, state: GameState): void {
    if (!this.graphics || !this.spriteLayer) return;

    const center = axialToPixel(q, r, this.hexSize);
    const corners = hexCorners(center, this.hexSize);

    // Step 1: Render land image (scaled to fit hex)
    this.renderLandImage(land, center);

    // Step 2: Draw ownership-colored border (white if unowned)
    const ownerId = getLandOwner(state, land.mapPos);
    const owner = ownerId !== NO_PLAYER.id ? state.players.find((p) => p.id === ownerId) : undefined;
    const borderHex = owner ? getPlayerColorValue(owner.color) : '#FFFFFF';
    const borderColor = parseInt(borderHex.replace('#', ''), 16);
    this.graphics.lineStyle(3, borderColor, 1);
    this.graphics.strokePoints(corners, true);
  }

  /**
   * Render the land image sprite for a hex tile.
   * Images are scaled and centered on the hex center point.
   * Falls back to solid color hex if texture is unavailable.
   */
  private renderLandImage(land: LandState, center: Phaser.Geom.Point): void {
    if (!this.spriteLayer || !this.graphics) return;

    // Get the appropriate asset key for this land (normal or corrupted)
    const assetKey = getLandAssetKey(land.type, land.corrupted);

    // Check if texture exists in the cache (may not exist in test environment)
    const textureExists = this.textures?.exists(assetKey) || false;

    if (textureExists) {
      try {
        // Create and add image sprite to the layer
        const image = this.add.image(center.x, center.y, assetKey);

        // Scale image to fit within hex tile
        // Hex radius is this.hexSize, so scale image to be slightly smaller (90% of hex size)
        const scale = (this.hexSize * 1.8) / Math.max(image.width, image.height);
        image.setScale(scale);

        // Add to sprite layer for proper layering
        this.spriteLayer.add(image);
        return; // Success, don't render fallback
      } catch (e) {
        // Texture exists but creation failed, log and fall through to fallback
        console.warn(`Failed to render land image for ${land.type}:`, e);
      }
    }

    // Fallback: if texture not found or creation failed, draw colored placeholder
    const color = getLandColor(land.type as any);
    this.graphics.fillStyle(color, 1);
    const corners = hexCorners(center, this.hexSize);
    this.graphics.fillPoints(corners, true);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    // Find which hex was clicked
    for (const [, tile] of this.hexTiles.entries()) {
      const corners = hexCorners(axialToPixel(tile.q, tile.r, this.hexSize), this.hexSize);
      const points = corners.map((c) => new Phaser.Geom.Point(c.x, c.y));
      const poly = new Phaser.Geom.Polygon(points);

      if (Phaser.Geom.Polygon.Contains(poly, worldX, worldY)) {
        // Emit tile clicked event
        if (pointer.button === 0) {
          // Left click
          phaserEventBus.emit(PhaserEvents.TILE_CLICKED, tile.landPos);
        } else if (pointer.button === 2) {
          // Right click
          phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, tile.landPos);
        }
        return;
      }
    }
  }
}
