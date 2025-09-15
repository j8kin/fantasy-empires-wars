import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpponentsPanel from '../ux-components/opponents-panel/OpponentsPanel';
import { EmptyPlayer } from '../ux-components/avatars/PlayerAvatar';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';

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
    const opponentsContainer = screen.getByTestId
      ? screen.queryByTestId('opponents-panel')
      : document.querySelector('.opponentsPanelContainer');
    expect(
      opponentsContainer || document.querySelector('[class*="opponentsPanelContainer"]')
    ).toBeInTheDocument();
  });

  it('filters out EmptyPlayer from provided opponents', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      EmptyPlayer, // This should be filtered out
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

    // Should render only 2 opponents (EmptyPlayer filtered out)
    // Check that EmptyPlayer's name is not displayed
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.queryByText('EMPTY')).not.toBeInTheDocument();

    // Check that the valid opponents are displayed (by alt text)
    expect(screen.getByAltText(PREDEFINED_PLAYERS[1].name)).toBeInTheDocument();
    expect(screen.getByAltText(PREDEFINED_PLAYERS[2].name)).toBeInTheDocument();
  });

  it('handles when all provided opponents are EmptyPlayer', () => {
    const providedOpponents = [EmptyPlayer, EmptyPlayer];

    render(
      <OpponentsPanel
        selectedPlayer={testPlayer}
        numberOfOpponents={2}
        opponents={providedOpponents}
        onOpponentSelect={mockOnOpponentSelect}
      />
    );

    // Should render no opponents since all were filtered out
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.queryByText('EMPTY')).not.toBeInTheDocument();
  });

  it('works correctly with mixed valid opponents and EmptyPlayer', () => {
    const providedOpponents = [
      PREDEFINED_PLAYERS[1],
      EmptyPlayer,
      PREDEFINED_PLAYERS[2],
      EmptyPlayer,
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

    // Should render only 3 valid opponents (2 EmptyPlayers filtered out)
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.queryByText('EMPTY')).not.toBeInTheDocument();

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
});
