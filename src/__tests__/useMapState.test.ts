import { renderHook, act } from '@testing-library/react';
import { useMapState } from '../hooks/useMapState';
import { LAND_TYPES } from '../types/LandType';
import { HexTileState } from '../types/HexTileState';
import { BattlefieldSize } from '../types/BattlefieldSize';

describe('useMapState Gold Generation', () => {
  describe('Map Initialization', () => {
    it('should initialize tiles with gold values within land type ranges', () => {
      const { result } = renderHook(() => useMapState('small'));

      const tiles = Object.values(result.current.mapState.tiles);

      tiles.forEach((tile) => {
        const landType = tile.landType;
        const expectedRange = landType.goldPerTurn;

        expect(tile.goldPerTurn).toBeGreaterThanOrEqual(expectedRange.min);
        expect(tile.goldPerTurn).toBeLessThanOrEqual(expectedRange.max);
        expect(Number.isInteger(tile.goldPerTurn)).toBe(true);
      });
    });

    it('should generate different gold values for the same land type', () => {
      // Run multiple initializations and check for variability
      const goldValues: number[] = [];

      for (let i = 0; i < 50; i++) {
        const { result } = renderHook(() => useMapState('medium'));
        const tiles = Object.values(result.current.mapState.tiles);

        // Find tiles with plains land type (should have range 2-4)
        const plainsTiles = tiles.filter((tile) => tile.landType.id === 'plains');
        if (plainsTiles.length > 0) {
          goldValues.push(plainsTiles[0].goldPerTurn);
        }
      }

      // Should have different values within the range
      const uniqueValues = new Set(goldValues);
      expect(uniqueValues.size).toBeGreaterThan(1);

      // All values should be within the expected range for plains (2-4)
      goldValues.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(2);
        expect(value).toBeLessThanOrEqual(4);
      });
    });

    it('should respect land type gold ranges for all land types', () => {
      const { result } = renderHook(() => useMapState('large'));
      const tiles = Object.values(result.current.mapState.tiles);

      // Group tiles by land type
      const tilesByLandType: { [key: string]: HexTileState[] } = {};
      tiles.forEach((tile) => {
        if (!tilesByLandType[tile.landType.id]) {
          tilesByLandType[tile.landType.id] = [];
        }
        tilesByLandType[tile.landType.id].push(tile);
      });

      // Check each land type
      Object.keys(LAND_TYPES).forEach((landTypeId) => {
        const landType = LAND_TYPES[landTypeId];
        const tilesOfType = tilesByLandType[landTypeId];

        if (tilesOfType && tilesOfType.length > 0) {
          tilesOfType.forEach((tile) => {
            expect(tile.goldPerTurn).toBeGreaterThanOrEqual(landType.goldPerTurn.min);
            expect(tile.goldPerTurn).toBeLessThanOrEqual(landType.goldPerTurn.max);
          });
        }
      });
    });

    it('should generate valid gold values for zero-minimum land types', () => {
      const { result } = renderHook(() => useMapState('medium'));
      const tiles = Object.values(result.current.mapState.tiles);

      // Find tiles with land types that have min: 0 (desert, volcano, etc.)
      const zeroMinTiles = tiles.filter((tile) => tile.landType.goldPerTurn.min === 0);

      expect(zeroMinTiles.length).toBeGreaterThan(0);

      zeroMinTiles.forEach((tile) => {
        expect(tile.goldPerTurn).toBeGreaterThanOrEqual(0);
        expect(tile.goldPerTurn).toBeLessThanOrEqual(tile.landType.goldPerTurn.max);
      });
    });
  });

  describe('Map Size Variations', () => {
    it('should generate appropriate gold values for all map sizes', () => {
      const mapSizes: BattlefieldSize[] = ['small', 'medium', 'large', 'huge'];

      mapSizes.forEach((size) => {
        const { result } = renderHook(() => useMapState(size));
        const tiles = Object.values(result.current.mapState.tiles);

        expect(tiles.length).toBeGreaterThan(0);

        tiles.forEach((tile) => {
          const expectedRange = tile.landType.goldPerTurn;
          expect(tile.goldPerTurn).toBeGreaterThanOrEqual(expectedRange.min);
          expect(tile.goldPerTurn).toBeLessThanOrEqual(expectedRange.max);
        });
      });
    });
  });

  describe('Map Regeneration', () => {
    it('should generate new gold values when changing map size', () => {
      const { result } = renderHook(() => useMapState('small'));

      // Get initial tiles
      const initialTiles = Object.values(result.current.mapState.tiles);

      // Change map size
      act(() => {
        result.current.changeBattlefieldSize('medium');
      });

      // Get new tiles
      const newTiles = Object.values(result.current.mapState.tiles);

      // Should have different gold values (high probability)
      // Since we're changing map size, we'll have different tiles entirely
      expect(newTiles.length).not.toBe(initialTiles.length);

      // All new values should still be within valid ranges
      newTiles.forEach((tile) => {
        const expectedRange = tile.landType.goldPerTurn;
        expect(tile.goldPerTurn).toBeGreaterThanOrEqual(expectedRange.min);
        expect(tile.goldPerTurn).toBeLessThanOrEqual(expectedRange.max);
      });
    });
  });

  describe('Statistical Distribution', () => {
    it('should generate reasonable distribution across range for large sample', () => {
      // Test with mountains (range 4-6) to check distribution
      const goldValues: number[] = [];

      // Generate multiple maps to get good sample size
      for (let i = 0; i < 20; i++) {
        const { result } = renderHook(() => useMapState('large'));
        const tiles = Object.values(result.current.mapState.tiles);

        // Collect gold values from mountain tiles
        const mountainTiles = tiles.filter((tile) => tile.landType.id === 'mountains');
        mountainTiles.forEach((tile) => goldValues.push(tile.goldPerTurn));
      }

      if (goldValues.length > 10) {
        // Should have values across the range
        expect(goldValues.some((val) => val === 4)).toBe(true); // min value
        expect(goldValues.some((val) => val === 6)).toBe(true); // max value

        // Average should be reasonably close to middle of range (5)
        const average = goldValues.reduce((sum, val) => sum + val, 0) / goldValues.length;
        expect(average).toBeGreaterThan(4.5);
        expect(average).toBeLessThan(5.5);
      }
    });
  });
});
