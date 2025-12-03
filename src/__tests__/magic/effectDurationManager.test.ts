import { decrementEffectDurations } from '../../systems/effectActions';
import { armyFactory } from '../../factories/armyFactory';
import { Effect, EffectType } from '../../types/Effect';
import { SpellName } from '../../types/Spell';
import { createGameStateStub } from '../utils/createGameStateStub';

describe('Effect Duration Manager', () => {
  // Helper function to create an effect
  const createEffect = (
    id: string,
    type: EffectType,
    spell: SpellName,
    duration: number
  ): Effect => ({
    id,
    type,
    spell,
    duration,
  });

  describe('decrementEffectDurations', () => {
    describe('Player effect duration decrement', () => {
      it('should decrement player effect durations by 1', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        turnOwner.effects = [
          createEffect('effect1', EffectType.POSITIVE, SpellName.BLESSING, 3),
          createEffect('effect2', EffectType.NEGATIVE, SpellName.TORNADO, 5),
          createEffect('effect3', EffectType.POSITIVE, SpellName.VIEW_TERRITORY, 1),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(2); // effect3 should be removed (duration was 1)

        const blessing = turnOwner.effects.find((e) => e.spell === SpellName.BLESSING);
        const tornado = turnOwner.effects.find((e) => e.spell === SpellName.TORNADO);

        expect(blessing?.duration).toBe(2); // 3 - 1
        expect(tornado?.duration).toBe(4); // 5 - 1
      });

      it('should remove player effects with duration <= 0', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        turnOwner.effects = [
          createEffect('effect1', EffectType.POSITIVE, SpellName.BLESSING, 1),
          createEffect('effect2', EffectType.NEGATIVE, SpellName.TORNADO, 0),
          createEffect('effect3', EffectType.POSITIVE, SpellName.VIEW_TERRITORY, 2),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(1); // Only effect3 should remain
        expect(turnOwner.effects[0].spell).toBe(SpellName.VIEW_TERRITORY);
        expect(turnOwner.effects[0].duration).toBe(1);
      });

      it('should handle empty player effects array', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        turnOwner.effects = [];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(0);
      });
    });

    describe('Army effect duration decrement', () => {
      it('should decrement army effect durations for turn owner armies', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwnerId = gameState.players[0].id;

        // Create armies controlled by turn owner
        const army1 = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army1.effects = [
          createEffect('effect1', EffectType.POSITIVE, SpellName.BLESSING, 4),
          createEffect('effect2', EffectType.NEGATIVE, SpellName.ENTANGLING_ROOTS, 1),
        ];

        const army2 = armyFactory(turnOwnerId, { row: 2, col: 2 });
        army2.effects = [createEffect('effect3', EffectType.NEGATIVE, SpellName.TORNADO, 2)];

        // Create army controlled by different player (should not be affected)
        const otherPlayerArmy = armyFactory(gameState.players[1].id, { row: 3, col: 3 });
        otherPlayerArmy.effects = [createEffect('effect4', EffectType.POSITIVE, SpellName.HEAL, 5)];

        gameState.armies = [army1, army2, otherPlayerArmy];

        decrementEffectDurations(gameState);

        // Check army1 effects
        expect(army1.effects).toHaveLength(1); // effect2 should be removed (duration was 1)
        expect(army1.effects[0].spell).toBe(SpellName.BLESSING);
        expect(army1.effects[0].duration).toBe(3); // 4 - 1

        // Check army2 effects
        expect(army2.effects).toHaveLength(1);
        expect(army2.effects[0].spell).toBe(SpellName.TORNADO);
        expect(army2.effects[0].duration).toBe(1); // 2 - 1

        // Check other player army is unchanged
        expect(otherPlayerArmy.effects).toHaveLength(1);
        expect(otherPlayerArmy.effects[0].duration).toBe(5); // unchanged
      });

      it('should handle armies with no effects', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwnerId = gameState.players[0].id;

        const army = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army.effects = [];
        gameState.armies = [army];

        decrementEffectDurations(gameState);

        expect(army.effects).toHaveLength(0);
      });
    });

    describe('Land effect duration decrement', () => {
      it('should decrement land effect durations for turn owner lands', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        // Add land ownership (using correct land ID format and ensuring lands exist)
        const landId1 = '1-1';
        const landId2 = '2-2';
        const landId3 = '3-3'; // owned by different player

        turnOwner.landsOwned.add(landId1);
        turnOwner.landsOwned.add(landId2);
        gameState.players[1].landsOwned.add(landId3);

        // Add effects to lands
        gameState.map.lands[landId1].effects = [
          createEffect('effect1', EffectType.POSITIVE, SpellName.FERTILE_LAND, 3),
          createEffect('effect2', EffectType.NEGATIVE, SpellName.EMBER_RAID, 1),
        ];

        gameState.map.lands[landId2].effects = [
          createEffect('effect3', EffectType.POSITIVE, SpellName.BLESSING, 2),
        ];

        gameState.map.lands[landId3].effects = [
          createEffect('effect4', EffectType.NEGATIVE, SpellName.TORNADO, 4),
        ];

        decrementEffectDurations(gameState);

        // Check land1 effects
        expect(gameState.map.lands[landId1].effects).toHaveLength(1); // effect2 should be removed
        expect(gameState.map.lands[landId1].effects[0].spell).toBe(SpellName.FERTILE_LAND);
        expect(gameState.map.lands[landId1].effects[0].duration).toBe(2); // 3 - 1

        // Check land2 effects
        expect(gameState.map.lands[landId2].effects).toHaveLength(1);
        expect(gameState.map.lands[landId2].effects[0].spell).toBe(SpellName.BLESSING);
        expect(gameState.map.lands[landId2].effects[0].duration).toBe(1); // 2 - 1

        // Check land3 effects (owned by different player, should be unchanged)
        expect(gameState.map.lands[landId3].effects).toHaveLength(1);
        expect(gameState.map.lands[landId3].effects[0].duration).toBe(4); // unchanged
      });

      it('should handle lands with no effects', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        const landId = '1-1';
        turnOwner.landsOwned.add(landId);

        gameState.map.lands[landId].effects = [];

        decrementEffectDurations(gameState);

        expect(gameState.map.lands[landId].effects).toHaveLength(0);
      });
    });

    describe('Edge cases and comprehensive scenarios', () => {
      it('should handle multiple entities with mixed effect durations', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];
        const turnOwnerId = turnOwner.id;

        // Player effects
        turnOwner.effects = [
          createEffect('player1', EffectType.POSITIVE, SpellName.BLESSING, 1),
          createEffect('player2', EffectType.NEGATIVE, SpellName.TORNADO, 3),
        ];

        // Army effects
        const army = armyFactory(turnOwnerId, { row: 1, col: 1 });
        army.effects = [
          createEffect('army1', EffectType.POSITIVE, SpellName.HEAL, 0),
          createEffect('army2', EffectType.NEGATIVE, SpellName.ENTANGLING_ROOTS, 2),
        ];
        gameState.armies = [army];

        // Land effects
        const landId = '1-1';
        turnOwner.landsOwned.add(landId);

        gameState.map.lands[landId].effects = [
          createEffect('land1', EffectType.POSITIVE, SpellName.FERTILE_LAND, 4),
        ];

        decrementEffectDurations(gameState);

        // Player: effect with duration 1 should be removed, duration 3 becomes 2
        expect(turnOwner.effects).toHaveLength(1);
        expect(turnOwner.effects[0].id).toBe('player2');
        expect(turnOwner.effects[0].duration).toBe(2);

        // Army: effect with duration 0 should be removed, duration 2 becomes 1
        expect(army.effects).toHaveLength(1);
        expect(army.effects[0].id).toBe('army2');
        expect(army.effects[0].duration).toBe(1);

        // Land: duration 4 becomes 3
        expect(gameState.map.lands[landId].effects).toHaveLength(1);
        expect(gameState.map.lands[landId].effects[0].id).toBe('land1');
        expect(gameState.map.lands[landId].effects[0].duration).toBe(3);
      });

      it('should only affect turn owner entities', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];
        const otherPlayer = gameState.players[1];

        // Set up effects for both players
        turnOwner.effects = [createEffect('to1', EffectType.POSITIVE, SpellName.BLESSING, 2)];
        otherPlayer.effects = [createEffect('op1', EffectType.POSITIVE, SpellName.HEAL, 2)];

        // Set up army for other player
        const otherArmy = armyFactory(otherPlayer.id, { row: 1, col: 1 });
        otherArmy.effects = [createEffect('oa1', EffectType.NEGATIVE, SpellName.TORNADO, 2)];
        gameState.armies = [otherArmy];

        // Set up land for other player
        const landId = '1-1';
        otherPlayer.landsOwned.add(landId);

        gameState.map.lands[landId].effects = [
          createEffect('ol1', EffectType.POSITIVE, SpellName.FERTILE_LAND, 2),
        ];

        decrementEffectDurations(gameState);

        // Turn owner effects should be decremented
        expect(turnOwner.effects[0].duration).toBe(1);

        // Other player effects should remain unchanged
        expect(otherPlayer.effects[0].duration).toBe(2);
        expect(otherArmy.effects[0].duration).toBe(2);
        expect(gameState.map.lands[landId].effects[0].duration).toBe(2);
      });

      it('should handle player with no owned lands or armies', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        // Player has effects but no lands or armies
        turnOwner.effects = [createEffect('p1', EffectType.POSITIVE, SpellName.BLESSING, 1)];
        turnOwner.landsOwned.clear();
        gameState.armies = [];

        decrementEffectDurations(gameState);

        // Only player effects should be processed
        expect(turnOwner.effects).toHaveLength(0); // effect removed due to duration 1
      });
    });

    describe('Effect type preservation', () => {
      it('should preserve both positive and negative effects during duration decrement', () => {
        const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
        const turnOwner = gameState.players[0];

        turnOwner.effects = [
          createEffect('pos1', EffectType.POSITIVE, SpellName.BLESSING, 3),
          createEffect('neg1', EffectType.NEGATIVE, SpellName.TORNADO, 3),
        ];

        decrementEffectDurations(gameState);

        expect(turnOwner.effects).toHaveLength(2);

        const positiveEffect = turnOwner.effects.find((e) => e.type === EffectType.POSITIVE);
        const negativeEffect = turnOwner.effects.find((e) => e.type === EffectType.NEGATIVE);

        expect(positiveEffect?.duration).toBe(2);
        expect(negativeEffect?.duration).toBe(2);
      });
    });
  });
});
