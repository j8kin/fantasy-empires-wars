import { render, renderHook, act, screen } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { GameState, TurnPhase } from '../../types/GameState';
import { GamePlayer } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { HeroUnitType } from '../../types/Army';
import { DiplomacyStatus } from '../../types/Diplomacy';
import { TurnManager } from '../../turn/TurnManager';
import { calculateIncome } from '../../map/gold/calculateIncome';
import { calculateMaintenance } from '../../map/gold/calculateMaintenance';

// Mock the mapGeneration module to return empty tiles initially
jest.mock('../../map/generation/generateMap', () => ({
  initializeMap: jest.fn(() => ({})),
}));

// Mock the income calculation functions
jest.mock('../../map/gold/calculateIncome');
jest.mock('../../map/gold/calculateMaintenance');

// Mock TurnManager
jest.mock('../../turn/TurnManager');

const mockCalculateIncome = calculateIncome as jest.MockedFunction<typeof calculateIncome>;
const mockCalculateMaintenance = calculateMaintenance as jest.MockedFunction<
  typeof calculateMaintenance
>;

const mockTurnManager = {
  startNewTurn: jest.fn(),
  endCurrentTurn: jest.fn(),
};

const MockedTurnManager = TurnManager as jest.MockedClass<typeof TurnManager>;
MockedTurnManager.mockImplementation(() => mockTurnManager as any);

describe('GameContext', () => {
  const createMockGameState = (): GameState => ({
    battlefield: {
      dimensions: { rows: 5, cols: 5 },
      lands: {
        '0-0': {
          mapPos: { row: 0, col: 0 },
          land: { type: 'grassland', name: 'Grassland' } as any,
          controlledBy: 'player1',
          goldPerTurn: 10,
          buildings: [],
          army: { units: [] } as any,
        },
        '0-1': {
          mapPos: { row: 0, col: 1 },
          land: { type: 'mountain', name: 'Mountain' } as any,
          controlledBy: 'player2',
          goldPerTurn: 15,
          buildings: [],
          army: { units: [] } as any,
        },
      },
    },
    turn: 1,
    turnOwner: 'player1',
    turnPhase: TurnPhase.MAIN,
    players: [
      {
        id: 'player1',
        name: 'Test Player 1',
        alignment: Alignment.NEUTRAL,
        race: 'Human',
        type: HeroUnitType.FIGHTER,
        level: 1,
        description: 'Test player 1',
        color: 'blue',
        mana: { red: 0, blue: 0, green: 0, black: 0, white: 0 },
        vault: 100,
        income: 50,
        diplomacy: { player2: DiplomacyStatus.NO_TREATY },
        playerType: 'human',
        empireTreasures: [],
        quests: [],
      } as GamePlayer,
      {
        id: 'player2',
        name: 'Test Player 2',
        alignment: Alignment.NEUTRAL,
        race: 'Elf',
        type: HeroUnitType.RANGER,
        level: 1,
        description: 'Test player 2',
        color: 'red',
        mana: { red: 0, blue: 0, green: 0, black: 0, white: 0 },
        vault: 80,
        income: 30,
        diplomacy: { player1: DiplomacyStatus.NO_TREATY },
        playerType: 'computer',
        empireTreasures: [],
        quests: [],
      } as GamePlayer,
    ],
  });

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

      expect(typeof result.current.getTotalPlayerGold).toBe('function');
      expect(typeof result.current.updateGameState).toBe('function');
      expect(typeof result.current.recalculateActivePlayerIncome).toBe('function');
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

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      expect(result.current.gameState).toEqual(mockGameState);
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

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const firstCallCount = (TurnManager as jest.MockedClass<typeof TurnManager>).mock.calls
        .length;

      act(() => {
        result.current.updateGameState({ ...mockGameState, turn: 2 });
      });

      expect(MockedTurnManager.mock.calls.length).toBe(firstCallCount);
    });
  });

  describe('Player Gold Calculation', () => {
    it('should calculate total player gold correctly', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();
      const player1 = mockGameState.players[0];

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const totalGold = result.current.getTotalPlayerGold(player1);
      expect(totalGold).toBe(10); // Only the land controlled by player1
    });

    it('should return 0 for player with no controlled lands', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();
      const playerWithNoLands = {
        ...mockGameState.players[0],
        id: 'player3',
      };

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      const totalGold = result.current.getTotalPlayerGold(playerWithNoLands);
      expect(totalGold).toBe(0);
    });

    it('should return 0 for getTotalPlayerGold with no game state', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockPlayer = { id: 'test-player' } as any;
      const gold = result.current.getTotalPlayerGold(mockPlayer);
      expect(gold).toBe(0);
    });
  });

  describe('Income Recalculation', () => {
    it('should recalculate active player income', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
      });

      act(() => {
        result.current.recalculateActivePlayerIncome();
      });

      const updatedState = result.current.gameState;
      const activePlayer = updatedState?.players.find((p) => p.id === mockGameState.turnOwner);
      expect(activePlayer?.income).toBe(80); // 100 - 20 from mocked functions
    });

    it('should not recalculate if no game state or turn owner', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      act(() => {
        result.current.recalculateActivePlayerIncome();
      });

      expect(result.current.gameState).toBeUndefined();
    });
  });

  describe('Turn Management', () => {
    it('should start new turn when TurnManager is available', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
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

      const mockGameState = createMockGameState();

      act(() => {
        result.current.updateGameState(mockGameState);
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
      const mockGameState = createMockGameState();
      act(() => {
        result.current.updateGameState(mockGameState);
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
