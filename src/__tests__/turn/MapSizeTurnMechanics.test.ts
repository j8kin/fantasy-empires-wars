import { GameState, TurnPhase } from '../../types/GameState';
import { TurnManager } from '../../turn/TurnManager';
import { createGameStateStub } from '../utils/createGameStateStub';

describe('Turn Mechanics with Different Map Sizes', () => {
  const createGameState = (mapSize: 'small' | 'medium' | 'large' | 'huge'): GameState => {
    const dimensions = {
      small: { rows: 6, cols: 13 },
      medium: { rows: 9, cols: 18 },
      large: { rows: 11, cols: 23 },
      huge: { rows: 15, cols: 31 },
    };

    return createGameStateStub({
      nPlayers: 2,
      battlefieldSize: dimensions[mapSize],
      turnPhase: TurnPhase.START,
    });
  };

  test.each(['small', 'medium', 'large', 'huge'])(
    'Turn manager should work correctly with %s map',
    (mapSize) => {
      const gameState = createGameState(mapSize as 'small' | 'medium' | 'large' | 'huge');

      let turnPhaseChanges: { gameState: GameState; phase: TurnPhase }[] = [];
      let gameOverCalled = false;
      let progressCalled = false;

      const turnManager = new TurnManager({
        onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => {
          turnPhaseChanges.push({ gameState, phase });
        },
        onGameOver: () => {
          gameOverCalled = true;
        },
        onStartProgress: () => {
          progressCalled = true;
        },
        onHideProgress: () => {},
        onComputerMainTurn: () => {},
      });

      // Start a new turn
      turnManager.startNewTurn(gameState);

      // Should have called onTurnPhaseChange with START phase
      expect(turnPhaseChanges).toHaveLength(1);
      expect(turnPhaseChanges[0].phase).toBe(TurnPhase.START);
      expect(progressCalled).toBe(true);
      expect(gameOverCalled).toBe(false);

      // Game state should have the correct dimensions
      expect(gameState.battlefield.dimensions).toBeDefined();
      expect(gameState.battlefield.lands).toBeDefined();
      expect(Object.keys(gameState.battlefield.lands).length).toBeGreaterThan(0);

      // Turn owner should be set correctly
      expect(gameState.turnOwner).toBe('alaric');
      expect(gameState.turn).toBe(1);
    }
  );

  test.each(['small', 'medium', 'large', 'huge'])(
    'Turn manager should handle turn ending correctly with %s map',
    (mapSize) => {
      const gameState = createGameState(mapSize as 'small' | 'medium' | 'large' | 'huge');

      let turnPhaseChanges: { gameState: GameState; phase: TurnPhase }[] = [];
      let gameOverCalled = false;

      const turnManager = new TurnManager({
        onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => {
          turnPhaseChanges.push({ gameState, phase });
        },
        onGameOver: () => {
          gameOverCalled = true;
        },
        onStartProgress: () => {},
        onHideProgress: () => {},
        onComputerMainTurn: () => {},
      });

      // Set to MAIN phase first
      gameState.turnPhase = TurnPhase.MAIN;

      // End the current turn
      turnManager.endCurrentTurn(gameState);

      // Should have called onTurnPhaseChange with END phase
      expect(turnPhaseChanges).toHaveLength(1);
      expect(turnPhaseChanges[0].phase).toBe(TurnPhase.END);
      expect(gameOverCalled).toBe(false);

      // Turn should advance to next player
      expect(gameState.turnOwner).toBe('morgana');
    }
  );

  test('Game state initialization should work for all map sizes', () => {
    const mapSizes = ['small', 'medium', 'large', 'huge'] as const;

    mapSizes.forEach((mapSize) => {
      const gameState = createGameState(mapSize);

      // Check battlefield is properly initialized
      expect(gameState.battlefield).toBeDefined();
      expect(gameState.battlefield.dimensions).toBeDefined();
      expect(gameState.battlefield.lands).toBeDefined();

      // Check dimensions are correct
      const expectedDimensions = {
        small: { rows: 6, cols: 13 },
        medium: { rows: 9, cols: 18 },
        large: { rows: 11, cols: 23 },
        huge: { rows: 15, cols: 31 },
      };

      expect(gameState.battlefield.dimensions).toEqual(expectedDimensions[mapSize]);

      // Check that lands were generated
      const actualLandCount = Object.keys(gameState.battlefield.lands).length;

      // Account for hexagonal map structure (odd rows have one less column)
      const oddRows = Math.ceil(expectedDimensions[mapSize].rows / 2);
      const evenRows = Math.floor(expectedDimensions[mapSize].rows / 2);
      const expectedHexLandCount =
        oddRows * expectedDimensions[mapSize].cols +
        evenRows * (expectedDimensions[mapSize].cols - 1);

      expect(actualLandCount).toBe(expectedHexLandCount);

      // Check players are properly set
      expect(gameState.players).toHaveLength(2);
      expect(gameState.turnOwner).toBe('alaric');
      expect(gameState.turn).toBe(1);
    });
  });
});
