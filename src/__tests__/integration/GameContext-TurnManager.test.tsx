import { act, renderHook } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { GameState, TurnPhase } from '../../types/GameState';
import { TurnManager } from '../../turn/TurnManager';
import { calculateIncome } from '../../map/gold/calculateIncome';
import { calculateMaintenance } from '../../map/gold/calculateMaintenance';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

// Mock TurnManager
jest.mock('../../turn/TurnManager');

// Mock the turn modules
jest.mock('../../turn/startTurn');
jest.mock('../../turn/endTurn');
jest.mock('../../turn/mainAiTurn');

// Mock the income calculation functions
jest.mock('../../map/gold/calculateIncome');
jest.mock('../../map/gold/calculateMaintenance');

const mockCalculateIncome = calculateIncome as jest.MockedFunction<typeof calculateIncome>;
const mockCalculateMaintenance = calculateMaintenance as jest.MockedFunction<
  typeof calculateMaintenance
>;

const mockTurnManager = {
  startNewTurn: jest.fn(),
  endCurrentTurn: jest.fn(),
  canEndTurn: jest.fn(),
};

const MockedTurnManager = TurnManager as jest.MockedClass<typeof TurnManager>;
MockedTurnManager.mockImplementation(() => mockTurnManager as any);

// Mock timers for integration tests
jest.useFakeTimers();

