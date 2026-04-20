import Phaser from 'phaser';
import { getFigureAssetPaths } from '../../assets/getArmyFigureImg';
import { getAllLandImages } from '../../assets/getLandImg';
import { getWallSegmentImages } from '../../assets/getWallSegmentImg';
import { drawLandLayer, getLandByPoint, glowLands, initLandLayer, unGlowLands } from './WorldMapScene/landsLayer';
import { drawBackgroundLayer } from './WorldMapScene/backgroundLayer';
import { drawArmyFiguresLayer } from './WorldMapScene/armyFiguresLayer';
import { drawWallLayer } from './WorldMapScene/wallLayer';
import { drawBuildingLayer } from './WorldMapScene/buildingLayer';
import { getAllMapBuildingImages } from '../../assets/getMapBuildingImg';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { phaserEventBus, PhaserEvents } from '../phaserEventBus';
import type { GameState } from '../../state/GameState';
import type { MapDimensions } from '../../state/map/MapDimensions';
import type { LandPosition } from '../../state/map/land/LandPosition';

import celticBackgroundPng from '../../assets/border/CelticBackground.png';

/** Pixels of movement required to distinguish a drag-pan from a tap/click */
const DRAG_THRESHOLD = 5;

export class WorldMapScene extends Phaser.Scene {
  static readonly KEY = 'WorldMapScene';

  private isInitialized = false;
  private mapDimensions: MapDimensions = { rows: 0, cols: 0 };

  private backgroundTile?: Phaser.GameObjects.TileSprite;
  private landsLayer?: Phaser.GameObjects.Container;
  private landGraphics?: Phaser.GameObjects.Graphics;
  private wallLayer?: Phaser.GameObjects.Container;
  private buildingLayer?: Phaser.GameObjects.Container;
  private glowGraphics?: Phaser.GameObjects.Graphics;
  private figureLayer?: Phaser.GameObjects.Container;

  /** Tile under the cursor at the last pointerdown — cleared on pointerup */
  private pendingClickTile?: LandPosition;
  /** Set to true once the pointer moves more than DRAG_THRESHOLD pixels while held */
  private isDragging = false;

  constructor() {
    super({ key: WorldMapScene.KEY });
  }

  preload(): void {
    // Load all land type images as textures (normal and corrupted variants)
    try {
      this.load.image('celtic-background', celticBackgroundPng);

      getAllLandImages().forEach(([key, path]) => {
        this.load.image(key, path);
      });

      getFigureAssetPaths().forEach(([key, path]) => {
        this.load.image(key, path);
      });

      getWallSegmentImages().forEach(([key, path]) => {
        this.load.image(key, path);
      });

      getAllMapBuildingImages().forEach(([key, path]) => {
        this.load.image(key, path);
      });
    } catch (e) {
      // should never happen
      console.debug('Could not load land images');
    }
  }

  create(): void {
    // Create tiling background (sized later in calculateGridBounds)
    if (this.textures?.exists('celtic-background')) {
      this.backgroundTile = this.add.tileSprite(0, 0, 1, 1, 'celtic-background');
      this.backgroundTile.setOrigin(0, 0);
      this.backgroundTile.setDepth(-1);
    }

    // Create landGraphics layer for hex borders and ownership tints
    this.landGraphics = this.add.graphics();

    // Create sprite layer container for land images
    this.landsLayer = this.add.container(0, 0);

    // Create wall segment layer (depth 3: above land images and borders, below buildings)
    this.wallLayer = this.add.container(0, 0);
    this.wallLayer.setDepth(3);

    // Create building sprite layer (depth 4: above wall segments, below figures)
    this.buildingLayer = this.add.container(0, 0);
    this.buildingLayer.setDepth(4);

    // Create figure layer container for army figures (depth 5: above land+borders, below glow)
    this.figureLayer = this.add.container(0, 0);
    this.figureLayer.setDepth(5);

    // Create dedicated glow landGraphics layer (rendered above all tiles)
    this.glowGraphics = this.add.graphics();
    this.glowGraphics.setDepth(10);

    // Subscribe to STATE_UPDATE events
    const onStateUpdate = (state: GameState) => {
      this.handleStateUpdate(state);
    };
    const onGlowTiles = (positions: LandPosition[]) => {
      glowLands(this.glowGraphics, positions);
    };
    const onClearGlow = () => {
      unGlowLands(this.glowGraphics);
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
      this.pendingClickTile = getLandByPoint(pointer, this.mapDimensions);

      if (pointer.rightButtonDown()) {
        // Right-click → show land info popup right away (not deferred to pointerup)
        if (this.pendingClickTile) {
          const mouseEvent = pointer.event as MouseEvent;
          const screenX = mouseEvent?.clientX ?? pointer.x;
          const screenY = mouseEvent?.clientY ?? pointer.y;
          phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, {
            pos: this.pendingClickTile,
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
        phaserEventBus.emit(PhaserEvents.TILE_CLICKED, this.pendingClickTile);
      }
      this.isDragging = false;
      this.pendingClickTile = undefined;
    });

    // wheel: scroll camera with mouse wheel and trackpad (including Apple Magic Mouse / trackpad
    // two-finger horizontal swipe which populates deltaX)
    this.input.on(
      'wheel',
      (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], deltaX: number, deltaY: number) => {
        if (this.cameras?.main) {
          this.cameras.main.scrollX += deltaX;
          this.cameras.main.scrollY += deltaY;
        }
      }
    );

    phaserEventBus.emit(PhaserEvents.SCENE_READY, WorldMapScene.KEY);
  }

  private handleStateUpdate(state: GameState): void {
    if (
      !this.landGraphics ||
      !this.landsLayer ||
      !this.backgroundTile ||
      !this.figureLayer ||
      !this.wallLayer ||
      !this.buildingLayer
    )
      return;

    if (!this.isInitialized) {
      this.mapDimensions = getMapDimensions(state);
      drawBackgroundLayer(this.backgroundTile, this, this.mapDimensions);
      initLandLayer(this.landsLayer, this.landGraphics, this, state);
      drawWallLayer(this.wallLayer, this, state);
      drawBuildingLayer(this.buildingLayer, this, state);
      drawArmyFiguresLayer(this.figureLayer, this, state);
      this.isInitialized = true;
    } else {
      drawLandLayer(this.landsLayer, this.landGraphics, this, state);
      drawWallLayer(this.wallLayer, this, state);
      drawBuildingLayer(this.buildingLayer, this, state);
      drawArmyFiguresLayer(this.figureLayer, this, state);
    }
  }
}
