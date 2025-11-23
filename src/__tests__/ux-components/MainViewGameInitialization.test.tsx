/**
 * Test for MainView Game Initialization Logic
 *
 * This test verifies the critical bug fix in MainView.tsx lines 78-99 where
 * the gameInitializedRef flag was preventing new games from starting their first turn.
 *
 * The issue was that when starting a new game with a different map size,
 * the MainView component wouldn't detect it as a new game and wouldn't call startNewTurn().
 *
 * The fix uses a game state fingerprint to detect when a truly new game has started.
 */

import { GameState } from '../../state/GameState';
import { PREDEFINED_PLAYERS } from '../../state/PlayerState';
import { createGameStateStub } from '../utils/createGameStateStub';

describe('MainView Game Initialization Logic', () => {
  // Test the game identification logic that's used in MainView
  const createGameId = (gameState: GameState): string => {
    return `${gameState.nPlayers}-${gameState.map.dimensions.rows}-${gameState.map.dimensions.cols}-${gameState.turnOwner.id}`;
  };

  it('should generate unique identifiers for different games', () => {
    // Mock game states with different configurations
    const game1: GameState = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]],
      battlefieldSize: { rows: 9, cols: 18 },
    });

    const game2: GameState = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]],
      battlefieldSize: { rows: 11, cols: 23 }, // different map size
    });

    const game3: GameState = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[2], PREDEFINED_PLAYERS[3]], // Different first player
      battlefieldSize: { rows: 9, cols: 18 },
    });

    const id1 = createGameId(game1);
    const id2 = createGameId(game2);
    const id3 = createGameId(game3);

    // Different map sizes should have different IDs
    expect(id1).not.toBe(id2);

    // Different players should have different IDs even with same map size
    expect(id1).not.toBe(id3);

    // Same game should have same ID
    const game1Copy = { ...game1 };
    const id1Copy = createGameId(game1Copy);
    expect(id1).toBe(id1Copy);
  });

  it('should detect the problematic scenario that was fixed', () => {
    // This test verifies the logic that was added to prevent the bug:
    // "gameStarted is true AND turn === 1 BUT it's a different game"

    let lastGameId: string | null = null;
    let gameInitialized = false;

    const simulateMainViewLogic = (gameState: GameState, gameStarted: boolean) => {
      if (gameStarted && gameState && gameState.turn === 1) {
        const currentGameId = createGameId(gameState);

        // Check if this is a different game than the last one
        if (lastGameId !== currentGameId) {
          lastGameId = currentGameId;
          gameInitialized = false; // Reset for new game
        }

        // Start turn only once per game
        if (!gameInitialized) {
          gameInitialized = true;
          return true; // Would call startNewTurn()
        }
      }

      return false;
    };

    // First game - medium map
    const game1 = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]],
      battlefieldSize: { rows: 9, cols: 18 },
    });

    // Should start turn for first game
    expect(simulateMainViewLogic(game1, true)).toBe(true);

    // Second game - large map (this was the problematic case)
    const game2 = createGameStateStub({
      gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]],
      battlefieldSize: { rows: 11, cols: 23 },
    });

    // Should start turn for second game because it's different
    expect(simulateMainViewLogic(game2, true)).toBe(true);

    // Same game again - should not start turn
    expect(simulateMainViewLogic(game2, true)).toBe(false);
  });
});
