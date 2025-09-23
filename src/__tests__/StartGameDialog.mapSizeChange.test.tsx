import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewGameDialog from '../ux-components/dialogs/NewGameDialog';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';

describe('NewGameDialog - Map Size Changes', () => {
  const mockOnStartGame = jest.fn();
  const mockOnShowSelectOpponentDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('correctly generates new opponents when switching from huge to medium map with random mode', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Switch to random opponent mode
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    // Set to huge map (should generate 7 opponents)
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });

    // Count opponents by looking for filled opponent slots (should be 7 for huge map)
    // In random mode, opponents are shown as colored circles inside opponent slots
    let opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(7);

    // Switch to medium map (should generate 4 opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Should now have exactly 4 opponent slots, not 7
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(4);
  });

  it('correctly updates opponent count display when changing map sizes', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    const mapSizeSelect = screen.getByDisplayValue('Medium');
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');

    // Switch to random mode
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    // Check medium map opponent count
    expect(screen.getByText(/Opponents \(4 of 4\):/)).toBeInTheDocument();

    // Switch to huge map
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });
    expect(screen.getByText(/Opponents \(7 of 7\):/)).toBeInTheDocument();

    // Switch back to small map
    fireEvent.change(mapSizeSelect, { target: { value: 'small' } });
    expect(screen.getByText(/Opponents \(2 of 2\):/)).toBeInTheDocument();

    // Switch to large map
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });
    expect(screen.getByText(/Opponents \(6 of 6\):/)).toBeInTheDocument();
  });

  it('correctly handles manual mode when switching map sizes', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    const mapSizeSelect = screen.getByDisplayValue('Medium');

    // Start in manual mode - should show 2 of 4 opponents for medium map
    expect(screen.getByText(/Opponents \(2 of 4\):/)).toBeInTheDocument();

    // Switch to huge map
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });
    expect(screen.getByText(/Opponents \(2 of 7\):/)).toBeInTheDocument();

    // Check that we have correct number of opponent slots
    const opponentSlots = document.querySelectorAll(
      '[style*="width: 80px"][style*="height: 80px"]'
    );
    expect(opponentSlots.length).toBe(7); // Should have 7 slots for huge map

    // Switch to small map
    fireEvent.change(mapSizeSelect, { target: { value: 'small' } });
    expect(screen.getByText(/Opponents \(2 of 2\):/)).toBeInTheDocument();

    // Check that we now have correct number of slots for small map
    const smallMapSlots = document.querySelectorAll(
      '[style*="width: 80px"][style*="height: 80px"]'
    );
    expect(smallMapSlots.length).toBe(2); // Should have 2 slots for small map
  });

  it('preserves selected player when changing map sizes', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // The selected player should still be visible after map changes
    const selectedPlayerAvatar = screen.getByAltText(PREDEFINED_PLAYERS[0].name);
    expect(selectedPlayerAvatar).toBeInTheDocument();

    const mapSizeSelect = screen.getByDisplayValue('Medium');

    // Change map size multiple times
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });
    expect(screen.getByAltText(PREDEFINED_PLAYERS[0].name)).toBeInTheDocument();

    fireEvent.change(mapSizeSelect, { target: { value: 'small' } });
    expect(screen.getByAltText(PREDEFINED_PLAYERS[0].name)).toBeInTheDocument();

    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });
    expect(screen.getByAltText(PREDEFINED_PLAYERS[0].name)).toBeInTheDocument();
  });
});
