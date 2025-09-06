import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StartGameWindow from '../ux-components/dialogs/StartGameWindow';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { PLAYER_COLORS } from '../types/PlayerColors';

describe('StartGameWindow', () => {
  const mockOnStartGame = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  it('renders map size dropdown with default medium selection', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const mapSizeDropdown = screen.getByDisplayValue('Medium (9x18)');
    expect(mapSizeDropdown).toBeInTheDocument();
  });

  it('renders opponents dropdown with default value', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const opponentsDropdown = screen.getByDisplayValue('2');
    expect(opponentsDropdown).toBeInTheDocument();
  });

  it('renders all predefined players in the player list', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    PREDEFINED_PLAYERS.forEach((player) => {
      expect(screen.getAllByText(player.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders player color options', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const colorOptions = screen.getAllByRole('generic');
    // Filter for color picker elements (they have background color style)
    const colorPickers = colorOptions.filter((el) => el.className.includes('colorOption'));
    expect(colorPickers.length).toBe(PLAYER_COLORS.length);
  });

  it('calls onStartGame when Start Game button is clicked', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const startButton = screen.getByAltText('Start Game');
    fireEvent.click(startButton);

    expect(mockOnStartGame).toHaveBeenCalledWith({
      mapSize: 'medium',
      selectedPlayer: PREDEFINED_PLAYERS[0],
      playerColor: PREDEFINED_PLAYERS[0].defaultColor,
      numberOfOpponents: 2,
    });
  });

  it('renders cancel button when onCancel prop is provided', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not render cancel button when onCancel prop is not provided', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const cancelButton = screen.queryByRole('button', { name: /cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('updates map size when dropdown value changes', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const mapSizeDropdown = screen.getByDisplayValue('Medium (9x18)');

    fireEvent.change(mapSizeDropdown, { target: { value: 'large' } });
    expect(screen.getByDisplayValue('Large (11x23)')).toBeInTheDocument();
  });

  it('updates number of opponents when dropdown value changes', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);
    const opponentsDropdown = screen.getByDisplayValue('2');

    fireEvent.change(opponentsDropdown, { target: { value: '3' } });
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('updates selected player when a different player is clicked', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);

    // Click on the second player
    const secondPlayerName = PREDEFINED_PLAYERS[1].name;
    fireEvent.click(screen.getByText(secondPlayerName));

    // Verify the player details section shows the new player
    const playerDetailHeaders = screen.getAllByText(secondPlayerName);
    expect(playerDetailHeaders.length).toBeGreaterThan(0);
  });

  it('limits opponents based on map size', () => {
    render(<StartGameWindow onStartGame={mockOnStartGame} />);

    // Change to small map
    const mapSizeDropdown = screen.getByDisplayValue('Medium (9x18)');
    fireEvent.change(mapSizeDropdown, { target: { value: 'small' } });

    // Check that opponents dropdown shows max 2 for small map
    const opponentsDropdown = screen.getByDisplayValue('2');
    const options = opponentsDropdown.querySelectorAll('option');
    // Small map should allow only 2 opponents (so only option "2" should be available)
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveValue('2');
  });
});
