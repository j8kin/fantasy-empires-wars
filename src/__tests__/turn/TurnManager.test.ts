import * as startTurnModule from '../../turn/startTurn';
import * as endTurnModule from '../../turn/endTurn';
import * as mainAiTurnModule from '../../turn/mainAiTurn';
import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';
import { GameState, TurnPhase } from '../../state/GameState';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

// Mock the turn modules
jest.mock('../../turn/startTurn');
jest.mock('../../turn/endTurn');
jest.mock('../../turn/mainAiTurn');

// Mock timers
jest.useFakeTimers();

const mockStartTurn = startTurnModule.startTurn as jest.MockedFunction<
  typeof startTurnModule.startTurn
>;
const mockEndTurn = endTurnModule.endTurn as jest.MockedFunction<typeof endTurnModule.endTurn>;
const mockMainAiTurn = mainAiTurnModule.mainAiTurn as jest.MockedFunction<
  typeof mainAiTurnModule.mainAiTurn
>;

describe('TurnManager', () => {
  let turnManager: TurnManager;
  let mockCallbacks: jest.Mocked<TurnManagerCallbacks>;
  let mockGameState: GameState;

  const createMockGameState = (turnOwner: number = 0, turn: number = 2): GameState => {
    const gameStateStub = createDefaultGameStateStub();
    while (gameStateStub.turn < turn) gameStateStub.nextPlayer();
    while (gameStateStub.turnOwner.id !== gameStateStub.allPlayers[turnOwner].id)
      gameStateStub.nextPlayer();

    return gameStateStub;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallbacks = {
      onTurnPhaseChange: jest.fn(),
      onGameOver: jest.fn(),
      onStartProgress: jest.fn(),
      onHideProgress: jest.fn(),
      onComputerMainTurn: jest.fn(),
      onHeroOutcomeResult: jest.fn(),
    };

    turnManager = new TurnManager(mockCallbacks);
    mockGameState = createMockGameState();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Constructor', () => {
    it('should initialize with provided callbacks', () => {
      expect(turnManager).toBeInstanceOf(TurnManager);
    });
  });

  describe('startNewTurn', () => {
    it('should set turn phase to START and call onTurnPhaseChange', () => {
      turnManager.startNewTurn(mockGameState);

      expect(mockGameState.turnPhase).toBe(TurnPhase.START);
      expect(mockCallbacks.onTurnPhaseChange).toHaveBeenCalledWith(mockGameState, TurnPhase.START);
    });

    it('should show place hero message during turn 1', () => {
      expect(mockGameState.turn).toBe(2);
      turnManager.startNewTurn(mockGameState);

      expect(mockCallbacks.onStartProgress).toHaveBeenCalledWith(
        'The banners of Alaric the Bold rise over a new realm!'
      );
    });

    it('should show progress message for current player', () => {
      turnManager.startNewTurn(mockGameState);

      expect(mockCallbacks.onStartProgress).toHaveBeenCalledWith('Player Alaric the Bold turn');
    });

    it('should execute start turn logic after timeout', () => {
      turnManager.startNewTurn(mockGameState);

      expect(mockStartTurn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(mockStartTurn).toHaveBeenCalledWith(mockGameState, expect.any(Function));
    });

    it('should transition to END phase after start turn execution on Turn 1', () => {
      expect(mockGameState.turn).toBe(1);
      turnManager.startNewTurn(mockGameState);

      jest.advanceTimersByTime(1000);

      expect(mockGameState.turnPhase).toBe(TurnPhase.END);
      expect(mockCallbacks.onTurnPhaseChange).toHaveBeenCalledWith(mockGameState, TurnPhase.END);
    });

    it('should transition to main phase after start turn execution', () => {
      turnManager.startNewTurn(mockGameState);

      jest.advanceTimersByTime(1000);

      expect(mockGameState.turnPhase).toBe(TurnPhase.MAIN);
      expect(mockCallbacks.onTurnPhaseChange).toHaveBeenCalledWith(mockGameState, TurnPhase.MAIN);
    });
  });

  describe('startMainPhase (private method behavior)', () => {
    it('should NOT handle human player main phase on Turn 1', () => {
      expect(mockGameState.turn).toBe(1);
      turnManager.startNewTurn(mockGameState);

      jest.advanceTimersByTime(1000);

      expect(mockCallbacks.onHideProgress).not.toHaveBeenCalled();
      expect(mockCallbacks.onComputerMainTurn).not.toHaveBeenCalled();
      expect(mockMainAiTurn).not.toHaveBeenCalled();
    });

    it('should handle human player main phase', () => {
      turnManager.startNewTurn(mockGameState);

      jest.advanceTimersByTime(1000);

      expect(mockCallbacks.onHideProgress).toHaveBeenCalled();
      expect(mockCallbacks.onComputerMainTurn).not.toHaveBeenCalled();
      expect(mockMainAiTurn).not.toHaveBeenCalled();
    });

    it('should NOT handle computer player main phase on Turn 1', () => {
      const aiGameState = createMockGameState(1, 1);
      turnManager.startNewTurn(aiGameState);

      jest.advanceTimersByTime(1000);

      expect(mockCallbacks.onComputerMainTurn).not.toHaveBeenCalled();
      expect(mockMainAiTurn).not.toHaveBeenCalled();
      expect(mockCallbacks.onHideProgress).not.toHaveBeenCalled();
    });

    it('should handle computer player main phase', () => {
      const aiGameState = createMockGameState(1, 2);
      turnManager.startNewTurn(aiGameState);

      jest.advanceTimersByTime(1000);

      expect(mockCallbacks.onComputerMainTurn).toHaveBeenCalledWith(aiGameState);
      expect(mockMainAiTurn).toHaveBeenCalledWith(aiGameState);
      expect(mockCallbacks.onHideProgress).not.toHaveBeenCalled();
    });

    it('should auto-end computer turn after delay', () => {
      const aiGameState = createMockGameState(1);
      const endCurrentTurnSpy = jest.spyOn(turnManager, 'endCurrentTurn');

      turnManager.startNewTurn(aiGameState);

      jest.advanceTimersByTime(1000); // Start turn delay
      jest.advanceTimersByTime(2000); // Computer turn delay

      expect(endCurrentTurnSpy).toHaveBeenCalledWith(aiGameState);
    });
  });

  describe('endCurrentTurn', () => {
    it('should set turn phase to END and call onTurnPhaseChange', () => {
      turnManager.endCurrentTurn(mockGameState);

      expect(mockGameState.turnPhase).toBe(TurnPhase.END);
      expect(mockCallbacks.onTurnPhaseChange).toHaveBeenCalledWith(mockGameState, TurnPhase.END);
    });

    it('should execute end turn logic', () => {
      turnManager.endCurrentTurn(mockGameState);

      expect(mockEndTurn).toHaveBeenCalledWith(mockGameState);
    });

    it('should NOT check for game over with no human players on Turn 1', () => {
      const gameStateNoHumans = {
        ...mockGameState,
        players: mockGameState.allPlayers.map((p) => ({ ...p, playerType: 'computer' as const })),
        turn: 1,
      };

      turnManager.endCurrentTurn(gameStateNoHumans);

      expect(mockCallbacks.onGameOver).not.toHaveBeenCalled();
    });

    it('should check for game over when no human players remain', () => {
      const gameStateNoHumans = {
        ...mockGameState,
        players: mockGameState.allPlayers.map((p) => ({ ...p, playerType: 'computer' as const })),
        turn: 2,
      };

      turnManager.endCurrentTurn(gameStateNoHumans);

      expect(mockCallbacks.onGameOver).toHaveBeenCalledWith(
        'Game Over: No human players remaining'
      );
    });

    it('should NOT check for game over when no computer players remain on Turn 1', () => {
      const gameStateNoComputers = {
        ...mockGameState,
        players: mockGameState.allPlayers.map((p) => ({ ...p, playerType: 'human' as const })),
        turn: 1,
      };

      turnManager.endCurrentTurn(gameStateNoComputers);

      expect(mockCallbacks.onGameOver).not.toHaveBeenCalled();
    });

    it('should check for game over when no computer players remain', () => {
      const gameStateNoComputers = {
        ...mockGameState,
        players: mockGameState.allPlayers.map((p) => ({ ...p, playerType: 'human' as const })),
        turn: 2,
      };

      turnManager.endCurrentTurn(gameStateNoComputers);

      expect(mockCallbacks.onGameOver).toHaveBeenCalledWith(
        'Game Over: No computer players remaining'
      );
    });

    it('should start next turn after delay when game continues', () => {
      const startNewTurnSpy = jest.spyOn(turnManager, 'startNewTurn');

      turnManager.endCurrentTurn(mockGameState);

      expect(startNewTurnSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(startNewTurnSpy).toHaveBeenCalledWith(mockGameState);
    });

    it('should not start next turn when game ends', () => {
      const startNewTurnSpy = jest.spyOn(turnManager, 'startNewTurn');
      const gameStateNoHumans = {
        ...mockGameState,
        players: mockGameState.allPlayers.map((p) => ({ ...p, playerType: 'computer' as const })),
        turn: 2,
      };

      turnManager.endCurrentTurn(gameStateNoHumans);

      jest.advanceTimersByTime(500);

      expect(startNewTurnSpy).not.toHaveBeenCalled();
    });
  });

  describe('canEndTurn', () => {
    it('should return true for human player in main phase', () => {
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[0].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.MAIN) mockGameState.nextPhase();

      const result = turnManager.canEndTurn(mockGameState);

      expect(result).toBe(true);
    });

    it('should return false for computer player in main phase', () => {
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[1].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.MAIN) mockGameState.nextPhase();

      const result = turnManager.canEndTurn(mockGameState);

      expect(result).toBe(false);
    });

    it('should return false when not in main phase', () => {
      // human player in START phase
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[1].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.START) mockGameState.nextPhase();

      const result = turnManager.canEndTurn(mockGameState);

      expect(result).toBe(false);
    });

    it('should return false in END phase', () => {
      // human player in END phase
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[1].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.END) mockGameState.nextPhase();

      const result = turnManager.canEndTurn(mockGameState);

      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete turn cycle for human player', () => {
      const startNewTurnSpy = jest.spyOn(turnManager, 'startNewTurn');

      // Start turn
      turnManager.startNewTurn(mockGameState);
      expect(mockGameState.turnPhase).toBe(TurnPhase.START);

      // Advance to main phase
      jest.advanceTimersByTime(1000);
      expect(mockGameState.turnPhase).toBe(TurnPhase.MAIN);
      expect(mockCallbacks.onHideProgress).toHaveBeenCalled();

      // End turn
      turnManager.endCurrentTurn(mockGameState);
      expect(mockGameState.turnPhase).toBe(TurnPhase.END);

      // Next turn starts
      jest.advanceTimersByTime(500);
      expect(startNewTurnSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle complete turn cycle for computer player', () => {
      const aiGameState = createMockGameState(1);
      const endCurrentTurnSpy = jest.spyOn(turnManager, 'endCurrentTurn');

      // Start turn
      turnManager.startNewTurn(aiGameState);
      expect(aiGameState.turnPhase).toBe(TurnPhase.START);

      // Advance to main phase
      jest.advanceTimersByTime(1000);
      expect(aiGameState.turnPhase).toBe(TurnPhase.MAIN);
      expect(mockCallbacks.onComputerMainTurn).toHaveBeenCalled();
      expect(mockMainAiTurn).toHaveBeenCalled();

      // Auto end turn
      jest.advanceTimersByTime(2000);
      expect(endCurrentTurnSpy).toHaveBeenCalled();
    });

    it('should handle callbacks being called in correct sequence', () => {
      const callOrder: string[] = [];

      mockCallbacks.onTurnPhaseChange.mockImplementation((_, phase) => {
        callOrder.push(`onTurnPhaseChange-${phase}`);
      });
      mockCallbacks.onStartProgress.mockImplementation(() => {
        callOrder.push('onStartProgress');
      });
      mockCallbacks.onHideProgress.mockImplementation(() => {
        callOrder.push('onHideProgress');
      });

      turnManager.startNewTurn(mockGameState);
      jest.advanceTimersByTime(1000);

      expect(callOrder).toEqual([
        'onTurnPhaseChange-START',
        'onStartProgress',
        'onTurnPhaseChange-MAIN',
        'onHideProgress',
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid startNewTurn calls', () => {
      turnManager.startNewTurn(mockGameState);
      turnManager.startNewTurn(mockGameState);
      turnManager.startNewTurn(mockGameState);

      expect(mockCallbacks.onStartProgress).toHaveBeenCalledTimes(3);
    });

    it('should handle endCurrentTurn called multiple times', () => {
      const startNewTurnSpy = jest.spyOn(turnManager, 'startNewTurn');

      turnManager.endCurrentTurn(mockGameState);
      turnManager.endCurrentTurn(mockGameState);

      jest.advanceTimersByTime(500);

      expect(startNewTurnSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed human and computer players correctly', () => {
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[0].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.MAIN) mockGameState.nextPhase();

      // Test human turn first
      expect(turnManager.canEndTurn(mockGameState)).toBe(true);

      // Switch to computer player
      while (mockGameState.turnOwner.id !== mockGameState.allPlayers[1].id)
        mockGameState.nextPlayer();
      while (mockGameState.turnPhase !== TurnPhase.MAIN) mockGameState.nextPhase();

      expect(turnManager.canEndTurn(mockGameState)).toBe(false);
    });

    it('should properly clean up timers on rapid successive calls', () => {
      turnManager.startNewTurn(mockGameState);
      turnManager.startNewTurn(mockGameState);

      jest.advanceTimersByTime(1000);

      // Should not cause multiple calls to startTurn
      expect(mockStartTurn).toHaveBeenCalledTimes(2);
    });
  });
});
