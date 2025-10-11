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
        battlefieldLands: {},
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

  it('renders all opponents provided in gameState (including NO_PLAYER if present)', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      NO_PLAYER, // Now this will be rendered as provided
      PREDEFINED_PLAYERS[2],
    ];

    renderWithGameContext(providedOpponents);

    // Should render all 3 opponents as provided (no filtering)
    // NO_PLAYER renders as text "EMPTY", so we count both images and EMPTY text
    const avatarImages = screen.getAllByRole('img', { name: /.+/ });
    const emptyPlayers = screen.getAllByText('EMPTY');
    expect(avatarImages.length + emptyPlayers.length).toBe(3);

    // Check that the valid opponents are displayed (by alt text)
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
    expect(screen.getByText('EMPTY')).toBeInTheDocument();
  });

  it('renders NO_PLAYER opponents when provided', () => {
    const providedOpponents = [NO_PLAYER, NO_PLAYER];

    renderWithGameContext(providedOpponents);

    // Should render NO_PLAYER opponents as provided (no fallback to random generation)
    // NO_PLAYER renders as "EMPTY" text, not images
    const emptyPlayers = screen.getAllByText('EMPTY');
    expect(emptyPlayers.length).toBe(2);
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

    // Should render all 5 opponents as provided (no filtering)
    const avatarImages = screen.getAllByRole('img', { name: /.+/ });
    const emptyPlayers = screen.getAllByText('EMPTY');
    expect(avatarImages.length + emptyPlayers.length).toBe(5);

    // Check that all opponents are displayed
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[3].name)).toBeInTheDocument();
    expect(emptyPlayers).toHaveLength(2);
  });

  it('renders empty list when providedOpponents is empty', () => {
    renderWithGameContext([]);

    // With empty providedOpponents, the component should render no opponents
    expect(screen.queryAllByRole('img', { name: /.+/ }).length).toBe(0);
  });

  // Tests for direct gameState rendering
  describe('Direct gameState rendering', () => {
    it('renders exact opponents provided for huge map scenario', () => {
      renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should render exactly the provided opponents
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);
    });

    it('correctly handles switching between different opponent sets', () => {
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 3));

      // Initially should show 2 provided opponents
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
      expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();

      // Now switch to a new game with a different set of opponents
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now show 4 opponents
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('handles switching from all EmptyPlayer to different opponents', () => {
      const { rerender } = renderWithGameContext([NO_PLAYER, NO_PLAYER, NO_PLAYER]);

      // Should render 3 NO_PLAYER opponents
      let emptyPlayers = screen.getAllByText('EMPTY');
      expect(emptyPlayers.length).toBe(3);

      // Now switch to a different configuration
      rerender(
        <TestWrapper opponents={[NO_PLAYER]}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now render 1 NO_PLAYER opponent
      emptyPlayers = screen.getAllByText('EMPTY');
      expect(emptyPlayers.length).toBe(1);
    });

    it('correctly handles mixed scenarios with varying numbers of EmptyPlayer', () => {
      const testCases = [
        {
          description: 'mostly EmptyPlayer with few valid',
          opponents: [PREDEFINED_PLAYERS[1], NO_PLAYER, NO_PLAYER, NO_PLAYER],
          expectedTotalOpponents: 4,
        },
        {
          description: 'equal mix of valid and EmptyPlayer',
          opponents: [PREDEFINED_PLAYERS[1], NO_PLAYER, PREDEFINED_PLAYERS[2], NO_PLAYER],
          expectedTotalOpponents: 4,
        },
        {
          description: 'mostly valid with few EmptyPlayer',
          opponents: [
            PREDEFINED_PLAYERS[1],
            PREDEFINED_PLAYERS[2],
            PREDEFINED_PLAYERS[3],
            NO_PLAYER,
          ],
          expectedTotalOpponents: 4,
        },
      ];

      testCases.forEach(({ opponents, expectedTotalOpponents }) => {
        cleanup();
        renderWithGameContext(opponents);

        // Should render all opponents as provided (no filtering)
        const avatarImages = screen.getAllByRole('img', { name: /.+/ });
        const emptyPlayers = screen.queryAllByText('EMPTY');
        expect(avatarImages.length + emptyPlayers.length).toBe(expectedTotalOpponents);
      });
    });

    it('renders opponents consistently regardless of selectedPlayer changes', () => {
      const { rerender } = renderWithGameContext([PREDEFINED_PLAYERS[1]]);

      // Should show 1 provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Change selectedPlayer - opponents should remain the same
      rerender(
        <TestWrapper opponents={[PREDEFINED_PLAYERS[1]]} selectedPlayer={PREDEFINED_PLAYERS[2]}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should still show the same provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Verify still only 1 opponent
      const avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(1);
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    });

    it('correctly handles switching from large to small opponent sets', () => {
      // First render with 7 opponents (simulating Huge map)
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should render 7 opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);

      // Now switch to 4 opponents (simulating Medium map)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now render exactly 4 opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('correctly updates when switching opponent sets', () => {
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

      // Should now show exactly 4 opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);
    });

    it('renders correct number of opponents after gameState updates', () => {
      const { rerender } = renderWithGameContext(PREDEFINED_PLAYERS.slice(1, 8));

      // Should render 7 opponents
      let avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(7);

      // Switch to smaller number of opponents (4)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 5)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now render exactly 4 opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(4);

      // Switch to very small number (2)
      rerender(
        <TestWrapper opponents={PREDEFINED_PLAYERS.slice(1, 3)}>
          <OpponentsPanel />
        </TestWrapper>
      );

      // Should now render exactly 2 opponents
      avatars = screen.getAllByRole('img', { name: /.+/ });
      expect(avatars.length).toBe(2);
    });
  });
});
