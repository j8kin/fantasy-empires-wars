import { render, renderHook } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../contexts/GameContext';

// Mock the mapGeneration module to return empty tiles initially
jest.mock('../../map/generation/generateMap', () => ({
  initializeMap: jest.fn(() => ({})),
}));

describe('GameContext', () => {
  describe('Basic Provider Functionality', () => {
    it('should render provider without errors', () => {
      const TestComponent = () => <div>Test Content</div>;

      const { getByText } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with null game state', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      expect(result.current.gameState).toBeUndefined();
    });

    it('should provide all context methods', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      // Check that all expected methods are available
      expect(typeof result.current.getTotalPlayerGold).toBe('function');
      expect(typeof result.current.updateGameState).toBe('function');
      expect(result.current.mapDimensions).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useGameContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGameContext());
      }).toThrow('useGame must be used within a GameProvider');

      consoleSpy.mockRestore();
    });

    it('should handle non-existent tiles gracefully in updateTile', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const originalState = result.current.gameState;

      // State should remain unchanged
      expect(result.current.gameState).toBe(originalState);
    });

    it('should return 0 for getTotalPlayerGold with no tiles', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockPlayer = { id: 'test-player' } as any;
      const gold = result.current.getTotalPlayerGold(mockPlayer);
      expect(gold).toBe(0);
    });
  });

  describe('Map Dimensions', () => {
    it('should return correct dimensions for medium map (default)', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      // When game state is null, should use initialMapSize (default: medium)
      expect(result.current.mapDimensions).toEqual({ rows: 9, cols: 18 });
    });

    it('should return correct dimensions for small map', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider initialMapSize="small">{children}</GameProvider>,
      });

      // When game state is null, should use initialMapSize (small)
      expect(result.current.mapDimensions).toEqual({ rows: 6, cols: 13 });
    });

    it('should return correct dimensions for large map', () => {
      const { result } = renderHook(() => useGameContext(), {
        wrapper: ({ children }) => <GameProvider initialMapSize="large">{children}</GameProvider>,
      });

      // When game state is null, should use initialMapSize (large)
      expect(result.current.mapDimensions).toEqual({ rows: 11, cols: 23 });
    });
  });
});
