import Phaser from 'phaser';
import { offsetToAxial, axialToPixel, hexCorners } from '../utils/hexGeometry';
import { getLandColor } from '../../domain/land/landRepository';
import { getAllLandImages } from '../../assets/getLandImg';
import { phaserEventBus, PhaserEvents } from '../phaserEventBus';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';

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

  constructor() {
    super({ key: OverworldScene.KEY });
  }

  preload(): void {
    // Preload all land images for future use with textures
    // Currently using solid colors, but this allows for future sprite-based rendering
    try {
      getAllLandImages();
    } catch (e) {
      // Assets may not be available in test environment
      console.debug('Could not load land images');
    }
  }

  create(): void {
    // Set camera bounds (no physics needed for this scene)
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Create graphics layer for hex tiles
    this.graphics = this.add.graphics();

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
    if (!this.graphics) return;

    const { lands } = state.map;

    // Clear existing tiles
    this.hexTiles.clear();
    this.graphics.clear();

    // Draw all land tiles
    Object.values(lands).forEach((land) => {
      const tileKey = `${land.mapPos.row},${land.mapPos.col}`;
      const { q, r } = offsetToAxial(land.mapPos.row, land.mapPos.col);

      // Store tile info for click detection
      this.hexTiles.set(tileKey, {
        q,
        r,
        landPos: land.mapPos,
      });

      // Draw the tile
      this.drawHexTile(land.type, q, r, state);
    });
  }

  private updateTiles(state: GameState): void {
    if (!this.graphics) return;

    // Clear and redraw all tiles
    this.graphics.clear();
    const { lands } = state.map;

    Object.values(lands).forEach((land) => {
      const { q, r } = offsetToAxial(land.mapPos.row, land.mapPos.col);
      this.drawHexTile(land.type, q, r, state);
    });
  }

  private drawHexTile(landType: string, q: number, r: number, state: GameState): void {
    if (!this.graphics) return;

    const { x, y } = axialToPixel(q, r, this.hexSize);
    const corners = hexCorners(x, y, this.hexSize);

    // Draw base terrain color
    const color = getLandColor(landType as any);
    this.graphics.fillStyle(color, 1);
    this.graphics.fillPoints(corners, true); // true = close the shape

    // Draw border
    this.graphics.lineStyle(1, 0x333333, 0.5);
    this.graphics.strokePoints(corners, true); // true = close the shape

    // Find land state and apply ownership tint if applicable
    const land = Object.values(state.map.lands).find((l) => {
      const { q: lq, r: lr } = offsetToAxial(l.mapPos.row, l.mapPos.col);
      return lq === q && lr === r;
    });

    if (land && (land as any).ownerId) {
      const ownerId = (land as any).ownerId;
      const player = state.players.find((p) => p.id === ownerId);
      if (player && (player as any).color?.value) {
        const hexColor = (player as any).color.value;
        const phaserColor = parseInt(hexColor.replace('#', '0x'), 16);
        this.graphics.fillStyle(phaserColor, 0.25);
        this.graphics.fillPoints(corners, true); // Apply ownership tint
      }
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    // Find which hex was clicked
    for (const [, tile] of this.hexTiles.entries()) {
      const { x, y } = axialToPixel(tile.q, tile.r, this.hexSize);
      const corners = hexCorners(x, y, this.hexSize);
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
