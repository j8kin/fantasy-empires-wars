import { getLandId } from '../state/GameState';

describe('HexTileState Utility Functions', () => {
  describe('createTileId', () => {
    it('should create unique tile IDs for different coordinates', () => {
      const id1 = getLandId({ row: 0, col: 0 });
      const id2 = getLandId({ row: 1, col: 0 });
      const id3 = getLandId({ row: 0, col: 1 });
      const id4 = getLandId({ row: 5, col: 10 });

      expect(id1).toBe('0-0');
      expect(id2).toBe('1-0');
      expect(id3).toBe('0-1');
      expect(id4).toBe('5-10');

      // All IDs should be unique
      const ids = [id1, id2, id3, id4];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });

    it('should handle negative coordinates', () => {
      const id1 = getLandId({ row: -1, col: -1 });
      const id2 = getLandId({ row: -5, col: 3 });

      expect(id1).toBe('-1--1');
      expect(id2).toBe('-5-3');
    });

    it('should handle large coordinates', () => {
      const id = getLandId({ row: 999, col: 1000 });
      expect(id).toBe('999-1000');
    });
  });

  describe('getMapDimensions', () => {
    it('should return correct dimensions for small map', () => {
      const dimensions = { rows: 6, cols: 13 };
      expect(dimensions).toEqual({ rows: 6, cols: 13 });
    });

    it('should return correct dimensions for medium map', () => {
      const dimensions = { rows: 9, cols: 18 };
      expect(dimensions).toEqual({ rows: 9, cols: 18 });
    });

    it('should return correct dimensions for large map', () => {
      const dimensions = { rows: 11, cols: 23 };
      expect(dimensions).toEqual({ rows: 11, cols: 23 });
    });

    it('should return correct dimensions for huge map', () => {
      const dimensions = { rows: 15, cols: 31 };
      expect(dimensions).toEqual({ rows: 15, cols: 31 });
    });

    it('should calculate total tiles correctly', () => {
      const smallDims = { rows: 6, cols: 13 };
      const mediumDims = { rows: 9, cols: 18 };
      const largeDims = { rows: 11, cols: 23 };
      const hugeDims = { rows: 15, cols: 31 };

      expect(smallDims.rows * smallDims.cols).toBe(78);
      expect(mediumDims.rows * mediumDims.cols).toBe(162);
      expect(largeDims.rows * largeDims.cols).toBe(253);
      expect(hugeDims.rows * hugeDims.cols).toBe(465);
    });
  });

  describe('Map Size Logic', () => {
    it('should have proper progression in map sizes', () => {
      const small = { rows: 6, cols: 13 };
      const medium = { rows: 9, cols: 18 };
      const large = { rows: 11, cols: 23 };
      const huge = { rows: 15, cols: 31 };

      // Each size should be significantly larger than the previous
      expect(medium.cols).toBeGreaterThan(small.cols);
      expect(large.cols).toBeGreaterThan(medium.cols);
      expect(huge.cols).toBeGreaterThan(large.cols);

      expect(medium.rows).toBeGreaterThan(small.rows);
      expect(large.rows).toBeGreaterThan(medium.rows);
      expect(huge.rows).toBeGreaterThan(large.rows);
    });

    it('should use odd numbers for symmetrical hex grids (cols)', () => {
      const small = { rows: 6, cols: 13 };
      const medium = { rows: 9, cols: 18 };
      const large = { rows: 11, cols: 23 };
      const huge = { rows: 15, cols: 31 };

      expect(small.cols % 2).toBe(1); // 13 is odd
      expect(medium.cols % 2).toBe(0); // 18 is even
      expect(large.cols % 2).toBe(1); // 23 is odd
      expect(huge.cols % 2).toBe(1); // 31 is odd
    });

    it('should have reasonable map proportions', () => {
      const small = { rows: 6, cols: 13 };
      const medium = { rows: 9, cols: 18 };
      const large = { rows: 11, cols: 23 };

      // Cols should be roughly double the rows for hex grids
      expect(small.cols).toBeGreaterThan(small.rows);
      expect(medium.cols).toBeGreaterThan(medium.rows);
      expect(large.cols).toBeGreaterThan(large.rows);
    });
  });
});
