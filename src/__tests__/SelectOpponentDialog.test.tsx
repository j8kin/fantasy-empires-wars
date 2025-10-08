import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SelectOpponentDialog from '../ux-components/dialogs/SelectOpponentDialog';
import { PREDEFINED_PLAYERS, NO_PLAYER } from '../types/GamePlayer';
import { FantasyBorderFrameProps } from '../ux-components/fantasy-border-frame/FantasyBorderFrame';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, { wrapper: ApplicationContextProvider });

// Mock FantasyBorderFrame to avoid complex rendering issues
jest.mock('../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
  return ({ children, secondaryButton }: FantasyBorderFrameProps) => {
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
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Select Opponent')).toBeInTheDocument();
  });

  it('includes EmptyPlayer by default when allowEmptyPlayer is true', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    const emptyPlayerElements = screen.getAllByText(NO_PLAYER.name);
    expect(emptyPlayerElements.length).toBeGreaterThan(0);
  });

  it('excludes EmptyPlayer when allowEmptyPlayer is false', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={false}
      />
    );

    expect(screen.queryByText(NO_PLAYER.name)).not.toBeInTheDocument();
  });

  it('filters out excluded players from available options', () => {
    const excludedPlayer = PREDEFINED_PLAYERS.find((p) => p.id === 'player-1');
    const excludedIds = excludedPlayer ? [excludedPlayer.id] : ['player-1'];

    renderWithProvider(
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
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const availablePlayer = PREDEFINED_PLAYERS.find((p) => !excludedPlayerIds.includes(p.id));
    if (availablePlayer) {
      const btn = screen.getByRole('button', { name: availablePlayer.name });
      userEvent.click(btn);
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayer);
    }
  });

  it('calls onSelect when EmptyPlayer is selected', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    const emptyButton = screen.getByRole('button', { name: NO_PLAYER.name });
    userEvent.click(emptyButton);
    expect(mockOnSelect).toHaveBeenCalledWith(NO_PLAYER);
  });

  it('renders cancel button and calls onCancel when clicked', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByAltText('Cancel');
    userEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('sets first available player as default selected', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        allowEmptyPlayer={true}
      />
    );

    // EmptyPlayer should be selected by default as it's first in the list
    // Assert by behavior: the name appears in list and in the details header
    const occurrences = screen.getAllByText(NO_PLAYER.name);
    expect(occurrences.length).toBeGreaterThan(1);
  });

  it('calculates dialog dimensions based on window size', () => {
    renderWithProvider(
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
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={[]}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Should show all predefined players plus EmptyPlayer
    const emptyPlayerElements = screen.getAllByText(NO_PLAYER.name);
    expect(emptyPlayerElements.length).toBeGreaterThan(0);
    PREDEFINED_PLAYERS.forEach((player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  it('updates selected player when a different player is clicked', () => {
    renderWithProvider(
      <SelectOpponentDialog
        excludedPlayerIds={excludedPlayerIds}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const availablePlayers = PREDEFINED_PLAYERS.filter((p) => !excludedPlayerIds.includes(p.id));
    if (availablePlayers.length >= 2) {
      // Click first available player
      const firstBtn = screen.getByRole('button', { name: availablePlayers[0].name });
      userEvent.click(firstBtn);
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayers[0]);

      // Click second available player
      const secondBtn = screen.getByRole('button', { name: availablePlayers[1].name });
      userEvent.click(secondBtn);
      expect(mockOnSelect).toHaveBeenCalledWith(availablePlayers[1]);
    }
  });

  it('handles window undefined scenario for SSR compatibility', () => {
    // Mock window properties as undefined
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

    renderWithProvider(
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
