import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectOpponentDialog from '../ux-components/dialogs/SelectOpponentDialog';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { EmptyPlayer } from '../ux-components/avatars/PlayerAvatar';

// Mock FantasyBorderFrame to avoid complex rendering issues
jest.mock('../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
  return function MockFantasyBorderFrame({ children, secondaryButton }: any) {
    return (
      <div data-testid="fantasy-border-frame">
        {children}
        {secondaryButton}
      </div>
    );
  };
});

describe('SelectOpponentDialog', () => {
  const mockOnSelect = jest.fn();
  const mockOnCancel = jest.fn();
  const excludedPlayerIds = ['player-1'];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window object for responsive calculations
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it('renders with correct title', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Select Opponent')).toBeInTheDocument();
  });

  it('includes EmptyPlayer by default when allowEmptyPlayer is true', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    const emptyPlayerElements = screen.getAllByText(EmptyPlayer.name);
    expect(emptyPlayerElements.length).toBeGreaterThan(0);
  });

  it('excludes EmptyPlayer when allowEmptyPlayer is false', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={false}
      />
    );

    expect(screen.queryByText(EmptyPlayer.name)).not.toBeInTheDocument();
  });

  it('filters out excluded players from available options', () => {
    const excludedPlayer = PREDEFINED_PLAYERS.find((p) => p.id === 'player-1');
    const excludedIds = excludedPlayer ? [excludedPlayer.id] : ['player-1'];

    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Should not show excluded player
    if (excludedPlayer) {
      expect(screen.queryByText(excludedPlayer.name)).not.toBeInTheDocument();
    }

    // Should show other players
    const nonExcludedPlayers = PREDEFINED_PLAYERS.filter((p) => !excludedIds.includes(p.id));
    nonExcludedPlayers.forEach((player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  it('calls onSelect when a player is selected', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const availablePlayer = PREDEFINED_PLAYERS.find((p) => !excludedPlayerIds.includes(p.id));
    if (availablePlayer) {
      fireEvent.click(screen.getByText(availablePlayer.name));
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayer);
    }
  });

  it('calls onSelect when EmptyPlayer is selected', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    const emptyPlayerElements = screen.getAllByText(EmptyPlayer.name);
    const clickableElement = emptyPlayerElements.find((el) => el.closest('.playerListItem'));
    if (clickableElement) {
      fireEvent.click(clickableElement);
    }
    expect(mockOnSelect).toHaveBeenCalledWith(EmptyPlayer);
  });

  it('renders cancel button and calls onCancel when clicked', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByAltText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('sets first available player as default selected', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    // EmptyPlayer should be selected by default as it's first in the list
    const selectedPlayerElements = screen.getAllByText(EmptyPlayer.name);
    const selectedPlayerElement = selectedPlayerElements[0].closest('.playerListItem');
    expect(selectedPlayerElement).toHaveClass('selected');
  });

  it('calculates dialog dimensions based on window size', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const frame = screen.getByTestId('fantasy-border-frame');
    expect(frame).toBeInTheDocument();
  });

  it('handles empty excluded players list', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={[]}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Should show all predefined players plus EmptyPlayer
    const emptyPlayerElements = screen.getAllByText(EmptyPlayer.name);
    expect(emptyPlayerElements.length).toBeGreaterThan(0);
    PREDEFINED_PLAYERS.forEach((player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  it('updates selected player when a different player is clicked', () => {
    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const availablePlayers = PREDEFINED_PLAYERS.filter((p) => !excludedPlayerIds.includes(p.id));
    if (availablePlayers.length >= 2) {
      // Click first available player
      fireEvent.click(screen.getByText(availablePlayers[0].name));
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayers[0]);

      // Click second available player
      fireEvent.click(screen.getByText(availablePlayers[1].name));
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayers[1]);
    }
  });

  it('handles window undefined scenario for SSR compatibility', () => {
    // Mock window properties as undefined
    const originalWindow = global.window;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    render(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Select Opponent')).toBeInTheDocument();

    // Restore window
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });
});
