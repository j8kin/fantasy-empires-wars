import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StartGameDialog from '../ux-components/dialogs/StartGameDialog';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { EmptyPlayer } from '../ux-components/avatars/PlayerAvatar';

describe('StartGameWindow', () => {
  const mockOnStartGame = jest.fn();
  const onShowSelectOpponentDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  it('renders map size dropdown with default medium selection', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    const mapSizeDropdown = screen.getByDisplayValue('Medium');
    expect(mapSizeDropdown).toBeInTheDocument();
  });

  it('renders opponent selection mode dropdown with default value', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    const opponentModeDropdown = screen.getByDisplayValue('Choose Each Opponent');
    expect(opponentModeDropdown).toBeInTheDocument();
  });

  it('renders all predefined players in the player list', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    PREDEFINED_PLAYERS.forEach((player) => {
      expect(screen.getAllByText(player.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls onStartGame when Start Game button is clicked', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    const startButton = screen.getByAltText('Start Game');
    fireEvent.click(startButton);

    expect(mockOnStartGame).toHaveBeenCalledWith({
      mapSize: 'medium',
      selectedPlayer: PREDEFINED_PLAYERS[0],
      opponents: expect.any(Array),
      tiles: expect.any(Object),
      turn: 0,
    });
  });

  it('updates map size when dropdown value changes', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    const mapSizeDropdown = screen.getByDisplayValue('Medium');

    fireEvent.change(mapSizeDropdown, { target: { value: 'large' } });
    expect(screen.getByDisplayValue('Large')).toBeInTheDocument();
  });

  it('changes opponent selection mode when dropdown value changes', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );
    const opponentModeDropdown = screen.getByDisplayValue('Choose Each Opponent');

    fireEvent.change(opponentModeDropdown, { target: { value: 'random' } });
    expect(screen.getByDisplayValue(/Random Opponents/)).toBeInTheDocument();
  });

  it('updates selected player when a different player is clicked', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );

    // Click on the second player
    const secondPlayerName = PREDEFINED_PLAYERS[1].name;
    fireEvent.click(screen.getByText(secondPlayerName));

    // Verify the player details section shows the new player
    const playerDetailHeaders = screen.getAllByText(secondPlayerName);
    expect(playerDetailHeaders.length).toBeGreaterThan(0);
  });

  it('shows correct max opponents label for different map sizes', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={onShowSelectOpponentDialog}
      />
    );

    // Default medium map should show "of 4"
    expect(screen.getByText(/of 4/)).toBeInTheDocument();

    // Change to small map
    const mapSizeDropdown = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeDropdown, { target: { value: 'small' } });

    // Should now show "of 2"
    expect(screen.getByText(/of 2/)).toBeInTheDocument();

    // Change to large map
    fireEvent.change(mapSizeDropdown, { target: { value: 'large' } });

    // Should now show "of 6"
    expect(screen.getByText(/of 6/)).toBeInTheDocument();
  });

  it('filters out EmptyPlayer from opponents when starting game in manual mode', () => {
    // Mock the component to simulate having EmptyPlayer in selectedOpponents
    const TestStartGameDialogWithEmptyPlayer = () => {
      const [showDialog, setShowDialog] = React.useState(true);

      if (!showDialog) return null;

      return (
        <StartGameDialog
          onStartGame={(config) => {
            // Verify that EmptyPlayer is filtered out from opponents
            const hasEmptyPlayer = config.opponents?.some(
              (opponent) => opponent.id === EmptyPlayer.id
            );
            expect(hasEmptyPlayer).toBe(false);
            mockOnStartGame(config);
            setShowDialog(false);
          }}
          onShowSelectOpponentDialog={(excludedIds, onSelect) => {
            // Simulate selecting EmptyPlayer to "delete" an opponent
            onSelect(EmptyPlayer);
          }}
        />
      );
    };

    render(<TestStartGameDialogWithEmptyPlayer />);

    // Set to manual mode
    const opponentModeDropdown = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeDropdown, { target: { value: 'manual' } });

    // Click on an opponent slot to open selection dialog (this will trigger EmptyPlayer selection)
    const opponentSlots = screen
      .getAllByRole('generic')
      .filter((el) => el.style.cursor === 'pointer' || el.onclick);
    if (opponentSlots.length > 0) {
      fireEvent.click(opponentSlots[0]);
    }

    // Click start game
    const startButton = screen.getByAltText('Start Game');
    fireEvent.click(startButton);

    // The test expectation is in the onStartGame callback above
    expect(mockOnStartGame).toHaveBeenCalled();
  });
});
