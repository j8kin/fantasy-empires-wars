import { BUILDING_TYPES, Building, BuildingType } from '../types/Building';

describe('Building Data Integrity', () => {
  describe('BUILDING_TYPES Object Structure', () => {
    it('should contain all expected building types', () => {
      const expectedBuildings = [
        'mage-tower',
        'barracks',
        'castle-wall',
        'watch-tower',
        'stronghold',
      ];

      expectedBuildings.forEach((buildingId) => {
        expect(BUILDING_TYPES).toHaveProperty(buildingId);
      });

      expect(Object.keys(BUILDING_TYPES)).toHaveLength(expectedBuildings.length);
    });

    it('should have all buildings with required properties', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building).toHaveProperty('id');
        expect(building).toHaveProperty('type');
        expect(building).toHaveProperty('name');
        expect(building).toHaveProperty('goldCost');
        expect(building).toHaveProperty('goldPerTurn');
        expect(building).toHaveProperty('description');

        // Check property types
        expect(typeof building.id).toBe('string');
        expect(typeof building.type).toBe('string');
        expect(typeof building.name).toBe('string');
        expect(typeof building.goldCost).toBe('number');
        expect(typeof building.goldPerTurn).toBe('number');
        expect(typeof building.description).toBe('string');
      });
    });

    it('should have valid BuildingType values', () => {
      const validTypes: BuildingType[] = [
        'mage-tower',
        'barracks',
        'castle-wall',
        'watch-tower',
        'stronghold',
      ];

      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(validTypes).toContain(building.type);
      });
    });

    it('should have matching ID with object key and type', () => {
      Object.entries(BUILDING_TYPES).forEach(([key, building]) => {
        expect(building.id).toBe(key);
        expect(building.type).toBe(key);
      });
    });

    it('should have non-negative numeric values', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.goldCost).toBeGreaterThan(0); // All buildings should cost something
        expect(building.goldPerTurn).toBeGreaterThanOrEqual(0); // Can be 0 or positive
      });
    });

    it('should have non-empty names and descriptions', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.name.length).toBeGreaterThan(0);
        expect(building.name.trim()).toBe(building.name); // No leading/trailing spaces
        expect(building.description.length).toBeGreaterThan(0);
        expect(building.description.trim()).toBe(building.description);
      });
    });
  });

  describe('Building Categories and Functions', () => {
    it('should have military buildings', () => {
      const militaryBuildings = ['barracks', 'castle-wall', 'stronghold'];

      militaryBuildings.forEach((buildingId) => {
        const building = BUILDING_TYPES[buildingId];
        expect(building).toBeDefined();
        expect(building.description.toLowerCase()).toMatch(
          /recruit|military|defensive|protect|army/
        );
      });
    });

    it('should have magical buildings', () => {
      const mageTower = BUILDING_TYPES['mage-tower'];
      expect(mageTower.name).toBe('Mage Tower');
      expect(mageTower.description.toLowerCase()).toContain('mage');
    });

    it('should have surveillance buildings', () => {
      const watchTower = BUILDING_TYPES['watch-tower'];
      expect(watchTower.name).toBe('Watch Tower');
      expect(watchTower.description.toLowerCase()).toMatch(/vision|warning/);
    });

    it('should have economic buildings (gold producing)', () => {
      const goldProducingBuildings = Object.values(BUILDING_TYPES).filter(
        (building) => building.goldPerTurn > 0
      );

      expect(goldProducingBuildings.length).toBeGreaterThan(0);
      goldProducingBuildings.forEach((building) => {
        expect(building.goldPerTurn).toBeGreaterThan(0);
      });
    });

    it('should have non-economic buildings', () => {
      const nonEconomicBuildings = Object.values(BUILDING_TYPES).filter(
        (building) => building.goldPerTurn === 0
      );

      expect(nonEconomicBuildings.length).toBeGreaterThan(0);
      nonEconomicBuildings.forEach((building) => {
        expect(building.goldPerTurn).toBe(0);
        // Should provide other benefits (military, defensive, recruitment)
        expect(building.description.toLowerCase()).toMatch(
          /recruit|defensive|protect|military|bonuses/
        );
      });
    });
  });

  describe('Economic Balance Validation', () => {
    it('should have reasonable cost ranges', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.goldCost).toBeGreaterThanOrEqual(50); // Minimum viable cost
        expect(building.goldCost).toBeLessThanOrEqual(300); // Maximum reasonable cost
      });
    });

    it('should have reasonable gold per turn ranges', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.goldPerTurn).toBeLessThanOrEqual(10); // Max reasonable income
      });
    });

    it('should have cost-benefit balance for economic buildings', () => {
      const economicBuildings = Object.values(BUILDING_TYPES).filter(
        (building) => building.goldPerTurn > 0
      );

      economicBuildings.forEach((building) => {
        // Payback period should be reasonable (10-50 turns)
        const paybackTurns = building.goldCost / building.goldPerTurn;
        expect(paybackTurns).toBeGreaterThan(10); // Not too quick payback
        expect(paybackTurns).toBeLessThan(50); // Not too slow payback
      });
    });

    it('should have more expensive buildings provide better returns or capabilities', () => {
      const economicBuildings = Object.values(BUILDING_TYPES)
        .filter((building) => building.goldPerTurn > 0)
        .sort((a, b) => a.goldCost - b.goldCost);

      // More expensive economic buildings should generally have higher returns
      if (economicBuildings.length >= 2) {
        for (let i = 1; i < economicBuildings.length; i++) {
          const cheaper = economicBuildings[i - 1];
          const moreExpensive = economicBuildings[i];

          // Either higher absolute return or better return-to-cost ratio
          const cheaperRatio = cheaper.goldPerTurn / cheaper.goldCost;
          const expensiveRatio = moreExpensive.goldPerTurn / moreExpensive.goldCost;

          expect(
            moreExpensive.goldPerTurn > cheaper.goldPerTurn || expensiveRatio >= cheaperRatio * 0.8 // Allow some variance
          ).toBeTruthy();
        }
      }
    });
  });

  describe('Specific Building Validation', () => {
    it('should have mage tower with appropriate stats', () => {
      const mageTower = BUILDING_TYPES['mage-tower'];
      expect(mageTower.name).toBe('Mage Tower');
      expect(mageTower.goldPerTurn).toBeGreaterThan(0); // Should generate income
      expect(mageTower.goldCost).toBeGreaterThan(100); // Should be expensive
      expect(mageTower.description).toContain('Mage');
    });

    it('should have barracks as military recruitment building', () => {
      const barracks = BUILDING_TYPES.barracks;
      expect(barracks.name).toBe('Barracks');
      expect(barracks.goldPerTurn).toBe(0); // Pure military building
      expect(barracks.description.toLowerCase()).toContain('recruitment');
      expect(barracks.description.toLowerCase()).toContain('military');
    });

    it('should have castle wall as defensive building', () => {
      const castleWall = BUILDING_TYPES['castle-wall'];
      expect(castleWall.name).toBe('Castle Wall');
      expect(castleWall.goldPerTurn).toBe(0); // Pure defensive
      expect(castleWall.goldCost).toBeGreaterThan(150); // Should be expensive
      expect(castleWall.description.toLowerCase()).toContain('defensive');
    });

    it('should have watch tower with surveillance function', () => {
      const watchTower = BUILDING_TYPES['watch-tower'];
      expect(watchTower.name).toBe('Watch Tower');
      expect(watchTower.goldPerTurn).toBeGreaterThan(0); // Should provide some income
      expect(watchTower.goldCost).toBeLessThan(100); // Should be relatively cheap
      expect(watchTower.description.toLowerCase()).toMatch(/vision|warning/);
    });

    it('should have stronghold as fortified building', () => {
      const stronghold = BUILDING_TYPES.stronghold;
      expect(stronghold.name).toBe('Stronghold');
      expect(stronghold.description.toLowerCase()).toMatch(/protect|army/);
    });
  });

  describe('Display Names and Descriptions', () => {
    it('should have proper capitalized display names', () => {
      const expectedNames = {
        'mage-tower': 'Mage Tower',
        barracks: 'Barracks',
        'castle-wall': 'Castle Wall',
        'watch-tower': 'Watch Tower',
        stronghold: 'Stronghold',
      };

      Object.entries(expectedNames).forEach(([buildingId, expectedName]) => {
        expect(BUILDING_TYPES[buildingId].name).toBe(expectedName);
      });
    });

    it('should have descriptive and informative descriptions', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.description.length).toBeGreaterThan(20); // Reasonably detailed
        expect(building.description.length).toBeLessThan(100); // Not too verbose

        // Should start with capital letter and have proper sentence structure
        expect(building.description[0]).toBe(building.description[0].toUpperCase());
      });
    });

    it('should have unique descriptions', () => {
      const descriptions = Object.values(BUILDING_TYPES).map((building) => building.description);
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });
  });

  describe('Data Consistency Checks', () => {
    it('should have consistent key-id-type relationships', () => {
      Object.entries(BUILDING_TYPES).forEach(([key, building]) => {
        expect(building.id).toBe(key);
        expect(building.type).toBe(key);
      });
    });

    it('should have unique names across all buildings', () => {
      const names = Object.values(BUILDING_TYPES).map((building) => building.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have unique IDs across all buildings', () => {
      const ids = Object.values(BUILDING_TYPES).map((building) => building.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required fields populated', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        expect(building.id).toBeTruthy();
        expect(building.name).toBeTruthy();
        expect(building.type).toBeTruthy();
        expect(building.goldCost).toBeTruthy();
        expect(typeof building.goldPerTurn).toBe('number'); // Can be 0
        expect(building.description).toBeTruthy();
      });
    });
  });

  describe('Type Safety Validation', () => {
    it('should match Building interface exactly', () => {
      Object.values(BUILDING_TYPES).forEach((building) => {
        // This test ensures the BUILDING_TYPES conform to the Building interface
        const testBuilding: Building = building;
        expect(testBuilding).toBeDefined();

        // Verify all required properties exist with correct types
        expect(typeof testBuilding.id).toBe('string');
        expect(typeof testBuilding.type).toBe('string');
        expect(typeof testBuilding.name).toBe('string');
        expect(typeof testBuilding.goldCost).toBe('number');
        expect(typeof testBuilding.goldPerTurn).toBe('number');
        expect(typeof testBuilding.description).toBe('string');
      });
    });
  });

  describe('Game Balance Analysis', () => {
    it('should have balanced distribution of economic vs non-economic buildings', () => {
      const economicBuildings = Object.values(BUILDING_TYPES).filter(
        (building) => building.goldPerTurn > 0
      );
      const nonEconomicBuildings = Object.values(BUILDING_TYPES).filter(
        (building) => building.goldPerTurn === 0
      );

      // Should have both types
      expect(economicBuildings.length).toBeGreaterThan(0);
      expect(nonEconomicBuildings.length).toBeGreaterThan(0);

      // Should not be entirely dominated by either type
      const total = Object.keys(BUILDING_TYPES).length;
      expect(economicBuildings.length).toBeLessThan(total * 0.8);
      expect(nonEconomicBuildings.length).toBeLessThan(total * 0.8);
    });

    it('should have cost progression that makes sense', () => {
      // Sort buildings by cost
      const sortedByLowCost = Object.values(BUILDING_TYPES).sort((a, b) => a.goldCost - b.goldCost);

      expect(sortedByLowCost[0].goldCost).toBeLessThan(
        sortedByLowCost[sortedByLowCost.length - 1].goldCost
      );

      // There should be a reasonable spread in costs
      const cheapest = sortedByLowCost[0].goldCost;
      const mostExpensive = sortedByLowCost[sortedByLowCost.length - 1].goldCost;
      expect(mostExpensive / cheapest).toBeGreaterThan(1.5); // At least 50% difference
    });
  });
});
