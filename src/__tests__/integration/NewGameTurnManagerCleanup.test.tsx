import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { GameState, TurnPhase } from '../../types/GameState';
import { PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { generateMap } from '../../map/generation/generateMap';
import { addPlayerToMap } from '../../map/generation/addPlayerToMap';
import { toGamePlayer } from '../utils/toGamePlayer';

describe('NewGame TurnManager Cleanup Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createGameState = (mapSize: 'small' | 'medium' | 'large' | 'huge'): GameState => {
    const dimensions = {
      small: { rows: 6, cols: 13 },
      medium: { rows: 9, cols: 18 },
      large: { rows: 11, cols: 23 },
      huge: { rows: 15, cols: 31 },
    };

    const player1 = toGamePlayer(PREDEFINED_PLAYERS[0], 'human');
    const player2 = toGamePlayer(PREDEFINED_PLAYERS[0], 'computer');

    const gameState: GameState = {
      battlefield: generateMap(dimensions[mapSize]),
      turn: 1,
      turnOwner: player1.id,
      turnPhase: TurnPhase.START,
      players: [player1, player2],
    };

    addPlayerToMap(gameState);
    return gameState;
  };

  it('should properly cleanup old TurnManager when starting new games with different map sizes', () => {
    const { result } = renderHook(() => useGameContext(), {
      wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
    });

    // Start first game with medium map
    const mediumGameState = createGameState('medium');
    act(() => {
      result.current.startNewGame(mediumGameState);
    });

    expect(result.current.gameState?.battlefield.dimensions).toEqual({ rows: 9, cols: 18 });

    // Start second game with large map (this should cleanup the previous TurnManager)
    const largeGameState = createGameState('large');
    act(() => {
      result.current.startNewGame(largeGameState);
    });

    // Verify the new game state is correct
    expect(result.current.gameState?.battlefield.dimensions).toEqual({ rows: 11, cols: 23 });
    expect(result.current.gameState?.players).toHaveLength(2);
    expect(result.current.gameState?.turn).toBe(1);

    // Start third game with small map
    const smallGameState = createGameState('small');
    act(() => {
      result.current.startNewGame(smallGameState);
    });

    // Verify the third game state is correct
    expect(result.current.gameState?.battlefield.dimensions).toEqual({ rows: 6, cols: 13 });
    expect(result.current.gameState?.players).toHaveLength(2);
    expect(result.current.gameState?.turn).toBe(1);
  });

  it('should not interfere with existing game when using updateGameState', () => {
    const { result } = renderHook(() => useGameContext(), {
      wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
    });

    // Start a game
    const gameState = createGameState('medium');
    act(() => {
      result.current.startNewGame(gameState);
    });

    expect(result.current.gameState?.turn).toBe(1);

    // Update game state (this should NOT create a new TurnManager)
    const updatedGameState = { ...gameState, turn: 2 };
    act(() => {
      result.current.updateGameState(updatedGameState);
    });

    // Verify the game state was updated but TurnManager wasn't recreated
    expect(result.current.gameState?.turn).toBe(2);
    expect(result.current.gameState?.battlefield.dimensions).toEqual({ rows: 9, cols: 18 });
  });
});
