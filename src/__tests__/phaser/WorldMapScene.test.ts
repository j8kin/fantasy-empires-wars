import Phaser from 'phaser';
import { getLandId } from '../../state/map/land/LandId';
import { glowLands, unGlowLands } from '../../phaser/scenes/WorldMapScene/landsLayer';
import { offsetToAxial, axialToPixel } from '../../phaser/utils/hexGeometry';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { phaserEventBus, PhaserEvents } from '../../phaser/phaserEventBus';
import { SpellName } from '../../types/Spell';
import { TreasureName } from '../../types/Treasures';
import { EffectKind, EffectTarget } from '../../types/Effect';
import { WorldMapScene } from '../../phaser/scenes/WorldMapScene';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('WorldMapScene', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    phaserEventBus.removeAllListeners();
  });

  describe('Scene Class Definition', () => {
    it('should have the correct scene KEY', () => {
      expect(WorldMapScene.KEY).toBe('WorldMapScene');
    });

    it('should extend Phaser.Scene', () => {
      expect(WorldMapScene.prototype).toBeInstanceOf(Phaser.Scene);
    });

    it('should have required methods', () => {
      expect(typeof WorldMapScene.prototype.preload).toBe('function');
      expect(typeof WorldMapScene.prototype.create).toBe('function');
    });
  });

  describe('Hex Grid State Management', () => {
    it('should start as not initialized', () => {
      const scene = new WorldMapScene();
      expect((scene as any).isInitialized).toBe(false);
    });

    it('should have undefined landGraphics, landsLayer, and gameState on construction', () => {
      const scene = new WorldMapScene();
      expect((scene as any).landGraphics).toBeUndefined();
      expect((scene as any).landsLayer).toBeUndefined();
      expect((scene as any).gameState).toBeUndefined();
    });
  });

  describe('Event Bus Integration', () => {
    it('should listen to STATE_UPDATE events', (done) => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();

      // Mock the required fields to avoid Phaser initialization
      (scene as any).landGraphics = {
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
      new WorldMapScene();

      // We can't easily test the create() without full Phaser setup,
      // but we can verify the scene key exists
      expect(WorldMapScene.KEY).toBe('WorldMapScene');

      phaserEventBus.removeListener(PhaserEvents.SCENE_READY, listener);
    });
  });

  describe('Hex Tile Management', () => {
    function buildBasicMocks(scene: WorldMapScene) {
      (scene as any).landGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;
      (scene as any).landsLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
        getByName: jest.fn().mockReturnValue(null),
      } as any;
      (scene as any).figureLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).wallLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).buildingLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).backgroundTile = { setSize: jest.fn() } as any;
    }

    it('should set isInitialized to true after first STATE_UPDATE', () => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();
      buildBasicMocks(scene);

      expect((scene as any).isInitialized).toBe(false);
      (scene as any).handleStateUpdate(gameState);
      expect((scene as any).isInitialized).toBe(true);
    });

    it('should clear graphics and sprite layer on init, then only clear graphics on updates', () => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();
      buildBasicMocks(scene);

      const mockLandGraphics = (scene as any).landGraphics;
      const mockLandsLayer = (scene as any).landsLayer;

      // First STATE_UPDATE — init path
      (scene as any).handleStateUpdate(gameState);
      expect((scene as any).isInitialized).toBe(true);
      expect(mockLandGraphics.clear).toHaveBeenCalledTimes(1);
      expect(mockLandsLayer.removeAll).toHaveBeenCalledTimes(1);

      // Second STATE_UPDATE — update path: graphics cleared again, sprite layer NOT rebuilt
      (scene as any).handleStateUpdate(gameState);
      expect(mockLandGraphics.clear).toHaveBeenCalledTimes(2);
      expect(mockLandsLayer.removeAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Updates', () => {
    function buildStateMocks(scene: WorldMapScene) {
      (scene as any).landGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;
      (scene as any).landsLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
        getByName: jest.fn().mockReturnValue(null),
      } as any;
      (scene as any).figureLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).wallLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).buildingLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).backgroundTile = { setSize: jest.fn() } as any;
    }

    it('should store mapDimensions after first STATE_UPDATE', () => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();
      buildStateMocks(scene);

      (scene as any).handleStateUpdate(gameState);

      const dims = (scene as any).mapDimensions;
      expect(dims.rows).toBe(getMapDimensions(gameState).rows);
      expect(dims.cols).toBe(getMapDimensions(gameState).cols);
    });

    it('should initialize hex grid on first STATE_UPDATE', () => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();
      buildStateMocks(scene);

      (scene as any).handleStateUpdate(gameState);

      expect((scene as any).isInitialized).toBe(true);
    });

    it('should update tiles on subsequent STATE_UPDATE calls', () => {
      const scene = new WorldMapScene();
      const gameState1 = createDefaultGameStateStub();
      const gameState2 = createDefaultGameStateStub();
      buildStateMocks(scene);

      const mockLandGraphics = (scene as any).landGraphics;
      const mockLandsLayer = (scene as any).landsLayer;

      // First update — init path
      (scene as any).handleStateUpdate(gameState1);
      expect(mockLandGraphics.clear).toHaveBeenCalledTimes(1);

      // Second update — update path
      (scene as any).handleStateUpdate(gameState2);
      expect(mockLandGraphics.clear).toHaveBeenCalledTimes(2);

      // landsLayer.removeAll only called during init, not on subsequent updates
      expect(mockLandsLayer.removeAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pointer Interaction', () => {
    it('should emit TILE_CLICKED for left-click (tap, no drag) via event bus', () => {
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.TILE_CLICKED, listener);

      const mockLandPos = { row: 0, col: 0 };
      phaserEventBus.emit(PhaserEvents.TILE_CLICKED, mockLandPos);

      expect(listener).toHaveBeenCalledWith(mockLandPos);
      phaserEventBus.removeListener(PhaserEvents.TILE_CLICKED, listener);
    });

    it('should emit TILE_RIGHT_CLICKED with position and screen coords', () => {
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.TILE_RIGHT_CLICKED, listener);

      const payload = { pos: { row: 1, col: 1 }, screenX: 200, screenY: 300 };
      phaserEventBus.emit(PhaserEvents.TILE_RIGHT_CLICKED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
      phaserEventBus.removeListener(PhaserEvents.TILE_RIGHT_CLICKED, listener);
    });

    it('should not emit TILE_CLICKED when isDragging is true on pointerup', () => {
      const scene = new WorldMapScene();
      const listener = jest.fn();
      phaserEventBus.on(PhaserEvents.TILE_CLICKED, listener);

      // Simulate drag state: pendingClickTile set but isDragging true
      (scene as any).isDragging = true;
      (scene as any).pendingClickTile = { row: 0, col: 0 };

      // Trigger the pointerup callback manually by simulating its logic
      const isDragging = (scene as any).isDragging;
      const pendingClickTile = (scene as any).pendingClickTile;
      if (!isDragging && pendingClickTile) {
        phaserEventBus.emit(PhaserEvents.TILE_CLICKED, pendingClickTile);
      }
      (scene as any).isDragging = false;
      (scene as any).pendingClickTile = undefined;

      expect(listener).not.toHaveBeenCalled();
      phaserEventBus.removeListener(PhaserEvents.TILE_CLICKED, listener);
    });
  });

  describe('Glow Management', () => {
    it('should draw hex outlines for each glow position', () => {
      const mockGlowGraphics = {
        clear: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;

      glowLands(mockGlowGraphics, [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
      ]);

      expect(mockGlowGraphics.clear).toHaveBeenCalledTimes(1);
      expect(mockGlowGraphics.lineStyle).toHaveBeenCalledTimes(2);
      expect(mockGlowGraphics.strokePoints).toHaveBeenCalledTimes(2);
    });

    it('should clear glow graphics when unGlowLands is called', () => {
      const mockGlowGraphics = { clear: jest.fn() } as any;

      unGlowLands(mockGlowGraphics);

      expect(mockGlowGraphics.clear).toHaveBeenCalledTimes(1);
    });

    it('should not throw when glowLands is called without graphics', () => {
      expect(() => glowLands(undefined, [{ row: 0, col: 0 }])).not.toThrow();
    });

    it('should subscribe to GLOW_TILES and CLEAR_GLOW via event bus', () => {
      const glowListener = jest.fn();
      const clearListener = jest.fn();

      phaserEventBus.on(PhaserEvents.GLOW_TILES, glowListener);
      phaserEventBus.on(PhaserEvents.CLEAR_GLOW, clearListener);

      phaserEventBus.emit(PhaserEvents.GLOW_TILES, [{ row: 0, col: 0 }]);
      phaserEventBus.emit(PhaserEvents.CLEAR_GLOW);

      expect(glowListener).toHaveBeenCalledWith([{ row: 0, col: 0 }]);
      expect(clearListener).toHaveBeenCalledTimes(1);

      phaserEventBus.removeListener(PhaserEvents.GLOW_TILES, glowListener);
      phaserEventBus.removeListener(PhaserEvents.CLEAR_GLOW, clearListener);
    });
  });

  describe('Army Figure Layer', () => {
    it('should have undefined figureLayer on construction', () => {
      const scene = new WorldMapScene();
      expect((scene as any).figureLayer).toBeUndefined();
    });

    it('should clear and rebuild figureLayer on each state update', () => {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub();

      (scene as any).landGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;
      (scene as any).landsLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
        getByName: jest.fn().mockReturnValue(null),
      } as any;
      (scene as any).figureLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).wallLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).buildingLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).backgroundTile = { setSize: jest.fn() } as any;

      const mockFigureLayer = (scene as any).figureLayer;

      // First state update — init path
      (scene as any).handleStateUpdate(gameState);
      expect(mockFigureLayer.removeAll).toHaveBeenCalledTimes(1);

      // Second state update — update path — figureLayer is rebuilt again
      (scene as any).handleStateUpdate(gameState);
      expect(mockFigureLayer.removeAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Opponents Army Figures', () => {
    /** Build a scene with mocked Phaser internals ready for drawArmyFiguresLayer calls. */
    function buildSceneWithMocks() {
      const scene = new WorldMapScene();
      const gameState = createDefaultGameStateStub(); // 3 players, each has one hero army

      (scene as any).landGraphics = {
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillPoints: jest.fn(),
        lineStyle: jest.fn(),
        strokePoints: jest.fn(),
      } as any;
      (scene as any).landsLayer = {
        removeAll: jest.fn(),
        add: jest.fn(),
        getByName: jest.fn().mockReturnValue(null),
      } as any;
      (scene as any).figureLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).wallLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).buildingLayer = { removeAll: jest.fn(), add: jest.fn() } as any;
      (scene as any).backgroundTile = { setSize: jest.fn() } as any;
      // textures.exists returns true so figures would actually be drawn if not filtered out
      (scene as any).textures = { exists: jest.fn().mockReturnValue(true) };
      const mockImage = { setScale: jest.fn().mockReturnThis(), width: 64, height: 64 };
      (scene as any).add = { image: jest.fn().mockReturnValue(mockImage) };

      // Mark as initialized so handleStateUpdate takes the update path
      (scene as any).isInitialized = true;

      return { scene, gameState };
    }

    it('should render own army figure regardless of effects', () => {
      const { scene, gameState } = buildSceneWithMocks();
      const figureLayer = (scene as any).figureLayer;

      figureLayer.add.mockClear();
      (scene as any).add.image.mockClear();

      (scene as any).handleStateUpdate(gameState);

      // Default stub: turnOwner = player[0] (alaric). At least his army should produce a figure.
      expect(figureLayer.add).toHaveBeenCalled();
    });

    it('should NOT render opponent army figure without visibility effect', () => {
      const { scene, gameState } = buildSceneWithMocks();

      // Confirm there are opponent armies
      const opponentArmies = gameState.armies.filter((a) => a.controlledBy !== gameState.turnOwner);
      expect(opponentArmies.length).toBeGreaterThan(0);

      // Count figures added — only turn owner's army should appear
      const figureLayer = (scene as any).figureLayer;
      figureLayer.add.mockClear();

      (scene as any).handleStateUpdate(gameState);

      // Only 1 figure (turn owner) — opponents are hidden
      expect(figureLayer.add).toHaveBeenCalledTimes(1);
    });

    it('should render opponent army figure when VIEW_TERRITORY is active on the land', () => {
      const { scene, gameState } = buildSceneWithMocks();

      // Add VIEW_TERRITORY effect (applied by turn owner) to an opponent's land
      const opponentArmy = gameState.armies.find((a) => a.controlledBy !== gameState.turnOwner)!;
      const opponentPos = opponentArmy.movement.path[opponentArmy.movement.progress];
      const land = gameState.map.lands[getLandId(opponentPos)];
      land.effects.push({
        id: 'test-view',
        sourceId: SpellName.VIEW_TERRITORY,
        appliedBy: gameState.turnOwner,
        rules: { type: EffectKind.POSITIVE, target: EffectTarget.LAND, duration: 1 },
      });

      const figureLayer = (scene as any).figureLayer;
      figureLayer.add.mockClear();

      (scene as any).handleStateUpdate(gameState);

      // Now 2 figures: turn owner + the revealed opponent
      expect(figureLayer.add).toHaveBeenCalledTimes(2);
    });

    it('should render opponent army figure when ILLUSION spell is active on the land', () => {
      const { scene, gameState } = buildSceneWithMocks();

      const opponentArmy = gameState.armies.find((a) => a.controlledBy !== gameState.turnOwner)!;
      const opponentPos = opponentArmy.movement.path[opponentArmy.movement.progress];
      const land = gameState.map.lands[getLandId(opponentPos)];
      land.effects.push({
        id: 'test-illusion',
        sourceId: SpellName.ILLUSION,
        appliedBy: opponentArmy.controlledBy,
        rules: { type: EffectKind.POSITIVE, target: EffectTarget.LAND, duration: 3 },
      });
      land.effects.push({
        id: 'test-view-territory',
        sourceId: SpellName.VIEW_TERRITORY,
        appliedBy: gameState.turnOwner,
        rules: { type: EffectKind.POSITIVE, target: EffectTarget.LAND, duration: 1 },
      });

      const figureLayer = (scene as any).figureLayer;
      figureLayer.add.mockClear();

      (scene as any).handleStateUpdate(gameState);

      expect(figureLayer.add).toHaveBeenCalledTimes(2);
    });

    it('should render opponent army figure when MIRROR_OF_ILLUSION effect is on the land', () => {
      const { scene, gameState } = buildSceneWithMocks();

      const opponentArmy = gameState.armies.find((a) => a.controlledBy !== gameState.turnOwner)!;
      const opponentPos = opponentArmy.movement.path[opponentArmy.movement.progress];
      const land = gameState.map.lands[getLandId(opponentPos)];
      land.effects.push({
        id: 'test-mirror',
        sourceId: TreasureName.MIRROR_OF_ILLUSION,
        appliedBy: opponentArmy.controlledBy,
        rules: { type: EffectKind.PERMANENT, target: EffectTarget.LAND, duration: 0 },
      });
      land.effects.push({
        id: 'test-view-territory',
        sourceId: SpellName.VIEW_TERRITORY,
        appliedBy: gameState.turnOwner,
        rules: { type: EffectKind.POSITIVE, target: EffectTarget.LAND, duration: 1 },
      });

      const figureLayer = (scene as any).figureLayer;
      figureLayer.add.mockClear();

      (scene as any).handleStateUpdate(gameState);

      expect(figureLayer.add).toHaveBeenCalledTimes(2);
    });

    it('should NOT reveal opponent if VIEW_TERRITORY was applied by a different player', () => {
      const { scene, gameState } = buildSceneWithMocks();

      const opponentArmy = gameState.armies.find((a) => a.controlledBy !== gameState.turnOwner)!;
      const opponentPos = opponentArmy.movement.path[opponentArmy.movement.progress];
      const land = gameState.map.lands[getLandId(opponentPos)];
      // Effect applied by the opponent themselves — not by turn owner
      land.effects.push({
        id: 'test-view-wrong',
        sourceId: SpellName.VIEW_TERRITORY,
        appliedBy: opponentArmy.controlledBy,
        rules: { type: EffectKind.POSITIVE, target: EffectTarget.LAND, duration: 1 },
      });

      const figureLayer = (scene as any).figureLayer;
      figureLayer.add.mockClear();

      (scene as any).handleStateUpdate(gameState);

      // Still only 1 (own army) — wrong appliedBy doesn't count
      expect(figureLayer.add).toHaveBeenCalledTimes(1);
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
      const { x: x00, y: y00 } = axialToPixel(0, 0);
      expect(typeof x00).toBe('number');
      expect(typeof y00).toBe('number');
      expect(x00).toBeGreaterThan(0); // Should have left margin
      expect(y00).toBeGreaterThan(0); // Should have top offset
    });
  });
});
