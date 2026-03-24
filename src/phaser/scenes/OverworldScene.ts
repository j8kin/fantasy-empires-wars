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

/** Pixels of movement required to distinguish a drag-pan from a tap/click */
const DRAG_THRESHOLD = 5;

export class OverworldScene extends Phaser.Scene {
  static readonly KEY = 'OverworldScene';

  private hexSize = 60;
  private hexTiles: Map<string, HexTile> = new Map();
  private gameState?: GameState;
  private graphics?: Phaser.GameObjects.Graphics;
  private glowGraphics?: Phaser.GameObjects.Graphics;
  private spriteLayer?: Phaser.GameObjects.Container;
  private mapWidth = 0;
  private mapHeight = 0;

  /** Tile under the cursor at the last pointerdown — cleared on pointerup */
  private pendingClickTile?: HexTile;
  /** Set to true once the pointer moves more than DRAG_THRESHOLD pixels while held */
  private isDragging = false;

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

    // Create dedicated glow graphics layer (rendered above all tiles)
    this.glowGraphics = this.add.graphics();
    this.glowGraphics.setDepth(10);

    // Subscribe to STATE_UPDATE events
    const onStateUpdate = (state: GameState) => {
      this.handleStateUpdate(state);
    };
    const onGlowTiles = (positions: LandPosition[]) => {
      this.handleGlowTiles(positions);
    };
    const onClearGlow = () => {
      this.handleClearGlow();
    };

    phaserEventBus.on(PhaserEvents.STATE_UPDATE, onStateUpdate);
    phaserEventBus.on(PhaserEvents.GLOW_TILES, onGlowTiles);
    phaserEventBus.on(PhaserEvents.CLEAR_GLOW, onClearGlow);

