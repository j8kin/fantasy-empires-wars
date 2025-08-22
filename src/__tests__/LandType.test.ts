import { LAND_TYPES, LandType } from '../types/LandType';

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

        // Check property types
        expect(typeof landData.id).toBe('string');
        expect(typeof landData.name).toBe('string');
        expect(typeof landData.alignment).toBe('string');
        expect(Array.isArray(landData.relatedLands)).toBe(true);
        expect(typeof landData.imageName).toBe('string');
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
      });
    });
  });
});
