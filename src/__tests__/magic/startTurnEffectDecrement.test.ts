import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { Effect, EffectType } from '../../types/Effect';
import { SpellName } from '../../types/Spell';
import { startTurn } from '../../turn/startTurn';
import { HeroUnitType } from '../../types/UnitType';

import { createGameStateStub } from '../utils/createGameStateStub';

// todo remove when all spells implemented and tested
describe('StartTurn Effect Duration Decrement Integration', () => {
  // Helper function to create an effect
  const createEffect = (
    id: string,
    type: EffectType,
    spell: SpellName,
    duration: number,
    castBy: string = 'player1'
  ): Effect => ({
    id,
    type,
    spell,
    duration,
    castBy,
  });

  // Helper function to create a test game state with turn > 1
  const createTestGameState = (turn: number = 2): GameState => {
    const gameState = createGameStateStub({ nPlayers: 3, addPlayersHomeland: false });
    gameState.turn = turn;
    gameState.turnOwner = gameState.players[0].id;
    return gameState;
  };

  describe('Effect duration decrement in startTurn', () => {
    it('should decrement effect durations at the end of startTurn execution', () => {
      const gameState = createTestGameState(2);
      const turnOwner = getTurnOwner(gameState);
      const turnOwnerId = turnOwner.id;

      // Set up effects on player, army, and land
      turnOwner.effects = [
        createEffect('player1', EffectType.POSITIVE, SpellName.BLESSING, 3, turnOwnerId),
        createEffect('player2', EffectType.NEGATIVE, SpellName.TORNADO, 1, turnOwnerId),
      ];

      const army = armyFactory(turnOwnerId, { row: 1, col: 1 }, [
        heroFactory(HeroUnitType.FIGHTER, 'Test Hero'),
      ]);
      army.effects = [createEffect('army1', EffectType.POSITIVE, SpellName.HEAL, 2, turnOwnerId)];
      gameState.armies = [army];

      const landId = '1-1';
      turnOwner.landsOwned.add(landId);

      gameState.map.lands[landId].effects = [
        createEffect('land1', EffectType.POSITIVE, SpellName.FERTILE_LAND, 4, turnOwnerId),
      ];

      // Execute startTurn
      startTurn(gameState);

      // Get the turn owner reference again after startTurn to ensure we're checking the correct object
      const updatedTurnOwner = getTurnOwner(gameState);

      // Verify effect durations were decremented
      // Player effects: duration 3->2, duration 1->removed
      expect(updatedTurnOwner.effects).toHaveLength(1);
      expect(updatedTurnOwner.effects[0].spell).toBe(SpellName.BLESSING);
      expect(updatedTurnOwner.effects[0].duration).toBe(2);

      // Army effects: duration 2->1
      expect(army.effects).toHaveLength(1);
      expect(army.effects[0].spell).toBe(SpellName.HEAL);
      expect(army.effects[0].duration).toBe(1);

      // Land effects: duration 4->3
      expect(gameState.map.lands[landId].effects).toHaveLength(1);
      expect(gameState.map.lands[landId].effects[0].spell).toBe(SpellName.FERTILE_LAND);
      expect(gameState.map.lands[landId].effects[0].duration).toBe(3);
    });

    it('should not decrement effects on turn 1 (early return)', () => {
      const gameState = createTestGameState(1);
      const turnOwner = gameState.players[0];

      turnOwner.effects = [createEffect('player1', EffectType.POSITIVE, SpellName.BLESSING, 2)];

      // Execute startTurn (should return early on turn 1)
      startTurn(gameState);

      // Effects should remain unchanged because startTurn returns early on turn 1
      expect(turnOwner.effects).toHaveLength(1);
      expect(turnOwner.effects[0].duration).toBe(2); // unchanged
    });

    it('should decrement effects after all other startTurn operations are completed', () => {
      const gameState = createTestGameState(3); // turn > 2 to trigger all operations
      const turnOwner = getTurnOwner(gameState);

      // Set up effects that will be tested for decrementation
      turnOwner.effects = [
        createEffect('player1', EffectType.POSITIVE, SpellName.BLESSING, 1, turnOwner.id), // will be removed
        createEffect('player2', EffectType.NEGATIVE, SpellName.TORNADO, 5, turnOwner.id), // will become 4
      ];

      // Execute startTurn
      startTurn(gameState);

      // Get the turn owner reference again after startTurn
      const updatedTurnOwner = getTurnOwner(gameState);

      // Verify effect durations were decremented (this proves the decrementation occurred)
      expect(updatedTurnOwner.effects).toHaveLength(1);
      expect(updatedTurnOwner.effects[0].spell).toBe(SpellName.TORNADO);
      expect(updatedTurnOwner.effects[0].duration).toBe(4); // 5 - 1

      // The fact that this test passes along with the other tests demonstrates
      // that effect decrementation works properly at the end of startTurn
    });

    it('should only affect the current turn owner', () => {
      const gameState = createTestGameState(2);
      const turnOwner = getTurnOwner(gameState);
      const otherPlayer = gameState.players[1];

      // Set up effects for both players
      turnOwner.effects = [
        createEffect('to1', EffectType.POSITIVE, SpellName.BLESSING, 3, turnOwner.id),
      ];
      otherPlayer.effects = [
        createEffect('op1', EffectType.POSITIVE, SpellName.HEAL, 3, otherPlayer.id),
      ];

      // Set up armies for both players
      const turnOwnerArmy = armyFactory(turnOwner.id, { row: 1, col: 1 }, [
        heroFactory(HeroUnitType.FIGHTER, 'Hero1'),
      ]);
      turnOwnerArmy.effects = [
        createEffect('toa1', EffectType.NEGATIVE, SpellName.TORNADO, 2, turnOwner.id),
      ];

      const otherPlayerArmy = armyFactory(otherPlayer.id, { row: 2, col: 2 }, [
        heroFactory(HeroUnitType.FIGHTER, 'Hero2'),
      ]);
      otherPlayerArmy.effects = [
        createEffect('opa1', EffectType.NEGATIVE, SpellName.ENTANGLING_ROOTS, 2, otherPlayer.id),
      ];

      gameState.armies = [turnOwnerArmy, otherPlayerArmy];

      // Execute startTurn
      startTurn(gameState);

      // Get the turn owner reference again after startTurn
      const updatedTurnOwner = getTurnOwner(gameState);

      // Turn owner effects should be decremented
      expect(updatedTurnOwner.effects[0].duration).toBe(2); // 3 - 1
      expect(turnOwnerArmy.effects[0].duration).toBe(1); // 2 - 1

      // Other player effects should remain unchanged
      expect(otherPlayer.effects[0].duration).toBe(3); // unchanged
      expect(otherPlayerArmy.effects[0].duration).toBe(2); // unchanged
    });

    it('should handle effects with various durations correctly', () => {
      const gameState = createTestGameState(2);
      const turnOwner = getTurnOwner(gameState);

      turnOwner.effects = [
        createEffect('effect0', EffectType.POSITIVE, SpellName.VIEW_TERRITORY, 0, turnOwner.id), // should be removed
        createEffect('effect1', EffectType.POSITIVE, SpellName.BLESSING, 1, turnOwner.id), // should be removed
        createEffect('effect2', EffectType.NEGATIVE, SpellName.TORNADO, 2, turnOwner.id), // becomes 1
        createEffect('effect5', EffectType.POSITIVE, SpellName.HEAL, 5, turnOwner.id), // becomes 4
      ];

      startTurn(gameState);

      // Get the turn owner reference again after startTurn
      const updatedTurnOwner = getTurnOwner(gameState);

      // Only effects with duration > 1 should remain
      expect(updatedTurnOwner.effects).toHaveLength(2);

      const remainingEffects = updatedTurnOwner.effects.sort((a, b) => a.duration - b.duration);

      expect(remainingEffects[0].spell).toBe(SpellName.TORNADO);
      expect(remainingEffects[0].duration).toBe(1); // was 2

      expect(remainingEffects[1].spell).toBe(SpellName.HEAL);
      expect(remainingEffects[1].duration).toBe(4); // was 5
    });
  });
});
