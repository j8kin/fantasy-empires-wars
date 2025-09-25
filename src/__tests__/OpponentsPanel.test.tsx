import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpponentsPanel from '../ux-components/opponents-panel/OpponentsPanel';
import { PREDEFINED_PLAYERS, NO_PLAYER } from '../types/GamePlayer';

describe('OpponentsPanel', () => {
  const mockOnOpponentSelect = jest.fn();
  const testPlayer = PREDEFINED_PLAYERS[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with random opponents when no providedOpponents', () => {
    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={2}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

    // Should render 2 opponents (random generation)
    const opponentsContainer =
      screen.queryByTestId('opponents-panel') || document.querySelector('.opponentsPanelContainer');
    expect(
      opponentsContainer || document.querySelector('[class*="opponentsPanelContainer"]')
    ).toBeInTheDocument();
  });

  it('filters out EmptyPlayer from provided opponents', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      NO_PLAYER, // This should be filtered out
      PREDEFINED_PLAYERS[2],
    ];

    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={3}
        opponents={providedOpponents}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

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

    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={2}
        opponents={providedOpponents}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

    // Should filter out NO_PLAYER and fallback to generating 2 random opponents
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('NONE')).not.toBeInTheDocument();

    // Should have generated random opponents based on numberOfOpponents
    const opponentsContainer = document.querySelector('[class*="opponentsPanelContainer"]');
    expect(opponentsContainer).toBeInTheDocument();

    // Check that we have avatar elements (indicating random opponents were generated)
    const avatarElements = document.querySelectorAll('img[alt]');
    expect(avatarElements.length).toBeGreaterThan(0); // Should have generated some opponents
  });

  it('works correctly with mixed valid opponents and EmptyPlayer', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      NO_PLAYER,
      PREDEFINED_PLAYERS[2],
      NO_PLAYER,
      PREDEFINED_PLAYERS[3],
    ];

    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={5}
        opponents={providedOpponents}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

    // Should render only 3 valid opponents (2 NO_PLAYERs filtered out)
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('NONE')).not.toBeInTheDocument();

    // Check that all valid opponents are displayed (by alt text)
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[3].name)).toBeInTheDocument();
  });

  it('renders empty list when providedOpponents is empty', () => {
    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={0}
        opponents={[]}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

    // Should fall back to random generation with numberOfOpponents=0
    const opponentsContainer = document.querySelector('[class*="opponentsPanelContainer"]');
    expect(opponentsContainer).toBeInTheDocument();
  });

  // Tests for the memorization bug fix
  describe('Memorization and state clearing', () => {
    it('generates correct number of random opponents for huge map scenario', () => {
      // Simulate huge map with many opponents
      const hugeMapOpponents = 8;

      render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={hugeMapOpponents}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should generate exactly the requested number of opponents
      const avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(hugeMapOpponents);
    });

    it('correctly handles switching from provided opponents to random generation', () => {
      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={3}
          opponents={[PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[2]]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Initially should show 2 provided opponents
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
      expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();

      // Now switch to a new game with different number of opponents and no provided opponents
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={4}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now generate 4 random opponents, not keep the previous 2
      const avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(4);
    });

    it('handles switching from all EmptyPlayer to random opponents', () => {
      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={2}
          opponents={[NO_PLAYER, NO_PLAYER, NO_PLAYER]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should fallback to generating 2 random opponents
      let avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBeGreaterThan(0);

      // Now switch to a different configuration
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={5}
          opponents={[NO_PLAYER]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now generate 5 random opponents
      avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBeGreaterThan(0);
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
        const { rerender } = render(
          <OpponentsPanel
            selectedPlayer={testPlayer}
            numberOfOpponents={opponents.length}
            opponents={opponents}
            onOpponentSelect={mockOnOpponentSelect}
          />
        );

        // Should filter out NO_PLAYER and show only valid opponents
        expect(screen.queryByText('None')).not.toBeInTheDocument();
        expect(screen.queryByText('NONE')).not.toBeInTheDocument();

        const avatarElements = document.querySelectorAll('img[alt]');
        expect(avatarElements.length).toBe(expectedValidOpponents);

        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('maintains proper useMemo dependencies for re-rendering', () => {
      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={2}
          opponents={[PREDEFINED_PLAYERS[1]]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should show 1 provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Change selectedPlayer - should trigger re-computation
      rerender(
        <OpponentsPanel
          selectedPlayer={PREDEFINED_PLAYERS[4]}
          numberOfOpponents={2}
          opponents={[PREDEFINED_PLAYERS[1]]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should still show the provided opponent
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();

      // Change numberOfOpponents while keeping provided opponents - should still use provided
      rerender(
        <OpponentsPanel
          selectedPlayer={PREDEFINED_PLAYERS[4]}
          numberOfOpponents={5}
          opponents={[PREDEFINED_PLAYERS[1]]}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should still show only the 1 provided opponent, not 5 random ones
      const avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(1);
      expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    });

    it('correctly handles map size changes from large to small opponent counts', () => {
      // First render with 7 opponents (simulating Huge map)
      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={7}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should generate 7 opponents
      let avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(7);

      // Now switch to 4 opponents (simulating Medium map)
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={4}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now generate exactly 4 opponents, not 7
      avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(4);
    });

    it('correctly handles map size changes with opponent array clearing', () => {
      // Create a large opponent array (simulating Huge map with 7 opponents)
      const hugeMapOpponents = Array.from(
        { length: 7 },
        (_, i) => PREDEFINED_PLAYERS[i % PREDEFINED_PLAYERS.length]
      );

      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={7}
          opponents={hugeMapOpponents}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should show 7 opponents
      let avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(7);

      // Now switch to Medium map without provided opponents (should generate random)
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={4}
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now show exactly 4 opponents, not more
      avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(4);
    });

    it('generates correct number of opponents after map size changes', () => {
      const { rerender } = render(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={7} // Large map
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should generate 7 opponents
      let avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(7);

      // Switch to smaller number of opponents
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={4} // Medium map
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now generate exactly 4 opponents, not 7
      avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(4);

      // Switch to very small number
      rerender(
        <OpponentsPanel
          selectedPlayer={testPlayer}
          numberOfOpponents={2} // Small map
          onOpponentSelect={mockOnOpponentSelect}
        />
      );

      // Should now generate exactly 2 opponents
      avatarElements = document.querySelectorAll('img[alt]');
      expect(avatarElements.length).toBe(2);
    });
  });
});