    // Clean up event bus listeners when scene shuts down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      phaserEventBus.off(PhaserEvents.STATE_UPDATE, onStateUpdate);
      phaserEventBus.off(PhaserEvents.GLOW_TILES, onGlowTiles);
      phaserEventBus.off(PhaserEvents.CLEAR_GLOW, onClearGlow);
    });

    // Suppress browser context menu so right-click can be used in-game
    this.input.mouse?.disableContextMenu();

    // pointerdown: record which tile was under cursor; handle right-click popup immediately
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = false;
      this.pendingClickTile = this.findTileAt(pointer.worldX, pointer.worldY);

      if (pointer.rightButtonDown()) {
        // Right-click → show land info popup right away (not deferred to pointerup)
        if (this.pendingClickTile) {
          const mouseEvent = pointer.event as MouseEvent;
          const screenX = mouseEvent?.clientX ?? pointer.x;
          const screenY = mouseEvent?.clientY ?? pointer.y;
          phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, {
            pos: this.pendingClickTile.landPos,
            screenX,
            screenY,
          });
        }
        this.pendingClickTile = undefined; // nothing to do on pointerup for right-click
      }
    });

    // pointermove: pan camera when dragging with left or middle button
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      if (pointer.rightButtonDown()) return; // right-click never pans

      const dx = pointer.x - pointer.downX;
      const dy = pointer.y - pointer.downY;
      if (!this.isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        this.isDragging = true;
      }

      if (this.isDragging && this.cameras?.main) {
        // 1:1 pixel tracking using per-frame delta
        this.cameras.main.scrollX -= pointer.x - pointer.prevPosition.x;
        this.cameras.main.scrollY -= pointer.y - pointer.prevPosition.y;
      }
    });

    // pointerup: emit TILE_CLICKED only if the release was a clean tap (no drag)
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonReleased()) {
        this.isDragging = false;
        this.pendingClickTile = undefined;
        return;
      }
      if (!this.isDragging && this.pendingClickTile) {
        phaserEventBus.emit(PhaserEvents.TILE_CLICKED, this.pendingClickTile.landPos);
      }
      this.isDragging = false;
      this.pendingClickTile = undefined;
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
    if (!this.graphics) return;

    // Only redraw the graphics layer (borders + fallback fills).
    // Land image sprites don't change between turns, so the sprite layer is left intact.
    this.graphics.clear();

    Object.values(state.map.lands).forEach((land) => {
      const { q, r } = offsetToAxial(land.mapPos);
      this.drawHexGraphics(land, q, r, state);
    });
  }

  /**
   * Calculate grid bounds based on map dimensions.
   * Sets camera bounds and map dimensions for dynamic sizing.
   * Gracefully handles test environments where Phaser cameras may not exist.
   */
  private calculateGridBounds(rows: number, cols: number): void {
    // Derived from axialToPixel formulas:
    //   LEFT_MARGIN = ceil(hexSize * sqrt(3) / 2) + PADDING
    //   x_right of last even-col tile = sqrt(3) * hexSize * cols + PADDING
    //   TOP_OFFSET = hexSize + PADDING
    //   y_bottom of last row = hexSize * (1.5 * rows + 0.5) + PADDING
    const PADDING = 4;
    this.mapWidth = Math.ceil(Math.sqrt(3) * this.hexSize * cols) + PADDING;
    this.mapHeight = Math.ceil(this.hexSize * (1.5 * rows + 0.5)) + PADDING;

    // Set camera bounds (only if cameras exist - they may not in test environment)
    if (this.cameras?.main) {
      this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
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

    // Step 1: Render land image sprite (only during init — not recreated on updates)
    this.renderLandImage(land, center);

    // Step 2: Render graphics layer (fallback fill + ownership border)
    this.drawHexGraphics(land, q, r, state);
  }

  /**
   * Draw the graphics layer for a hex tile: fallback solid fill (if no texture)
   * and the ownership-colored border. Called both during init and on every state update.
   */
  private drawHexGraphics(land: LandState, q: number, r: number, state: GameState): void {
    if (!this.graphics) return;

    const center = axialToPixel(q, r, this.hexSize);
    const corners = hexCorners(center, this.hexSize);

    // Fallback fill when texture is unavailable (e.g. test environment)
    const assetKey = getLandAssetKey(land.type, land.corrupted);
    if (!this.textures?.exists(assetKey)) {
      const color = getLandColor(land.type as any);
      this.graphics.fillStyle(color, 1);
      this.graphics.fillPoints(corners, true);
    }

    // Ownership-colored border (white if unowned).
    // Use a polygon inset by 2px so the 3px stroke stays entirely within the hex
    // boundary and never bleeds onto adjacent tiles regardless of draw order.
    const ownerId = getLandOwner(state, land.mapPos);
    const owner = ownerId !== NO_PLAYER.id ? state.players.find((p) => p.id === ownerId) : undefined;
    const borderHex = owner ? getPlayerColorValue(owner.color) : '#FFFFFF';
    const borderColor = parseInt(borderHex.replace('#', ''), 16);
    const borderCorners = hexCorners(center, this.hexSize - 2);
    this.graphics.lineStyle(3, borderColor, 1);
    this.graphics.strokePoints(borderCorners, true);
  }

  /**
   * Render the land image sprite for a hex tile (called once during initHexGrid).
   * Falls back silently — solid fill handled by drawHexGraphics.
   */
  private renderLandImage(land: LandState, center: Phaser.Geom.Point): void {
    if (!this.spriteLayer) return;

    const assetKey = getLandAssetKey(land.type, land.corrupted);
    if (!this.textures?.exists(assetKey)) return;

    try {
      const image = this.add.image(center.x, center.y, assetKey);
      const scale = (this.hexSize * 1.8) / Math.max(image.width, image.height);
      image.setScale(scale);
      this.spriteLayer.add(image);
    } catch (e) {
      console.warn(`Failed to render land image for ${land.type}:`, e);
    }
  }

  /** Returns the HexTile at the given world coordinates, or undefined if none. */
  private findTileAt(worldX: number, worldY: number): HexTile | undefined {
    for (const [, tile] of this.hexTiles.entries()) {
      const corners = hexCorners(axialToPixel(tile.q, tile.r, this.hexSize), this.hexSize);
      const points = corners.map((c) => new Phaser.Geom.Point(c.x, c.y));
      const poly = new Phaser.Geom.Polygon(points);
      if (Phaser.Geom.Polygon.Contains(poly, worldX, worldY)) {
        return tile;
      }
    }
    return undefined;
  }

  private handleGlowTiles(positions: LandPosition[]): void {
    if (!this.glowGraphics) return;
    this.glowGraphics.clear();

    positions.forEach((pos) => {
      const { q, r } = offsetToAxial(pos);
      const center = axialToPixel(q, r, this.hexSize);
      const corners = hexCorners(center, this.hexSize - 3);
      this.glowGraphics!.lineStyle(4, 0xffff00, 0.9);
      this.glowGraphics!.strokePoints(corners, true);
    });
  }

  private handleClearGlow(): void {
    this.glowGraphics?.clear();
  }
}
