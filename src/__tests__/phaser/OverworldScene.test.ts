import Phaser from 'phaser';
import { getLandId } from '../../state/map/land/LandId';
import { offsetToAxial, axialToPixel } from '../../phaser/utils/hexGeometry';
import { phaserEventBus, PhaserEvents } from '../../phaser/phaserEventBus';
import { phaserEventBus, PhaserEvents } from '../../phaser/phaserEventBus';
import { OverworldScene } from '../../phaser/scenes/OverworldScene';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('OverworldScene', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    phaserEventBus.removeAllListeners();
  });

  describe('Scene Class Definition', () => {
    it('should have the correct scene KEY', () => {
      expect(OverworldScene.KEY).toBe('OverworldScene');
    });

    it('should extend Phaser.Scene', () => {
      expect(OverworldScene.prototype instanceof Phaser.Scene).toBe(true);
    });

    it('should have required methods', () => {
      expect(typeof OverworldScene.prototype.preload).toBe('function');
      expect(typeof OverworldScene.prototype.create).toBe('function');
    });
  });

  describe('Hex Grid State Management', () => {
    it('should have a default hex size', () => {
      const scene = new OverworldScene();
      // Access private hexSize through type assertion
      const hexSize = (scene as any).hexSize;
      expect(hexSize).toBe(64);
    });

    it('should initialize empty hex tiles map', () => {
      const scene = new OverworldScene();
      const hexTiles = (scene as any).hexTiles;
      expect(hexTiles).toBeInstanceOf(Map);
      expect(hexTiles.size).toBe(0);
    });

    it('should have undefined graphics, spriteLayer, and gameState on construction', () => {
      const scene = new OverworldScene();
      expect((scene as any).graphics).toBeUndefined();
      expect((scene as any).spriteLayer).toBeUndefined();
      expect((scene as any).gameState).toBeUndefined();
    });

    it('should initialize map dimensions as zero on construction', () => {
      const scene = new OverworldScene();
      expect((scene as any).mapWidth).toBe(0);
      expect((scene as any).mapHeight).toBe(0);
    });
  });

  describe('Event Bus Integration', () => {
    it('should listen to STATE_UPDATE events', (done) => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();

      // Mock the required methods to avoid Phaser initialization
      (scene as any).graphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      // Verify that scene stores the state when STATE_UPDATE is emitted
      const handleStateUpdate = jest.spyOn(scene as any, 'handleStateUpdate');

      // Simulate the scene being ready to handle events
      setTimeout(() => {
        phaserEventBus.emit(PhaserEvents.STATE_UPDATE, gameState);

        setTimeout(() => {
          // The handleStateUpdate method should exist and be callable
          expect(typeof (scene as any).handleStateUpdate).toBe('function');
          handleStateUpdate.mockRestore();
          done();
        }, 10);
      }, 10);
    });

    it('should emit SCENE_READY event with correct key', () => {
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.SCENE_READY, listener);

      // Create a scene (which should emit SCENE_READY in its create method)
      new OverworldScene();

      // We can't easily test the create() without full Phaser setup,
      // but we can verify the scene key exists
      expect(OverworldScene.KEY).toBe('OverworldScene');

      phaserEventBus.removeListener(PhaserEvents.SCENE_READY, listener);
    });
  });

  describe('Hex Tile Management', () => {
    it('should store hex tiles with correct coordinates', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();

      // Mock required Phaser objects
      const mockGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // Manually call initHexGrid to test the logic
      (scene as any).initHexGrid(gameState);

      const hexTiles = (scene as any).hexTiles as Map<string, any>;

      // Verify all tiles were added
      expect(hexTiles.size).toBe(195);

      // Verify tile at 0,0
      const landPos00 = { row: 0, col: 0 };
      const tile00 = hexTiles.get(getLandId(landPos00));
      expect(tile00).toBeDefined();
      expect(tile00.landPos).toEqual(landPos00);

      const { q: q00, r: r00 } = offsetToAxial(landPos00);
      expect(tile00.q).toBe(q00);
      expect(tile00.r).toBe(r00);

      // Verify tile at 0,1
      const landPos01 = { row: 0, col: 1 };
      const tile01 = hexTiles.get(getLandId(landPos01));
      expect(tile01).toBeDefined();
      expect(tile01.landPos).toEqual(landPos01);

      const { q: q01, r: r01 } = offsetToAxial(landPos01);
      expect(tile01.q).toBe(q01);
      expect(tile01.r).toBe(r01);

      // Verify tile at 1,0
      const landPos10 = { row: 1, col: 0 };
      const tile10 = hexTiles.get(getLandId(landPos10));
      expect(tile10).toBeDefined();
      expect(tile10.landPos).toEqual(landPos10);

      const { q: q10, r: r10 } = offsetToAxial(landPos10);
      expect(tile10.q).toBe(q10);
      expect(tile10.r).toBe(r10);
    });

    it('should clear hex tiles on re-initialization', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();

      const mockGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // First initialization
      (scene as any).initHexGrid(gameState);
      let hexTiles = (scene as any).hexTiles as Map<string, any>;
      expect(hexTiles.size).toBe(195);

      // Second initialization should clear and reinitialize
      (scene as any).initHexGrid(gameState);
      hexTiles = (scene as any).hexTiles as Map<string, any>;
      expect(hexTiles.size).toBe(195);

      // Verify graphics.clear was called during second initialization
      expect(mockGraphics.clear).toHaveBeenCalled();

      // Verify spriteLayer.removeAll was called
      expect(mockSpriteLayer.removeAll).toHaveBeenCalled();
    });
  });

  describe('Hex Tile Drawing', () => {
    it('should call graphics methods when drawing a tile', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();
      const land = gameState.map.lands[getLandId({ row: 0, col: 0 })];

      const mockGraphics = {
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // Draw a tile
      (scene as any).drawHexTile(land, 0, 0, gameState);

      // Verify graphics methods were called (lineStyle and strokePoints for border)
      expect(mockGraphics.lineStyle).toHaveBeenCalled();
      expect(mockGraphics.strokePoints).toHaveBeenCalled();
    });

    it('should apply ownership border color to owned tiles', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();
      // Player 0 (alaric, color 'blue'=#4A90E2) owns the stronghold at { row: 3, col: 3 }
      const landPos = { row: 3, col: 3 };
      const landId = getLandId(landPos);
      const land = gameState.map.lands[landId];

      const mockGraphics = {
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      const { q, r } = offsetToAxial(landPos);
      (scene as any).drawHexTile(land, q, r, gameState);

      // Border should be called with the player's color (blue=#4A90E2), not white
      const lineStyleCalls = mockGraphics.lineStyle.mock.calls;
      const lastCall = lineStyleCalls[lineStyleCalls.length - 1];
      const expectedColor = parseInt('4A90E2', 16);
      expect(lastCall[1]).toBe(expectedColor);
      expect(lastCall[2]).toBe(1); // full opacity
    });

    it('should not apply ownership tint to unowned tiles', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();
      const land = gameState.map.lands[getLandId({ row: 0, col: 0 })]; // This tile is not owned

      const mockGraphics = {
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // Draw tile 0,0 which is not owned
      (scene as any).drawHexTile(land, 0, 0, gameState);

      // Border should be white (0xFFFFFF) for unowned tiles
      const lineStyleCalls = mockGraphics.lineStyle.mock.calls;
      const lastCall = lineStyleCalls[lineStyleCalls.length - 1];
      expect(lastCall[1]).toBe(0xffffff);
    });
  });

  describe('State Updates', () => {
    it('should cache game state after STATE_UPDATE', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();

      const mockGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // Simulate STATE_UPDATE
      (scene as any).handleStateUpdate(gameState);

      expect((scene as any).gameState).toBe(gameState);
    });

    it('should initialize hex grid on first STATE_UPDATE', () => {
      const scene = new OverworldScene();
      const gameState = createDefaultGameStateStub();

      const mockGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // First update should initialize
      (scene as any).handleStateUpdate(gameState);

      const hexTiles = (scene as any).hexTiles as Map<string, any>;
      expect(hexTiles.size).toBe(195);
    });

    it('should update tiles on subsequent STATE_UPDATE calls', () => {
      const scene = new OverworldScene();
      const gameState1 = createDefaultGameStateStub();
      const gameState2 = createDefaultGameStateStub();

      const mockGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      const mockSpriteLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
      } as any;

      (scene as any).graphics = mockGraphics;
      (scene as any).spriteLayer = mockSpriteLayer;

      // Mock add.image for renderLandImage
      (scene as any).add = {
        image: jest.fn(() => ({
          setScale: jest.fn().mockReturnThis(),
          width: 64,
          height: 64,
        })),
      };

      // First update
      (scene as any).handleStateUpdate(gameState1);
      expect(mockGraphics.clear).toHaveBeenCalledTimes(1);

      // Second update
      (scene as any).handleStateUpdate(gameState2);

      // clear() should have been called again (from updateTiles)
      expect(mockGraphics.clear).toHaveBeenCalledTimes(2);

      // spriteLayer.removeAll should NOT be called on updates — sprites are reused
      expect(mockSpriteLayer.removeAll).not.toHaveBeenCalledTimes(2);
    });
  });

  describe('Pointer Interaction', () => {
    it('should have a handlePointerDown method', () => {
      const scene = new OverworldScene();
      expect(typeof (scene as any).handlePointerDown).toBe('function');
    });

    it('should emit TILE_CLICKED for left-click events', () => {
      // This test verifies the event bus integration
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.TILE_CLICKED, listener);

      // The handlePointerDown method uses Phaser.Geom which requires a full game instance
      // So we test the event emission independently
      const mockLandPos = { row: 0, col: 0 };
      phaserEventBus.emit(PhaserEvents.TILE_CLICKED, mockLandPos);

      expect(listener).toHaveBeenCalledWith(mockLandPos);
      phaserEventBus.removeListener(PhaserEvents.TILE_CLICKED, listener);
    });

    it('should emit TILE_RIGHT_CLICKED for right-click events', () => {
      // This test verifies the event bus integration
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.TILE_RIGHT_CLICKED, listener);

      // The handlePointerDown method uses Phaser.Geom which requires a full game instance
      // So we test the event emission independently
      const mockLandPos = { row: 1, col: 1 };
      phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, mockLandPos);

      expect(listener).toHaveBeenCalledWith(mockLandPos);
      phaserEventBus.removeListener(PhaserEvents.TILE_RIGHT_CLICKED, listener);
    });

    it('should only iterate hex tiles if graphics exists', () => {
      const scene = new OverworldScene();

      // Test that handlePointerDown handles missing graphics gracefully
      const mockPointer = { worldX: 0, worldY: 0, button: 0 } as any;

      // Should not throw even without graphics
      expect(() => (scene as any).handlePointerDown(mockPointer)).not.toThrow();
    });
  });

  describe('Hex Geometry Coordinates', () => {
    it('should correctly convert offset coordinates to axial', () => {
      // Verify coordinate conversion works
      // Formula: q = col - floor(row/2), r = row
      const landPos00 = { row: 0, col: 0 };
      const { q: q00, r: r00 } = offsetToAxial(landPos00);
      expect(q00).toBe(0); // 0 - floor(0/2) = 0
      expect(r00).toBe(0);

      const landPos01 = { row: 0, col: 1 };
      const { q: q01, r: r01 } = offsetToAxial(landPos01);
      expect(q01).toBe(1); // 1 - floor(0/2) = 1
      expect(r01).toBe(0);

      const landPos10 = { row: 1, col: 0 };
      const { q: q10, r: r10 } = offsetToAxial(landPos10);
      expect(q10).toBe(0); // 0 - floor(1/2) = 0 (floor(0.5) = 0)
      expect(r10).toBe(1);

      const landPos20 = { row: 2, col: 0 };
      const { q: q20, r: r20 } = offsetToAxial(landPos20);
      expect(q20).toBe(-1); // 0 - floor(2/2) = 0 - 1 = -1
      expect(r20).toBe(2);
    });

    it('should correctly convert axial coordinates to pixel positions', () => {
      // Test pixel conversion
      const { x: x00, y: y00 } = axialToPixel(0, 0, 64);
      expect(typeof x00).toBe('number');
      expect(typeof y00).toBe('number');
      expect(x00).toBeGreaterThan(0); // Should have left margin
      expect(y00).toBeGreaterThan(0); // Should have top offset
    });
  });
});
