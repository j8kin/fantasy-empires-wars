import { UNIT_TYPES, UnitType } from '../types/Army';

describe('Army Data Integrity', () => {
  describe('UNIT_TYPES Object Structure', () => {
    it('should contain all expected unit types', () => {
      const expectedUnits = [
        'warrior',
        'dwarf',
        'orc',
        'elf',
        'darkelf',
        'balista',
        'catapult',
        'Fighter',
        'Hammerlord',
        'Ranger',
        'Pyromancer',
        'Cleric',
        'Druid',
        'Enchanter',
        'Necromancer',
      ];

      expectedUnits.forEach((unitId) => {
        expect(UNIT_TYPES).toHaveProperty(unitId);
      });

      expect(Object.keys(UNIT_TYPES)).toHaveLength(expectedUnits.length);
    });

    it('should have all units with required properties', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit).toHaveProperty('id');
        expect(unit).toHaveProperty('type');
        expect(unit).toHaveProperty('name');
        expect(unit).toHaveProperty('attack');
        expect(unit).toHaveProperty('defense');
        expect(unit).toHaveProperty('health');
        expect(unit).toHaveProperty('goldCost');
        expect(unit).toHaveProperty('movement');
        expect(unit).toHaveProperty('level');
        expect(unit).toHaveProperty('hero');

        // Check property types
        expect(typeof unit.id).toBe('string');
        expect(typeof unit.type).toBe('string');
        expect(typeof unit.name).toBe('string');
        expect(typeof unit.attack).toBe('number');
        expect(typeof unit.defense).toBe('number');
        expect(typeof unit.health).toBe('number');
        expect(typeof unit.goldCost).toBe('number');
        expect(typeof unit.movement).toBe('number');
        expect(typeof unit.level).toBe('number');
        expect(typeof unit.hero).toBe('boolean');
      });
    });

    it('should have valid UnitType values', () => {
      const validTypes: UnitType[] = ['warrior', 'archer', 'mage', 'balista', 'catapult'];

      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(validTypes).toContain(unit.type);
      });
    });

    it('should have matching ID with object key', () => {
      Object.entries(UNIT_TYPES).forEach(([key, unit]) => {
        expect(unit.id.toLowerCase()).toEqual(key.toLowerCase());
      });
    });

    it('should have non-negative numeric values', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.attack).toBeGreaterThanOrEqual(0);
        expect(unit.defense).toBeGreaterThanOrEqual(0);
        expect(unit.health).toBeGreaterThan(0);
        expect(unit.goldCost).toBeGreaterThan(0);
        expect(unit.movement).toBeGreaterThanOrEqual(0);
        expect(unit.level).toBeGreaterThan(0);
      });
      // Optional properties
      Object.values(UNIT_TYPES)
        .filter((it) => it.range !== undefined)
        .forEach((unit) => {
          expect(unit.range).toBeGreaterThan(0);
          expect(unit.rangeDamage).toBeDefined();
          expect(unit.rangeDamage).toBeGreaterThan(0);
        });
      Object.values(UNIT_TYPES)
        .filter((it) => it.mana !== undefined)
        .forEach((unit) => {
          expect(unit.mana).toBeGreaterThan(0);
        });
    });

    it('should have non-empty names', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.name.length).toBeGreaterThan(0);
        expect(unit.name.trim()).toBe(unit.name); // No leading/trailing spaces
      });
    });
  });

  describe('Hero vs Regular Unit Classification', () => {
    it('should correctly identify heroes', () => {
      const heroes = Object.values(UNIT_TYPES).filter((unit) => unit.hero);
      const expectedHeroes = [
        'Fighter',
        'Hammerlord',
        'Ranger',
        'Pyromancer',
        'Cleric',
        'Druid',
        'Enchanter',
        'Necromancer',
      ];

      expect(heroes).toHaveLength(expectedHeroes.length);
      heroes.forEach((hero) => {
        expect(expectedHeroes).toContain(hero.name);
      });
    });

    it('should correctly identify regular units', () => {
      const regularUnits = Object.values(UNIT_TYPES).filter((unit) => !unit.hero);
      const expectedRegularUnits = [
        'warrior',
        'dwarf',
        'orc',
        'elf',
        'darkelf',
        'balista',
        'catapult',
      ];

      expect(regularUnits).toHaveLength(expectedRegularUnits.length);
      regularUnits.forEach((unit) => {
        expect(expectedRegularUnits).toContain(unit.id);
      });
    });

    it('should have only heroes with mana production', () => {
      Object.values(UNIT_TYPES)
        .filter((it) => it.mana !== undefined)
        .forEach((unit) => {
          expect(unit.hero).toBe(true);
        });
    });

    it('should have mage heroes produce mana', () => {
      const mageHeroes = Object.values(UNIT_TYPES).filter(
        (unit) => unit.hero && unit.type === 'mage'
      );

      mageHeroes.forEach((mage) => {
        expect(mage.mana).toBeDefined();
        expect(mage.mana).toBeGreaterThan(0);
      });
    });
  });

  describe('Unit Type Categories', () => {
    it('should have proper warrior units', () => {
      const warriors = Object.values(UNIT_TYPES).filter((unit) => unit.type === 'warrior');

      expect(warriors.length).toBeGreaterThan(0);
      warriors.forEach((warrior) => {
        expect(warrior.attack).toBeGreaterThan(0);
        expect(warrior.defense).toBeGreaterThan(0);
        expect(warrior.movement).toBeGreaterThan(0);
      });
    });

    it('should have proper archer units', () => {
      const archers = Object.values(UNIT_TYPES).filter((unit) => unit.type === 'archer');

      expect(archers.length).toBeGreaterThan(0);
      archers.forEach((archer) => {
        expect(archer.range).toBeDefined();
        expect(archer.rangeDamage).toBeDefined();
        expect(archer.range!).toBeGreaterThan(0);
        expect(archer.rangeDamage!).toBeGreaterThan(0);
        expect(archer.movement).toBeGreaterThan(0);
      });
    });

    it('should have proper mage units', () => {
      const mages = Object.values(UNIT_TYPES).filter((unit) => unit.type === 'mage');

      expect(mages.length).toBeGreaterThan(0);
      mages.forEach((mage) => {
        expect(mage.range).toBeDefined();
        expect(mage.rangeDamage).toBeDefined();
        expect(mage.hero).toBe(true); // All mages should be heroes
        expect(mage.mana).toBeDefined();
        expect(mage.mana!).toBeGreaterThan(0);
      });
    });

    it('should have proper siege units', () => {
      const siegeUnits = Object.values(UNIT_TYPES).filter(
        (unit) => unit.type === 'balista' || unit.type === 'catapult'
      );

      expect(siegeUnits.length).toBeGreaterThan(0);
      siegeUnits.forEach((siege) => {
        expect(siege.movement).toBe(0); // Siege units don't move
        expect(siege.hero).toBe(false); // Siege units are not heroes
      });
    });

    it('should have balista with range attack capability', () => {
      const balista = UNIT_TYPES.balista;
      expect(balista.range).toBeDefined();
      expect(balista.rangeDamage).toBeDefined();
      expect(balista.range!).toBeGreaterThan(0);
      expect(balista.rangeDamage!).toBeGreaterThan(0);
    });

    it('should have catapult without range damage (building destroyer)', () => {
      const catapult = UNIT_TYPES.catapult;
      expect(catapult.range).toBeUndefined();
      expect(catapult.rangeDamage).toBeUndefined();
      expect(catapult.attack).toBe(0);
      expect(catapult.defense).toBe(0);
    });
  });

  describe('Game Balance Validation', () => {
    it('should have reasonable cost-to-power ratios', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        // Gold cost should be reasonable compared to stats
        const totalCombatValue = unit.attack + unit.defense + unit.health;
        expect(unit.goldCost).toBeGreaterThan(totalCombatValue * 0.5);
      });

      // Siege units have special balancing (higher cost for utility)
      const siegeUnits = Object.values(UNIT_TYPES).filter(
        (unit) => unit.type === 'balista' || unit.type === 'catapult'
      );
      siegeUnits.forEach((unit) => {
        const totalCombatValue = unit.attack + unit.defense + unit.health;
        expect(unit.goldCost).toBeLessThan(totalCombatValue * 15); // Higher tolerance for siege
      });

      // Non-siege units have normal tolerance
      const nonSiegeUnits = Object.values(UNIT_TYPES).filter(
        (unit) => unit.type !== 'balista' && unit.type !== 'catapult'
      );
      nonSiegeUnits.forEach((unit) => {
        const totalCombatValue = unit.attack + unit.defense + unit.health;
        expect(unit.goldCost).toBeLessThan(totalCombatValue * 8); // Normal tolerance
      });
    });

    it('should have heroes cost exactly 100 gold', () => {
      const heroes = Object.values(UNIT_TYPES).filter((unit) => unit.hero);
      heroes.forEach((hero) => {
        expect(hero.goldCost).toBe(100);
      });
    });

    it('should have reasonable movement ranges', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.movement).toBeLessThanOrEqual(5); // Max reasonable movement
      });

      // Siege engines should not move
      const siegeUnits = Object.values(UNIT_TYPES).filter(
        (unit) => unit.type === 'balista' || unit.type === 'catapult'
      );
      siegeUnits.forEach((siege) => {
        expect(siege.movement).toBe(0); // Siege engines don't move
      });
    });

    it('should have reasonable health ranges', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.health).toBeGreaterThanOrEqual(15); // Min viable health
        expect(unit.health).toBeLessThanOrEqual(50); // Max reasonable health
      });
    });

    it('should have proper level assignments', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.level).toBe(1); // All units start at level 1
      });
    });

    it('should have ranged units with appropriate range values', () => {
      const rangedUnits = Object.values(UNIT_TYPES).filter((unit) => unit.range !== undefined);

      expect(rangedUnits.length).toBeGreaterThan(0); // Ensure we have ranged units to test

      rangedUnits.forEach((unit) => {
        expect(unit.range).toBeGreaterThanOrEqual(2); // Min useful range (allows for close combat)
        expect(unit.range).toBeLessThanOrEqual(35); // Max reasonable range
        expect(unit.rangeDamage).toBeDefined(); // Should have damage if has range
      });
    });
  });

  describe('Specific Unit Validation', () => {
    it('should have proper basic warrior stats', () => {
      const warrior = UNIT_TYPES.warrior;
      expect(warrior.type).toBe('warrior');
      expect(warrior.hero).toBe(false);
      expect(warrior.mana).toBeUndefined();
      expect(warrior.range).toBeUndefined();
      expect(warrior.attack).toBeGreaterThan(0);
      expect(warrior.defense).toBeGreaterThan(0);
      expect(warrior.movement).toBeGreaterThan(0);
    });

    it('should have dwarf with high defense', () => {
      const dwarf = UNIT_TYPES.dwarf;
      expect(dwarf.defense).toBeGreaterThan(UNIT_TYPES.warrior.defense);
      expect(dwarf.movement).toBeLessThanOrEqual(UNIT_TYPES.warrior.movement); // Slower
    });

    it('should have elf with ranged capabilities', () => {
      const elf = UNIT_TYPES.elf;
      expect(elf.type).toBe('archer');
      expect(elf.range).toBeDefined();
      expect(elf.rangeDamage).toBeDefined();
      expect(elf.movement).toBeGreaterThan(UNIT_TYPES.warrior.movement); // Faster
    });

    it('should have darkelf superior to regular elf', () => {
      const elf = UNIT_TYPES.elf;
      const darkelf = UNIT_TYPES.darkelf;

      expect(darkelf.goldCost).toBeGreaterThan(elf.goldCost);
      expect(darkelf.range!).toBeGreaterThanOrEqual(elf.range!);
      expect(darkelf.rangeDamage!).toBeGreaterThan(elf.rangeDamage!);
    });

    it('should have mage heroes with unique names and proper mana', () => {
      const mageHeroes = ['Pyromancer', 'Cleric', 'Druid', 'Enchanter', 'Necromancer'];

      mageHeroes.forEach((heroName) => {
        const hero = Object.values(UNIT_TYPES).find((u) => u.name === heroName);
        expect(hero).toBeDefined();
        expect(hero!.type).toBe('mage');
        expect(hero!.hero).toBe(true);
        expect(hero!.mana).toBe(1); // All mage heroes produce 1 mana per turn
      });
    });
  });

  describe('Data Consistency Checks', () => {
    it('should have consistent key-id-name relationships', () => {
      Object.entries(UNIT_TYPES).forEach(([key, unit]) => {
        expect(unit.id.toLowerCase()).toBe(key.toLowerCase());

        // Name should not be empty
        expect(unit.name).toBeTruthy();
      });
    });

    it('should have unique names across all units', () => {
      const names = Object.values(UNIT_TYPES).map((unit) => unit.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have unique IDs across all units', () => {
      const ids = Object.values(UNIT_TYPES).map((unit) => unit.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required fields populated', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        expect(unit.id).toBeTruthy();
        expect(unit.name).toBeTruthy();
        expect(unit.type).toBeTruthy();
        expect(unit.attack).toBeDefined();
        expect(unit.defense).toBeDefined();
        expect(unit.health).toBeTruthy();
        expect(unit.goldCost).toBeTruthy();
        expect(unit.movement).toBeDefined();
        expect(unit.level).toBeTruthy();
        expect(typeof unit.hero).toBe('boolean');
      });
    });
  });

  describe('Type Safety Validation', () => {
    it('should match Unit interface exactly', () => {
      Object.values(UNIT_TYPES).forEach((unit) => {
        // This test ensures the UNIT_TYPES conform to the Unit interface
        expect(unit).toBeDefined();
      });

      // Verify optional properties are handled correctly
      const unitsWithRange = Object.values(UNIT_TYPES).filter((unit) => unit.range !== undefined);
      unitsWithRange.forEach((unit) => {
        expect(typeof unit.range).toBe('number');
      });

      const unitsWithRangeDamage = Object.values(UNIT_TYPES).filter(
        (unit) => unit.rangeDamage !== undefined
      );
      unitsWithRangeDamage.forEach((unit) => {
        expect(typeof unit.rangeDamage).toBe('number');
      });

      const unitsWithMana = Object.values(UNIT_TYPES).filter((unit) => unit.mana !== undefined);
      unitsWithMana.forEach((unit) => {
        expect(typeof unit.mana).toBe('number');
      });
    });
  });
});
