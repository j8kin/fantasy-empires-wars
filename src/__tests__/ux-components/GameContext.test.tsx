import { render, renderHook, act, screen } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { TurnManager } from '../../turn/TurnManager';
import { calculateIncome } from '../../map/vault/calculateIncome';
import { calculateMaintenance } from '../../map/vault/calculateMaintenance';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

// Mock the mapGeneration module to return empty tiles initially
jest.mock('../../map/generation/generateMap', () => ({
  initializeMap: jest.fn(() => ({})),
}));

// Mock the income calculation functions
jest.mock('../../map/vault/calculateIncome');
jest.mock('../../map/vault/calculateMaintenance');

// Mock TurnManager
jest.mock('../../turn/TurnManager');

const mockCalculateIncome = calculateIncome as jest.MockedFunction<typeof calculateIncome>;
const mockCalculateMaintenance = calculateMaintenance as jest.MockedFunction<typeof calculateMaintenance>;

const mockTurnManager = {
  startNewTurn: jest.fn(),
  endCurrentTurn: jest.fn(),
};

const MockedTurnManager = TurnManager as jest.MockedClass<typeof TurnManager>;
MockedTurnManager.mockImplementation(() => mockTurnManager as any);

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateIncome.mockReturnValue(100);
    mockCalculateMaintenance.mockReturnValue(20);

    // Reset all mock functions
    mockTurnManager.startNewTurn.mockClear();
    mockTurnManager.endCurrentTurn.mockClear();

    // Ensure the TurnManager mock constructor returns our mock instance
    MockedTurnManager.mockClear();
    MockedTurnManager.mockImplementation(() => mockTurnManager as any);
  });

  describe('Basic Provider Functionality', () => {
    it('should render provider without errors', () => {
      const TestComponent = () => <div>Test Content</div>;

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with undefined game state', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      expect(result.current.gameState).toBeUndefined();
    });

    it('should provide all context methods', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      expect(typeof result.current.updateGameState).toBe('function');
      expect(typeof result.current.startNewTurn).toBe('function');
      expect(typeof result.current.endCurrentTurn).toBe('function');
      expect(typeof result.current.setTurnManagerCallbacks).toBe('function');
    });
  });

  describe('Game State Management', () => {
    it('should update game state and initialize TurnManager', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const gameStateStub = createDefaultGameStateStub();

      act(() => {
        result.current.updateGameState(gameStateStub);
      });

      expect(result.current.gameState).toEqual(gameStateStub);
      expect(MockedTurnManager).toHaveBeenCalledWith(
        expect.objectContaining({
          onTurnPhaseChange: expect.any(Function),
          onGameOver: expect.any(Function),
          onStartProgress: expect.any(Function),
          onHideProgress: expect.any(Function),
          onComputerMainTurn: expect.any(Function),
        })
      );
    });

    it('should not reinitialize TurnManager if already exists', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const gameStateStub = createDefaultGameStateStub();

      act(() => {
        result.current.updateGameState(gameStateStub);
      });

      const firstCallCount = (TurnManager as jest.MockedClass<typeof TurnManager>).mock.calls.length;

      act(() => {
        result.current.updateGameState({ ...gameStateStub, turn: 2 });
      });

      expect(MockedTurnManager.mock.calls).toHaveLength(firstCallCount);
    });
  });

  describe('Turn Management', () => {
    it('should start new turn when TurnManager is available', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const gameStateStub = createDefaultGameStateStub();

      act(() => {
        result.current.updateGameState(gameStateStub);
      });

      act(() => {
        result.current.startNewTurn();
      });

      expect(mockTurnManager.startNewTurn).toHaveBeenCalledWith(result.current.gameState);
    });

    it('should end current turn when TurnManager is available', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const gameStateStub = createDefaultGameStateStub();

      act(() => {
        result.current.updateGameState(gameStateStub);
      });

      act(() => {
        result.current.endCurrentTurn();
      });

      expect(mockTurnManager.endCurrentTurn).toHaveBeenCalledWith(result.current.gameState);
    });

    it('should not perform turn operations without TurnManager or gameState', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      act(() => {
        result.current.startNewTurn();
        result.current.endCurrentTurn();
      });

      expect(mockTurnManager.startNewTurn).not.toHaveBeenCalled();
      expect(mockTurnManager.endCurrentTurn).not.toHaveBeenCalled();
    });
  });

  describe('Turn Manager Callbacks', () => {
    it('should set turn manager callbacks', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockCallbacks = {
        onGameOver: jest.fn(),
        onStartProgress: jest.fn(),
      };

      act(() => {
        result.current.setTurnManagerCallbacks(mockCallbacks);
      });

      // Callbacks should be stored internally (tested via TurnManager initialization)
      const gameStateStub = createDefaultGameStateStub();
      act(() => {
        result.current.updateGameState(gameStateStub);
      });

      expect(TurnManager).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useGameContext is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGameContext());
      }).toThrow('useGame must be used within a GameProvider');

      consoleSpy.mockRestore();
    });
  });
});
