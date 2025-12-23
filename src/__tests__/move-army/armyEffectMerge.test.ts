import { mergeArmies } from '../../systems/armyActions';
import { armyFactory } from '../../factories/armyFactory';
import { EffectKind, EffectTarget } from '../../types/Effect';
import { SpellName } from '../../types/Spell';
import type { SpellType } from '../../types/Spell';
import type { ArmyState } from '../../state/army/ArmyState';
import type { Effect, EffectType } from '../../types/Effect';

describe('Army Effect Merge Logic', () => {
  // Helper function to create an effect
  const createEffect = (
    id: string,
    type: EffectType,
    spell: SpellType,
    duration: number
  ): Effect => ({
    id,
    sourceId: spell,
    appliedBy: 'player1',
    rules: {
      type: type,
      duration: duration,
      target: EffectTarget.LAND,
    },
  });

  // Helper function to create a simple test army
  const createTestArmy = (effects: Effect[] = []): ArmyState => ({
    ...armyFactory('player1', { row: 1, col: 1 }),
    effects,
  });

  describe('mergeArmies function direct tests', () => {
    it('should preserve only negative effects when merging armies', () => {
      const targetArmy = createTestArmy([
        createEffect('effect1', EffectKind.POSITIVE, SpellName.BLESSING, 5),
        createEffect('effect2', EffectKind.NEGATIVE, SpellName.TORNADO, 3),
      ]);

      const sourceArmy = createTestArmy([
        createEffect('effect3', EffectKind.POSITIVE, SpellName.HEAL, 4),
        createEffect('effect4', EffectKind.NEGATIVE, SpellName.EARTHQUAKE, 6),
        createEffect('effect5', EffectKind.NEGATIVE, SpellName.ENTANGLING_ROOTS, 2),
      ]);

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      // Should only have negative effects
      expect(mergedArmy.effects).toHaveLength(3);
      expect(mergedArmy.effects.every((effect) => effect.rules.type === EffectKind.NEGATIVE)).toBe(
        true
      );

      // Check-specific effects are preserved
      const effectIds = mergedArmy.effects.map((e) => e.id);
      expect(effectIds).toContain('effect2'); // negative from target
      expect(effectIds).toContain('effect4'); // negative from source
      expect(effectIds).toContain('effect5'); // negative from source
      expect(effectIds).not.toContain('effect1'); // positive from target - should be gone
      expect(effectIds).not.toContain('effect3'); // positive from source - should be gone
    });

    it('should handle merging when one army has no effects', () => {
      const targetArmy = createTestArmy([
        createEffect('effect1', EffectKind.NEGATIVE, SpellName.TORNADO, 3),
      ]);

      const sourceArmy = createTestArmy([]);

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      expect(mergedArmy.effects).toHaveLength(1);
      expect(mergedArmy.effects[0].id).toBe('effect1');
      expect(mergedArmy.effects[0].rules.type).toBe(EffectKind.NEGATIVE);
    });

    it('should handle merging when both armies have no effects', () => {
      const targetArmy = createTestArmy();
      const sourceArmy = createTestArmy();

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      expect(mergedArmy.effects).toHaveLength(0);
    });

    it('should handle merging when armies only have positive effects', () => {
      const targetArmy = createTestArmy([
        createEffect('effect1', EffectKind.POSITIVE, SpellName.BLESSING, 5),
      ]);

      const sourceArmy = createTestArmy([
        createEffect('effect2', EffectKind.POSITIVE, SpellName.HEAL, 4),
      ]);

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      // All positive effects should disappear
      expect(mergedArmy.effects).toHaveLength(0);
    });

    it('should preserve effect properties correctly', () => {
      const targetArmy = createTestArmy([
        createEffect('effect1', EffectKind.NEGATIVE, SpellName.TORNADO, 10),
      ]);

      const sourceArmy = createTestArmy([
        createEffect('effect2', EffectKind.NEGATIVE, SpellName.EARTHQUAKE, 5),
      ]);

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      expect(mergedArmy.effects).toHaveLength(2);

      const tornado = mergedArmy.effects.find((e) => e.sourceId === SpellName.TORNADO);
      const earthquake = mergedArmy.effects.find((e) => e.sourceId === SpellName.EARTHQUAKE);

      expect(tornado).toBeDefined();
      expect(tornado!.rules.duration).toBe(10);
      expect(tornado!.rules.type).toBe(EffectKind.NEGATIVE);

      expect(earthquake).toBeDefined();
      expect(earthquake!.rules.duration).toBe(5);
      expect(earthquake!.rules.type).toBe(EffectKind.NEGATIVE);
    });

    it('should not modify original army effect arrays', () => {
      const originalTargetEffects = [
        createEffect('effect1', EffectKind.NEGATIVE, SpellName.TORNADO, 3),
      ];
      const originalSourceEffects = [
        createEffect('effect2', EffectKind.NEGATIVE, SpellName.EARTHQUAKE, 5),
      ];

      const targetArmy = createTestArmy(originalTargetEffects);
      const sourceArmy = createTestArmy(originalSourceEffects);

      const mergedArmy = mergeArmies(targetArmy, sourceArmy);

      // Original arrays should be unchanged
      expect(targetArmy.effects).toHaveLength(1);
      expect(sourceArmy.effects).toHaveLength(1);
      expect(mergedArmy.effects).toHaveLength(2);

      // Arrays should be different instances
      expect(mergedArmy.effects).not.toBe(targetArmy.effects);
      expect(mergedArmy.effects).not.toBe(sourceArmy.effects);
    });
  });
});
