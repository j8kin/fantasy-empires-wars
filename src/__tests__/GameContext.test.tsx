import React from 'react';
import { render, renderHook } from '@testing-library/react';
import { GameProvider, useGameState } from '../contexts/GameContext';

// Mock the mapGeneration module to return empty tiles initially
jest.mock('../map/generation/mapGeneration', () => ({
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

    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      expect(result.current.gameState).toBeDefined();
      expect(result.current.gameState.turn).toBe(1);
      expect(result.current.gameState.mapSize).toBe('medium');
      expect(result.current.gameState.selectedPlayer).toBeUndefined();
      expect(result.current.gameState.opponents).toBeUndefined();
    });

    it('should provide all context methods', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      // Check that all expected methods are available
      expect(typeof result.current.updateTile).toBe('function');
      expect(typeof result.current.setTileController).toBe('function');
      expect(typeof result.current.addBuildingToTile).toBe('function');
      expect(typeof result.current.updateTileArmy).toBe('function');
      expect(typeof result.current.getTile).toBe('function');
      expect(typeof result.current.getPlayerTiles).toBe('function');
      expect(typeof result.current.getTotalPlayerGold).toBe('function');
      expect(typeof result.current.nextTurn).toBe('function');
      expect(typeof result.current.changeBattlefieldSize).toBe('function');
      expect(typeof result.current.updateGameConfig).toBe('function');
      expect(result.current.mapDimensions).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useGameState is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGameState());
      }).toThrow('useGame must be used within a GameProvider');

      consoleSpy.mockRestore();
    });

    it('should handle non-existent tiles gracefully in updateTile', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const originalState = result.current.gameState;

      // This should not throw an error
      expect(() => {
        result.current.updateTile('non-existent', { glow: true });
      }).not.toThrow();

      // State should remain unchanged
      expect(result.current.gameState).toBe(originalState);
    });

    it('should handle non-existent position gracefully in getTile', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const tile = result.current.getTile({ row: 999, col: 999 });
      expect(tile).toBeUndefined();
    });

    it('should return empty array for getPlayerTiles with no tiles', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockPlayer = { id: 'test-player' } as any;
      const tiles = result.current.getPlayerTiles(mockPlayer);
      expect(tiles).toEqual([]);
    });

    it('should return 0 for getTotalPlayerGold with no tiles', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      const mockPlayer = { id: 'test-player' } as any;
      const gold = result.current.getTotalPlayerGold(mockPlayer);
      expect(gold).toBe(0);
    });
  });

  describe('Map Dimensions', () => {
    it('should return correct dimensions for medium map (default)', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      expect(result.current.mapDimensions).toEqual({ rows: 9, cols: 18 });
    });

    it('should return correct dimensions for small map', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider initialMapSize="small">{children}</GameProvider>,
      });

      expect(result.current.mapDimensions).toEqual({ rows: 6, cols: 13 });
    });

    it('should return correct dimensions for large map', () => {
      const { result } = renderHook(() => useGameState(), {
        wrapper: ({ children }) => <GameProvider initialMapSize="large">{children}</GameProvider>,
      });

      expect(result.current.mapDimensions).toEqual({ rows: 11, cols: 23 });
    });
  });
});
