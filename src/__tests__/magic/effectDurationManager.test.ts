import { getLandId } from '../../state/map/land/LandId';
import { getPlayerLands } from '../../selectors/playerSelectors';
import { decrementEffectDurations } from '../../systems/effectActions';
import { armyFactory } from '../../factories/armyFactory';

import { EffectKind, EffectTarget } from '../../types/Effect';
import { SpellName } from '../../types/Spell';
import type { SpellType } from '../../types/Spell';
import type { Effect, EffectType } from '../../types/Effect';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';

// todo remove after all spells implemented and tested
describe('Effect Duration Manager', () => {
  describe('decrementEffectDurations', () => {
    const gameState = createDefaultGameStateStub();
    const turnOwner = gameState.players[0];
    const turnOwnerId = turnOwner.id;

    // Helper function to create an effect
    const createEffect = (
      id: string,
      type: EffectType,
      spell: SpellType,
      duration: number,
      castBy: string
    ): Effect => ({
      id,
      sourceId: spell,
      appliedBy: castBy,
      rules: {
        type: type,
        target: EffectTarget.LAND,
        duration: duration,
      },
    });

    describe('Player effect duration decrement', () => {
      it('should decrement player effect durations by 1', () => {
        turnOwner.effects = [
          createEffect('effect1', EffectKind.POSITIVE, SpellName.BLESSING, 3, turnOwner.id),
          createEffect('effect2', EffectKind.NEGATIVE, SpellName.TORNADO, 5, turnOwner.id),
          createEffect('effect3', EffectKind.POSITIVE, SpellName.VIEW_TERRITORY, 1, turnOwner.id),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(2); // effect3 should be removed (duration was 1)

        const blessing = turnOwner.effects.find((e) => e.sourceId === SpellName.BLESSING);
        const tornado = turnOwner.effects.find((e) => e.sourceId === SpellName.TORNADO);

        expect(blessing?.rules.duration).toBe(2); // 3 - 1
        expect(tornado?.rules.duration).toBe(4); // 5 - 1
      });

      it('should remove player effects with duration <= 0', () => {
        turnOwner.effects = [
          createEffect('effect1', EffectKind.POSITIVE, SpellName.BLESSING, 1, turnOwner.id),
          createEffect('effect2', EffectKind.NEGATIVE, SpellName.TORNADO, 0, turnOwner.id),
          createEffect('effect3', EffectKind.POSITIVE, SpellName.VIEW_TERRITORY, 2, turnOwner.id),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(1); // Only effect3 should remain
        expect(turnOwner.effects[0].sourceId).toBe(SpellName.VIEW_TERRITORY);
        expect(turnOwner.effects[0].rules.duration).toBe(1);
      });

      it('should handle empty player effects array', () => {
        turnOwner.effects = [];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(0);
      });
    });

    describe('Army effect duration decrement', () => {
      it('should decrement army effect durations for turn owner armies', () => {
        // Create armies controlled by turn owner
        const army1 = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army1.effects = [
          createEffect('effect1', EffectKind.POSITIVE, SpellName.BLESSING, 4, turnOwnerId),
          createEffect('effect2', EffectKind.NEGATIVE, SpellName.ENTANGLING_ROOTS, 1, turnOwnerId),
        ];

        const army2 = armyFactory(turnOwnerId, { row: 2, col: 2 });
        army2.effects = [
          createEffect('effect3', EffectKind.NEGATIVE, SpellName.TORNADO, 2, turnOwnerId),
        ];

        // Create army controlled by different player (should not be affected)
        const otherPlayerArmy = armyFactory(gameState.players[1].id, { row: 3, col: 3 });
        otherPlayerArmy.effects = [
          createEffect('effect4', EffectKind.POSITIVE, SpellName.HEAL, 5, gameState.players[1].id),
        ];

        gameState.armies = [army1, army2, otherPlayerArmy];

        decrementEffectDurations(gameState);

        // Check army1 effects
        expect(army1.effects).toHaveLength(1); // effect2 should be removed (duration was 1)
        expect(army1.effects[0].sourceId).toBe(SpellName.BLESSING);
        expect(army1.effects[0].rules.duration).toBe(3); // 4 - 1

        // Check army2 effects
        expect(army2.effects).toHaveLength(1);
        expect(army2.effects[0].sourceId).toBe(SpellName.TORNADO);
        expect(army2.effects[0].rules.duration).toBe(1); // 2 - 1

        // Check other player army is unchanged
        expect(otherPlayerArmy.effects).toHaveLength(1);
        expect(otherPlayerArmy.effects[0].rules.duration).toBe(5); // unchanged
      });

      it('should handle armies with no effects', () => {
        const army = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army.effects = [];
        gameState.armies = [army];

        decrementEffectDurations(gameState);

        expect(army.effects).toHaveLength(0);
      });
    });

    describe('Land effect duration decrement', () => {
      it('should decrement land effect durations for turn owner lands', () => {
        const turnOwnerLands = getPlayerLands(gameState);
        const landId1 = getLandId(turnOwnerLands[0].mapPos);
        const landId2 = getLandId(turnOwnerLands[1].mapPos);
        const landId3 = getLandId(getPlayerLands(gameState, gameState.players[1].id)[0].mapPos);

        // Add effects to lands
        gameState.map.lands[landId1].effects = [
          createEffect('effect1', EffectKind.POSITIVE, SpellName.FERTILE_LAND, 3, turnOwner.id),
          createEffect('effect2', EffectKind.NEGATIVE, SpellName.EMBER_RAID, 1, turnOwner.id),
        ];

        gameState.map.lands[landId2].effects = [
          createEffect('effect3', EffectKind.POSITIVE, SpellName.BLESSING, 2, turnOwner.id),
        ];

        gameState.map.lands[landId3].effects = [
          createEffect(
            'effect4',
            EffectKind.NEGATIVE,
            SpellName.TORNADO,
            4,
            gameState.players[1].id
          ),
        ];

        decrementEffectDurations(gameState);

        // Check land1 effects
        expect(gameState.map.lands[landId1].effects).toHaveLength(1); // effect2 should be removed
        expect(gameState.map.lands[landId1].effects[0].sourceId).toBe(SpellName.FERTILE_LAND);
        expect(gameState.map.lands[landId1].effects[0].rules.duration).toBe(2); // 3 - 1

        // Check land2 effects
        expect(gameState.map.lands[landId2].effects).toHaveLength(1);
        expect(gameState.map.lands[landId2].effects[0].sourceId).toBe(SpellName.BLESSING);
        expect(gameState.map.lands[landId2].effects[0].rules.duration).toBe(1); // 2 - 1

        // Check land3 effects (owned by different player, should be unchanged)
        expect(gameState.map.lands[landId3].effects).toHaveLength(1);
        expect(gameState.map.lands[landId3].effects[0].rules.duration).toBe(4); // unchanged
      });

      it('should handle lands with no effects', () => {
        const landId = '1-1';
        turnOwner.landsOwned.add(landId);

        gameState.map.lands[landId].effects = [];

        decrementEffectDurations(gameState);

        expect(gameState.map.lands[landId].effects).toHaveLength(0);
      });
    });

    describe('Edge cases and comprehensive scenarios', () => {
      it('should handle multiple entities with mixed effect durations', () => {
        // Player effects
        turnOwner.effects = [
          createEffect('player1', EffectKind.POSITIVE, SpellName.BLESSING, 1, turnOwnerId),
          createEffect('player2', EffectKind.NEGATIVE, SpellName.TORNADO, 3, turnOwnerId),
        ];

        // Army effects
        const army = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army.effects = [
          createEffect('army1', EffectKind.POSITIVE, SpellName.HEAL, 0, turnOwnerId),
          createEffect('army2', EffectKind.NEGATIVE, SpellName.ENTANGLING_ROOTS, 2, turnOwnerId),
        ];
        gameState.armies = [army];

        // Land effects
        const landId = getLandId(getPlayerLands(gameState, gameState.players[0].id)[0].mapPos);

        gameState.map.lands[landId].effects = [
          createEffect('land1', EffectKind.POSITIVE, SpellName.FERTILE_LAND, 4, turnOwnerId),
        ];

        decrementEffectDurations(gameState);

        // Player: effect with duration 1 should be removed, duration 3 becomes 2
        expect(turnOwner.effects).toHaveLength(1);
        expect(turnOwner.effects[0].id).toBe('player2');
        expect(turnOwner.effects[0].rules.duration).toBe(2);

        // Army: effect with duration 0 should be removed, duration 2 becomes 1
        expect(army.effects).toHaveLength(1);
        expect(army.effects[0].id).toBe('army2');
        expect(army.effects[0].rules.duration).toBe(1);

        // Land: duration 4 becomes 3
        expect(gameState.map.lands[landId].effects).toHaveLength(1);
        expect(gameState.map.lands[landId].effects[0].id).toBe('land1');
        expect(gameState.map.lands[landId].effects[0].rules.duration).toBe(3);
      });

      it('should only affect turn owner entities', () => {
        const otherPlayer = gameState.players[1];

        // Set up effects for both players
        turnOwner.effects = [
          createEffect('to1', EffectKind.POSITIVE, SpellName.BLESSING, 2, turnOwner.id),
        ];
        otherPlayer.effects = [
          createEffect('op1', EffectKind.POSITIVE, SpellName.HEAL, 2, otherPlayer.id),
        ];

        // Set up army for other player
        const otherArmy = armyFactory(otherPlayer.id, { row: 1, col: 1 });
        otherArmy.effects = [
          createEffect('oa1', EffectKind.NEGATIVE, SpellName.TORNADO, 2, otherPlayer.id),
        ];
        gameState.armies = [otherArmy];

        const landId = getLandId(getPlayerLands(gameState, otherPlayer.id)[0].mapPos);

        gameState.map.lands[landId].effects = [
          createEffect('ol1', EffectKind.POSITIVE, SpellName.FERTILE_LAND, 2, otherPlayer.id),
        ];

        decrementEffectDurations(gameState);

        // Turn owner effects should be decremented
        expect(turnOwner.effects[0].rules.duration).toBe(1);

        // Other player effects should remain unchanged
        expect(otherPlayer.effects[0].rules.duration).toBe(2);
        expect(otherArmy.effects[0].rules.duration).toBe(2);
        expect(gameState.map.lands[landId].effects[0].rules.duration).toBe(2);
      });

      it('should handle player with no owned lands or armies', () => {
        // Player has effects but no lands or armies
        turnOwner.effects = [
          createEffect('p1', EffectKind.POSITIVE, SpellName.BLESSING, 1, turnOwner.id),
        ];
        turnOwner.landsOwned.clear();
        gameState.armies = [];

        decrementEffectDurations(gameState);

        // Only player effects should be processed
        expect(turnOwner.effects).toHaveLength(0); // effect removed due to duration 1
      });
    });

    describe('Effect type preservation', () => {
      it('should preserve both positive and negative effects during duration decrement', () => {
        turnOwner.effects = [
          createEffect('pos1', EffectKind.POSITIVE, SpellName.BLESSING, 3, turnOwner.id),
          createEffect('neg1', EffectKind.NEGATIVE, SpellName.TORNADO, 3, turnOwner.id),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(2);

        const positiveEffect = turnOwner.effects.find((e) => e.rules.type === EffectKind.POSITIVE);
        const negativeEffect = turnOwner.effects.find((e) => e.rules.type === EffectKind.NEGATIVE);

        expect(positiveEffect?.rules.duration).toBe(2);
        expect(negativeEffect?.rules.duration).toBe(2);
      });
    });
  });
});
