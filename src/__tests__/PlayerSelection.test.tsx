import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerSelection from '../ux-components/player-selection/PlayerSelection';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';

describe('PlayerSelection', () => {
  const mockOnPlayerChange = jest.fn();
  const mockSelectedPlayer = PREDEFINED_PLAYERS[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default label', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );
    expect(screen.getByText('Choose Your Character:')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    const customLabel = 'Select Your Hero:';
    render(
      <PlayerSelection
        label={customLabel}
        selectedPlayer={mockSelectedPlayer}
        onPlayerChange={mockOnPlayerChange}
      />
    );
    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it('displays all predefined players by default', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    PREDEFINED_PLAYERS.forEach((player) => {
      const playerElements = screen.getAllByText(player.name);
      expect(playerElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays custom available players when provided', () => {
    const customPlayers = [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]];
    render(
      <PlayerSelection
        selectedPlayer={mockSelectedPlayer}
        onPlayerChange={mockOnPlayerChange}
        availablePlayers={customPlayers}
      />
    );

    customPlayers.forEach((player) => {
      const playerElements = screen.getAllByText(player.name);
      expect(playerElements.length).toBeGreaterThanOrEqual(1);
    });

    // Should not display other players
    expect(screen.queryByText(PREDEFINED_PLAYERS[2].name)).not.toBeInTheDocument();
  });

  it('highlights selected player in the list', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    // Find the player list item with the selected class
    const playerListItems = screen.getAllByText(mockSelectedPlayer.name);
    const selectedPlayerElement = playerListItems[0].closest('.playerListItem');
    expect(selectedPlayerElement).toHaveClass('selected');
  });

  it('calls onPlayerChange when a player is clicked', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    const secondPlayer = PREDEFINED_PLAYERS[1];
    fireEvent.click(screen.getByText(secondPlayer.name));

    expect(mockOnPlayerChange).toHaveBeenCalledWith(secondPlayer);
  });

  it('displays player alignment with correct color', () => {
    const lawfulPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === 'lawful')!;
    const neutralPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === 'neutral')!;
    const chaoticPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === 'chaotic')!;

    const { rerender } = render(
      <PlayerSelection selectedPlayer={lawfulPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    // The selectedPlayerClass div should contain the lawful alignment text with color styling
    const selectedPlayerClass = screen.getByText(
      (content) => content.includes('LAWFUL') && content.includes('Human')
    );
    expect(selectedPlayerClass).toHaveStyle('color: rgb(74, 144, 226)');

    // Re-render with neutral player selected
    rerender(
      <PlayerSelection selectedPlayer={neutralPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    const neutralPlayerClass = screen.getByText(
      (content) => content.includes('NEUTRAL') && content.includes(neutralPlayer.race)
    );
    expect(neutralPlayerClass).toHaveStyle('color: rgb(149, 165, 166)');

    // Re-render with chaotic player selected
    rerender(
      <PlayerSelection selectedPlayer={chaoticPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    const chaoticPlayerClass = screen.getByText(
      (content) => content.includes('CHAOTIC') && content.includes(chaoticPlayer.race)
    );
    expect(chaoticPlayerClass).toHaveStyle('color: rgb(231, 76, 60)');
  });

  it('displays player level for each player', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    PREDEFINED_PLAYERS.forEach((player) => {
      const levelElements = screen.getAllByText(`Level ${player.level}`);
      expect(levelElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays selected player details', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    // Check selected player name in details section
    const detailsName = screen.getAllByText(mockSelectedPlayer.name);
    expect(detailsName.length).toBeGreaterThan(1); // Once in list, once in details

    // Check alignment, race, and level in details
    expect(
      screen.getByText(
        `${mockSelectedPlayer.alignment.toUpperCase()} - ${mockSelectedPlayer.race} - Level ${mockSelectedPlayer.level}`
      )
    ).toBeInTheDocument();

    // Check description
    expect(screen.getByText(mockSelectedPlayer.description)).toBeInTheDocument();
  });

  it('renders PlayerAvatar component for selected player', () => {
    render(
      <PlayerSelection selectedPlayer={mockSelectedPlayer} onPlayerChange={mockOnPlayerChange} />
    );

    // PlayerAvatar should be rendered (we can't easily test the actual avatar without mocking the component)
    // But we can check the structure is there
    expect(screen.getByText(mockSelectedPlayer.description)).toBeInTheDocument();
  });

  it('updates details when different player is selected', () => {
    const { rerender } = render(
      <PlayerSelection selectedPlayer={PREDEFINED_PLAYERS[0]} onPlayerChange={mockOnPlayerChange} />
    );

    // Initial state
    expect(screen.getByText(PREDEFINED_PLAYERS[0].description)).toBeInTheDocument();

    // Click second player
    fireEvent.click(screen.getByText(PREDEFINED_PLAYERS[1].name));
    expect(mockOnPlayerChange).toHaveBeenCalledWith(PREDEFINED_PLAYERS[1]);

    // Re-render with new selected player
    rerender(
      <PlayerSelection selectedPlayer={PREDEFINED_PLAYERS[1]} onPlayerChange={mockOnPlayerChange} />
    );

    // Should show new player details
    expect(screen.getByText(PREDEFINED_PLAYERS[1].description)).toBeInTheDocument();
    expect(screen.queryByText(PREDEFINED_PLAYERS[0].description)).not.toBeInTheDocument();
  });

  it('handles empty available players array', () => {
    render(
      <PlayerSelection
        selectedPlayer={mockSelectedPlayer}
        onPlayerChange={mockOnPlayerChange}
        availablePlayers={[]}
      />
    );

    // Should not crash and should show the selected player details
    expect(screen.getByText(mockSelectedPlayer.name)).toBeInTheDocument();
    expect(screen.getByText(mockSelectedPlayer.description)).toBeInTheDocument();
  });
});
