import { LAND_TYPES } from '../types/LandType';

describe('LandType Data Integrity', () => {
  describe('LAND_TYPES Object Structure', () => {
    it('should contain all expected land types', () => {
      const expectedLandTypes = [
        'plains',
        'mountains',
        'hills',
        'darkforest',
        'greenforest',
        'swamp',
        'lava',
        'desert',
        'volcano',
      ];

      expectedLandTypes.forEach((landType) => {
        expect(LAND_TYPES).toHaveProperty(landType);
      });

      expect(Object.keys(LAND_TYPES)).toHaveLength(expectedLandTypes.length);
    });

    it('should have all land types with required properties', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData).toHaveProperty('id');
        expect(landData).toHaveProperty('name');
        expect(landData).toHaveProperty('alignment');
        expect(landData).toHaveProperty('relatedLands');
        expect(landData).toHaveProperty('imageName');
        expect(landData).toHaveProperty('goldPerTurn');

        // Check property types
        expect(typeof landData.id).toBe('string');
        expect(typeof landData.name).toBe('string');
        expect(typeof landData.alignment).toBe('string');
        expect(Array.isArray(landData.relatedLands)).toBe(true);
        expect(typeof landData.imageName).toBe('string');
        expect(typeof landData.goldPerTurn).toBe('object');
      });
    });

    it('should have valid alignment values', () => {
      const validAlignments = ['lawful', 'neutral', 'chaotic'];

      Object.values(LAND_TYPES).forEach((landData) => {
        expect(validAlignments).toContain(landData.alignment);
      });
    });

    it('should have matching image names with land type keys', () => {
      Object.entries(LAND_TYPES).forEach(([landType, landData]) => {
        // Image name should match the land type key
        expect(landData.imageName).toBe(`${landType}.png`);
      });
    });

    it('should have ID matching the key', () => {
      Object.entries(LAND_TYPES).forEach(([landType, landData]) => {
        expect(landData.id).toBe(landType);
      });
    });
  });

  describe('Related Lands Relationships', () => {
    it('should have valid related land references', () => {
      const allLandTypes = Object.keys(LAND_TYPES);

      Object.values(LAND_TYPES).forEach((landData) => {
        landData.relatedLands.forEach((relatedLand) => {
          expect(allLandTypes).toContain(relatedLand);
        });
      });
    });

    it('should not have self-references in related lands', () => {
      Object.entries(LAND_TYPES).forEach(([landType, landData]) => {
        expect(landData.relatedLands).not.toContain(landType);
      });
    });

    it('should have unique related lands (no duplicates)', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        const uniqueRelated = new Set(landData.relatedLands);
        expect(uniqueRelated.size).toBe(landData.relatedLands.length);
      });
    });

    it('should have reasonable number of related lands', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        // Each land should have at least 1 and at most 4 related lands
        expect(landData.relatedLands.length).toBeGreaterThanOrEqual(1);
        expect(landData.relatedLands.length).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('Alignment Distribution', () => {
    it('should have a balanced distribution of alignments', () => {
      const alignmentCounts = {
        lawful: 0,
        neutral: 0,
        chaotic: 0,
      };

      Object.values(LAND_TYPES).forEach((landData) => {
        alignmentCounts[landData.alignment as keyof typeof alignmentCounts]++;
      });

      // Each alignment should have at least one land type
      expect(alignmentCounts.lawful).toBeGreaterThan(0);
      expect(alignmentCounts.neutral).toBeGreaterThan(0);
      expect(alignmentCounts.chaotic).toBeGreaterThan(0);
    });

    it('should have expected alignment assignments', () => {
      // Test specific alignments based on the actual data
      expect(LAND_TYPES.plains.alignment).toBe('neutral');
      expect(LAND_TYPES.mountains.alignment).toBe('lawful');
      expect(LAND_TYPES.hills.alignment).toBe('lawful');
      expect(LAND_TYPES.lava.alignment).toBe('chaotic');
      expect(LAND_TYPES.volcano.alignment).toBe('chaotic');
      expect(LAND_TYPES.swamp.alignment).toBe('chaotic');
      expect(LAND_TYPES.darkforest.alignment).toBe('chaotic');
      expect(LAND_TYPES.greenforest.alignment).toBe('neutral');
      expect(LAND_TYPES.desert.alignment).toBe('neutral');
    });
  });

  describe('Names and Display', () => {
    it('should have proper display names', () => {
      expect(LAND_TYPES.plains.name).toBe('Plains');
      expect(LAND_TYPES.mountains.name).toBe('Mountains');
      expect(LAND_TYPES.greenforest.name).toBe('Green Forest');
      expect(LAND_TYPES.darkforest.name).toBe('Dark Forest');
      expect(LAND_TYPES.hills.name).toBe('Hills');
      expect(LAND_TYPES.swamp.name).toBe('Swamp');
      expect(LAND_TYPES.desert.name).toBe('Desert');
      expect(LAND_TYPES.lava.name).toBe('Lava Fields');
      expect(LAND_TYPES.volcano.name).toBe('Volcano');
    });

    it('should have non-empty names', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData.name.length).toBeGreaterThan(0);
        expect(landData.name.trim()).toBe(landData.name); // No leading/trailing spaces
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent key-id pairs', () => {
      Object.entries(LAND_TYPES).forEach(([key, landData]) => {
        expect(landData.id).toBe(key);
      });
    });

    it('should have all required fields populated', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData.id).toBeTruthy();
        expect(landData.name).toBeTruthy();
        expect(landData.alignment).toBeTruthy();
        expect(landData.imageName).toBeTruthy();
        expect(Array.isArray(landData.relatedLands)).toBe(true);
        expect(landData.goldPerTurn).toBeTruthy();
      });
    });
  });

  describe('Gold Per Turn Ranges', () => {
    it('should have valid goldPerTurn range structure', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData.goldPerTurn).toHaveProperty('min');
        expect(landData.goldPerTurn).toHaveProperty('max');
        expect(typeof landData.goldPerTurn.min).toBe('number');
        expect(typeof landData.goldPerTurn.max).toBe('number');
      });
    });

    it('should have min value less than or equal to max value', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData.goldPerTurn.min).toBeLessThanOrEqual(landData.goldPerTurn.max);
      });
    });

    it('should have non-negative gold values', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        expect(landData.goldPerTurn.min).toBeGreaterThanOrEqual(0);
        expect(landData.goldPerTurn.max).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have reasonable gold ranges', () => {
      Object.values(LAND_TYPES).forEach((landData) => {
        // Gold ranges should be between 0 and 10 for game balance
        expect(landData.goldPerTurn.min).toBeLessThanOrEqual(10);
        expect(landData.goldPerTurn.max).toBeLessThanOrEqual(10);
        
        // Range should not be too wide (max difference of 3)
        const range = landData.goldPerTurn.max - landData.goldPerTurn.min;
        expect(range).toBeLessThanOrEqual(3);
      });
    });

    it('should have expected gold ranges for specific land types', () => {
      // Test specific ranges based on land type characteristics
      expect(LAND_TYPES.plains.goldPerTurn).toEqual({ min: 2, max: 4 });
      expect(LAND_TYPES.mountains.goldPerTurn).toEqual({ min: 4, max: 6 });
      expect(LAND_TYPES.greenforest.goldPerTurn).toEqual({ min: 1, max: 3 });
      expect(LAND_TYPES.darkforest.goldPerTurn).toEqual({ min: 0, max: 2 });
      expect(LAND_TYPES.hills.goldPerTurn).toEqual({ min: 3, max: 5 });
      expect(LAND_TYPES.swamp.goldPerTurn).toEqual({ min: 0, max: 2 });
      expect(LAND_TYPES.desert.goldPerTurn).toEqual({ min: 0, max: 1 });
      expect(LAND_TYPES.lava.goldPerTurn).toEqual({ min: 1, max: 3 });
      expect(LAND_TYPES.volcano.goldPerTurn).toEqual({ min: 0, max: 1 });
    });

    it('should have gold ranges that reflect land type productivity', () => {
      // More productive lands should have higher ranges
      expect(LAND_TYPES.mountains.goldPerTurn.max).toBeGreaterThan(LAND_TYPES.desert.goldPerTurn.max);
      expect(LAND_TYPES.hills.goldPerTurn.max).toBeGreaterThan(LAND_TYPES.swamp.goldPerTurn.max);
      expect(LAND_TYPES.plains.goldPerTurn.min).toBeGreaterThan(LAND_TYPES.volcano.goldPerTurn.min);
    });
  });
});