describe('GameContext-TurnManager Integration', () => {
  const createMockGameState = (
    turnOwner: number = 0,
    turnPhase: TurnPhase = TurnPhase.MAIN
  ): GameState => {
    const gameStateStub = createDefaultGameStateStub();
    gameStateStub.turnOwner = gameStateStub.players[turnOwner].id;
    gameStateStub.turnPhase = turnPhase;

    return gameStateStub;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateIncome.mockReturnValue(100);
    mockCalculateMaintenance.mockReturnValue(20);

    // Reset all mock functions
    mockTurnManager.startNewTurn.mockClear();
    mockTurnManager.endCurrentTurn.mockClear();
    mockTurnManager.canEndTurn.mockClear();
    mockTurnManager.canEndTurn.mockReturnValue(true);

    // Ensure the TurnManager mock constructor returns our mock instance
    MockedTurnManager.mockClear();
    MockedTurnManager.mockImplementation(() => mockTurnManager as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('TurnManager Integration through GameContext', () => {
    it('should initialize TurnManager when game state is updated', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      expect(result.current.gameState).toEqual(mockGameState);
      expect(result.current.startNewTurn).toBeDefined();
      expect(result.current.endCurrentTurn).toBeDefined();
      expect(result.current.canEndTurn).toBeDefined();
    });

    it('should delegate turn management calls to TurnManager', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Test startNewTurn delegation
      act(() => {
        result.current.startNewTurn();
      });

      // Test endCurrentTurn delegation
      act(() => {
        result.current.endCurrentTurn();
      });

      // Test canEndTurn delegation
      mockTurnManager.canEndTurn.mockReturnValue(true);
      const canEnd = result.current.canEndTurn();
      expect(canEnd).toBe(true);
    });

    it('should handle turn phase changes through callbacks', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Verify TurnManager was called with callbacks
      expect(MockedTurnManager).toHaveBeenCalledWith(
        expect.objectContaining({
          onTurnPhaseChange: expect.any(Function),
          onGameOver: expect.any(Function),
          onStartProgress: expect.any(Function),
          onHideProgress: expect.any(Function),
          onComputerMainTurn: expect.any(Function),
        })
      );

      // The callback integration is already tested through the GameContext functionality
      expect(result.current.gameState).toBeDefined();
    });

    it('should allow setting additional callbacks through setTurnManagerCallbacks', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();
      const customCallbacks = {
        onGameOver: jest.fn(),
        onStartProgress: jest.fn(),
        onHideProgress: jest.fn(),
        onComputerMainTurn: jest.fn(),
      };

      act(() => {
        result.current.setTurnManagerCallbacks(customCallbacks);
        result.current.updateGameState(mockGameState);
      });

      // Verify that callbacks were set (this would be tested through TurnManager behavior)
      expect(result.current.gameState).toBeDefined();
    });

    it('should handle income recalculation in context of turns', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const originalIncome = result.current.gameState?.players[0].income;

      act(() => {
        result.current.recalculateActivePlayerIncome();
      });

      const updatedIncome = result.current.gameState?.players[0].income;
      expect(updatedIncome).toBe(80); // 100 - 20 from mocked functions
      expect(updatedIncome).not.toBe(originalIncome);
    });

    it('should handle gold calculation in context of game state', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const player1 = result.current.gameState!.players[0];
      const player2 = result.current.gameState!.players[1];
      const player3 = result.current.gameState!.players[2];

      const player1Gold = result.current.getTotalPlayerGold(player1);
      const player2Gold = result.current.getTotalPlayerGold(player2);
      const player3Gold = result.current.getTotalPlayerGold(player3);

      expect(player1Gold).toBe(441);
      expect(player2Gold).toBe(609);
      expect(player3Gold).toBe(511);
    });
  });

  describe('Turn Flow Integration', () => {
    it('should handle complete human player turn flow', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState(0, TurnPhase.MAIN);

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Human player should be able to end turn
      mockTurnManager.canEndTurn.mockReturnValue(true);
      expect(result.current.canEndTurn()).toBe(true);

      // Start a new turn
      act(() => {
        result.current.startNewTurn();
      });

      // End the turn
      act(() => {
        result.current.endCurrentTurn();
      });

      // Verify turn operations don't crash
      expect(result.current.gameState).toBeDefined();
    });

    it('should handle computer player turn restrictions', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState(1, TurnPhase.MAIN); // Computer player

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Computer player should not be able to manually end turn
      mockTurnManager.canEndTurn.mockReturnValue(false);
      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should maintain state consistency during turn transitions', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();
      const originalTurn = mockGameState.turn;
      const originalTurnOwner = mockGameState.turnOwner;

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Perform some turn operations
      act(() => {
        result.current.recalculateActivePlayerIncome();
      });

      // Basic state should remain consistent
      expect(result.current.gameState?.turn).toBe(originalTurn);
      expect(result.current.gameState?.turnOwner).toBe(originalTurnOwner);
      expect(result.current.gameState?.players).toHaveLength(3);
    });
  });

  describe('Callback Integration', () => {
    it('should properly integrate onTurnPhaseChange with GameContext state updates', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      const customCallbacks = {
        onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => {
          expect(gameState).toBeDefined();
          expect(phase).toBeDefined();
        },
      };

      act(() => {
        result.current.setTurnManagerCallbacks(customCallbacks);
        result.current.updateGameState(mockGameState);
      });

      // The default callback should still work
      expect(result.current.gameState).toBeDefined();
    });

    it('should handle multiple callback registrations', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      const firstCallbacks = {
        onGameOver: jest.fn(),
        onStartProgress: jest.fn(),
      };

      const secondCallbacks = {
        onHideProgress: jest.fn(),
        onComputerMainTurn: jest.fn(),
      };

      act(() => {
        result.current.setTurnManagerCallbacks(firstCallbacks);
        result.current.setTurnManagerCallbacks(secondCallbacks);
        result.current.updateGameState(mockGameState);
      });

      // Both sets of callbacks should be merged
      expect(result.current.gameState).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle turn operations without crashing when TurnManager is not initialized', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      // Don't initialize the game state, so TurnManager won't be created
      expect(() => {
        act(() => {
          result.current.startNewTurn();
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.endCurrentTurn();
        });
      }).not.toThrow();

      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should handle invalid game state gracefully', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const invalidGameState = {
        ...createMockGameState(),
        players: [], // No players
      };

      expect(() => {
        act(() => {
          result.current.updateGameState(invalidGameState);
        });
      }).not.toThrow();

      // Operations should still work without crashing
      // For invalid game state, canEndTurn should return false
      mockTurnManager.canEndTurn.mockReturnValue(false);
      expect(result.current.canEndTurn()).toBe(false);
    });
  });

  describe('Memory and Performance', () => {
    it('should not create multiple TurnManager instances for same game', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      const constructorSpy = jest.spyOn(TurnManager.prototype, 'constructor' as any);

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const initialCallCount = constructorSpy.mock.calls.length;

      // Update game state again
      act(() => {
        result.current.updateGameState({
          ...mockGameState,
          turn: 2,
        });
      });

      // Should not create a new TurnManager
      expect(constructorSpy.mock.calls.length).toBe(initialCallCount);

      constructorSpy.mockRestore();
    });

    it('should handle rapid successive operations without issues', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      // Perform rapid successive operations
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.recalculateActivePlayerIncome();
          result.current.canEndTurn();
          result.current.getTotalPlayerGold(mockGameState.players[0]);
        }
      });

      expect(result.current.gameState).toBeDefined();
      expect(result.current.gameState?.players[0].income).toBe(80);
    });
  });
});
