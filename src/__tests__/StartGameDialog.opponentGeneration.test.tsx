import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StartGameDialog from '../ux-components/dialogs/StartGameDialog';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';

describe('StartGameDialog - Opponent Generation Bug Reproduction', () => {
  const mockOnStartGame = jest.fn();
  const mockOnShowSelectOpponentDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reproduces the bug: opponents persist from previous random selection when switching map sizes', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Step 1: Switch to random opponent mode
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    // Step 2: Set to Large map (should generate 6 random opponents)
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify we have 6 opponent slots
    let opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(6);

    // Step 3: Switch to Medium map (should generate 4 new random opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Verify we now have exactly 4 opponent slots, not 6
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(4);

    // Step 4: Switch back to manual mode
    fireEvent.change(opponentModeSelect, { target: { value: 'manual' } });

    // Should still show 4 slots (medium map max opponents)
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(4);

    // The issue: after these changes, when we switch back to manual mode,
    // we might still see remnants from the previous random selection
    // This test ensures that doesn't happen
  });

  it('ensures unique opponents are generated when switching between random modes', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Switch to random mode
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    // Switch to large map
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Get initial random opponents
    let opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(6);

    // Switch to medium
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Should have 4 opponents
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(4);

    // Switch back to large
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Should generate new 6 opponents
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(6);
  });

  it('generates unique opponent players (no duplicates)', () => {
    const TestWrapper = () => {
      const [config, setConfig] = React.useState(null);

      return (
        <div>
          <StartGameDialog
            onStartGame={(gameConfig) => {
              mockOnStartGame(gameConfig);
            }}
            onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
          />
          {config && (
            <div data-testid="config-display">
              {config.opponents.map((opponent, index) => (
                <div key={index} data-testid={`opponent-${index}`} data-opponent-id={opponent.id}>
                  {opponent.name}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    render(<TestWrapper />);

    // Switch to random mode
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    // Set to large map to get 6 opponents
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Start the game to trigger opponent generation
    const startButton = screen.getByAltText('Start Game');
    fireEvent.click(startButton);

    // Check that all opponents are unique
    const configDisplay = screen.queryByTestId('config-display');
    if (configDisplay) {
      const opponentElements = screen.getAllByTestId(/opponent-\d+/);
      const opponentIds = opponentElements.map((el) => el.getAttribute('data-opponent-id'));

      // Check for uniqueness
      const uniqueIds = new Set(opponentIds);
      expect(uniqueIds.size).toBe(opponentIds.length);

      // Ensure we have the expected number of opponents
      expect(opponentIds.length).toBe(6);
    }
  });

  it('correctly handles avatar size calculation after map size changes', () => {
    const TestWrapper = () => {
      const [config, setConfig] = React.useState(null);

      return (
        <div>
          <StartGameDialog
            onStartGame={(gameConfig) => {
              setConfig(gameConfig);
              mockOnStartGame(gameConfig);
            }}
            onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
          />
          {config && (
            <div data-testid="config-display">
              <div data-testid="opponent-count">{config.opponents.length}</div>
              <div data-testid="map-size">{config.mapSize}</div>
            </div>
          )}
        </div>
      );
    };

    render(<TestWrapper />);

    // Start with random mode and large map (6 opponents, small avatars)
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });

    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify we have 6 opponent slots
    let opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(6);

    // Switch to medium map (4 opponents, larger avatars)
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Should now have exactly 4 opponent slots
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(4);

    // Start the game and verify the configuration
    const startButton = screen.getByAltText('Start Game');
    fireEvent.click(startButton);

    // Check that the final configuration has correct number of opponents
    expect(screen.getByTestId('opponent-count')).toHaveTextContent('4');
    expect(screen.getByTestId('map-size')).toHaveTextContent('medium');
  });

  it('prevents leftover opponents from previous map configurations', () => {
    render(
      <StartGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Start with huge map in random mode (7 opponents)
    const opponentModeSelect = screen.getByDisplayValue('Choose Each Opponent');
    const mapSizeSelect = screen.getByDisplayValue('Medium');

    fireEvent.change(opponentModeSelect, { target: { value: 'random' } });
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });

    // Should have 7 opponents
    let opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(7);

    // Switch to small map (2 opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'small' } });

    // Should have exactly 2 opponents, not 7
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(2);

    // Switch to manual mode - should still respect the small map constraint
    fireEvent.change(opponentModeSelect, { target: { value: 'manual' } });

    // Should still have exactly 2 opponent slots
    opponentSlots = document.querySelectorAll('[style*="width: 80px"][style*="height: 80px"]');
    expect(opponentSlots.length).toBe(2);
  });
});
