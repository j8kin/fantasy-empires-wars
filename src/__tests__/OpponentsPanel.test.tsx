import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import OpponentsPanel from '../ux-components/opponents-panel/OpponentsPanel';
import { PREDEFINED_PLAYERS, NO_PLAYER, GamePlayer } from '../types/GamePlayer';
import { GameProvider, useGameState } from '../contexts/GameContext';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';

// Test wrapper that provides GameContext and ApplicationContext and allows updating game state
const TestWrapper: React.FC<{
  children: React.ReactNode;
  opponents: GamePlayer[];
  selectedPlayer?: GamePlayer;
}> = ({ children, opponents, selectedPlayer = PREDEFINED_PLAYERS[0] }) => {
  const TestComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { updateGameState } = useGameState();

    React.useEffect(() => {
      updateGameState({
        selectedPlayer,
        opponents,
        mapSize: 'medium',
        tiles: {},
        turn: 1,
      });
    }, [updateGameState]);

    return <>{children}</>;
  };

  return (
    <ApplicationContextProvider>
      <GameProvider>
        <TestComponent>{children}</TestComponent>
      </GameProvider>
    </ApplicationContextProvider>
  );
};

const renderWithGameContext = (opponents: GamePlayer[], selectedPlayer?: GamePlayer) => {
  return render(
    <TestWrapper opponents={opponents} selectedPlayer={selectedPlayer}>
      <OpponentsPanel />
    </TestWrapper>
  );
};

describe('OpponentsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with provided opponents', () => {
    renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 3));

    // Should render 2 provided opponents
    const avatars = screen.getAllByRole('img', { name: /.+/ });
    expect(avatars.length).toBe(2);
  });

  it('filters out EmptyPlayer from provided opponents', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      NO_PLAYER, // This should be filtered out
      PREDEFINED_PLAYERS[2],
    ];

    renderWithGameContext(providedOpponents);

    // Should render only 2 opponents (NO_PLAYER filtered out)
    // Check that NO_PLAYER's name is not displayed
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('NONE')).not.toBeInTheDocument();

    // Check that the valid opponents are displayed (by alt text)
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
  });

  it('falls back to random opponents when all provided opponents are EmptyPlayer', () => {
    const providedOpponents = [NO_PLAYER, NO_PLAYER];

    renderWithGameContext(providedOpponents);

    // Should filter out NO_PLAYER and fallback to generating 2 random opponents
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('NONE')).not.toBeInTheDocument();

    // Should have generated random opponents based on numberOfOpponents
    const avatars = screen.getAllByRole('img', { name: /.+/ });
    expect(avatars.length).toBe(2);
  });

  it('works correctly with mixed valid opponents and EmptyPlayer', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      NO_PLAYER,
      PREDEFINED_PLAYERS[2],
      NO_PLAYER,
      PREDEFINED_PLAYERS[3],
    ];

    renderWithGameContext(providedOpponents);

    // Should render only 3 valid opponents (2 NO_PLAYERs filtered out)
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('NONE')).not.toBeInTheDocument();

    // Check that all valid opponents are displayed (by alt text)
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[3].name)).toBeInTheDocument();
  });

  it('renders empty list when providedOpponents is empty', () => {
    renderWithGameContext([]);

    // With empty providedOpponents, the component falls back to generating 2 random opponents
    expect(screen.queryAllByRole('img', { name: /.+/ }).length).toBe(2);
  });

  // Tests for the memorization bug fix
  describe('Memorization and state clearing', () => {
    it('generates correct number of random opponents for huge map scenario', () => {
      renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should generate exactly the requested number of opponents
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);
    });

    it('correctly handles switching from provided opponents to random generation', () => {
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 3));

      // Initially should show 2 provided opponents
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
      expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();

      // Now switch to a new game with a different number of opponents
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now show 4 opponents
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('handles switching from all EmptyPlayer to random opponents', () => {
      const { rerender } = renderWithGameContext([NO_PLAYER, NO_PLAYER, NO_PLAYER]);

      // Should fallback to generating 2 random opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBeGreaterThan(0);

      // Now switch to a different configuration
      rerender(
        <TestWrapper opponents={[NO_PLAYER]}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should still generate random opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('correctly handles mixed scenarios with varying numbers of EmptyPlayer', () => {
      const testCases = [
        {
          description: 'mostly EmptyPlayer with few valid',
          opponents: [PREDEFINED_PLAYERS[1], NO_PLAYER, NO_PLAYER, NO_PLAYER],
          expectedValidOpponents: 1,
        },
        {
          description: 'equal mix of valid and EmptyPlayer',
          opponents: [PREDEFINED_PLAYERS[1], NO_PLAYER, PREDEFINED_PLAYERS[2], NO_PLAYER],
          expectedValidOpponents: 2,
        },
        {
          description: 'mostly valid with few EmptyPlayer',
          opponents: [
            PREDEFINED_PLAYERS[1],
            PREDEFINED_PLAYERS[2],
            PREDEFINED_PLAYERS[3],
            NO_PLAYER,
          ],
          expectedValidOpponents: 3,
        },
      ];

      testCases.forEach(({ opponents, expectedValidOpponents }) => {
        cleanup();
        renderWithGameContext(opponents);

        // Should filter out NO_PLAYER and show only valid opponents
        expect(screen.queryByText('None')).not.toBeInTheDocument();
        expect(screen.queryByText('NONE')).not.toBeInTheDocument();

        const avatars = screen.getAllByRole('img', { name: /.+/ });
        expect(avatars.length).toBe(expectedValidOpponents);
      });
    });

    it('maintains proper useMemo dependencies for re-rendering', () => {
      const { rerender } = renderWithGameContext([PREDEFINED_PLAYERS[1]]);

      // Should show 1 provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Change selectedPlayer - should trigger re-computation
      rerender(
        <TestWrapper opponents={[PREDEFINED_PLAYERS[1]]} selectedPlayer={PREDEFINED_PLAYERS[2]}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should still show the provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Change numberOfOpponents while keeping provided opponents - should still use provided
      rerender(
        <TestWrapper opponents={[PREDEFINED_PLAYERS[1]]}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should still show only the 1 provided opponent, not random ones
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(1);
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    });

    it('correctly handles map size changes from large to small opponent counts', () => {
      // First render with 7 opponents (simulating Huge map)
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should generate 7 opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);

      // Now switch to 4 opponents (simulating Medium map)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now generate exactly 4 opponents, not 7
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('correctly handles map size changes with opponent array clearing', () => {
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should show 7 opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);

      // Now switch to Medium map with 4 provided opponents
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now show exactly 4 opponents, not more
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('generates correct number of opponents after map size changes', () => {
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should generate 7 opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);

      // Switch to smaller number of opponents (4)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now generate exactly 4 opponents, not 7
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);

      // Switch to very small number (2)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 3)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now generate exactly 2 opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(2);
    });
  });
});
