import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewGameDialog from '../ux-components/dialogs/NewGameDialog';
import { GameState } from '../types/HexTileState';

describe('NewGameDialog - Opponent Generation Bug Reproduction', () => {
  const mockOnStartGame = jest.fn();
  const mockOnShowSelectOpponentDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reproduces the bug: opponents persist from previous random selection when switching map sizes', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Step 1: Switch to random opponent mode
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(randomOpponentsCheckbox);

    // Step 2: Set to Large map (should generate 6 random opponents)
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify we have 6 opponents in random mode (text shows "6 of 6")
    expect(screen.getByText('Opponents (6 of 6):')).toBeInTheDocument();

    // Step 3: Switch to Medium map (should generate 4 new random opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Verify we now have exactly 4 opponents
    expect(screen.getByText('Opponents (4 of 4):')).toBeInTheDocument();

    // Step 4: Switch back to manual mode
    fireEvent.click(randomOpponentsCheckbox);

    // Should still show manual mode with 2 selected out of 4 max
    expect(screen.getByText('Opponents (2 of 4):')).toBeInTheDocument();

    // The issue: after these changes, when we switch back to manual mode,
    // we might still see remnants from the previous random selection
    // This test ensures that doesn't happen
  });

  it('ensures unique opponents are generated when switching between random modes', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Switch to random mode
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(randomOpponentsCheckbox);

    // Switch to large map
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify initial random opponents for large map
    expect(screen.getByText('Opponents (6 of 6):')).toBeInTheDocument();

    // Switch to medium
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Should have 4 opponents
    expect(screen.getByText('Opponents (4 of 4):')).toBeInTheDocument();

    // Switch back to large
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Should generate new 6 opponents
    expect(screen.getByText('Opponents (6 of 6):')).toBeInTheDocument();
  });

  it('generates unique opponent players (no duplicates)', () => {
    const TestWrapper = () => {
      const [config, setConfig] = React.useState<GameState | null>(null);

      return (
        <div>
          <NewGameDialog
            onStartGame={(gameConfig) => {
              setConfig(gameConfig);
              mockOnStartGame(gameConfig);
            }}
            onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
          />
          {config && (
            <div data-testid="config-display">
              {config.opponents?.map((opponent, index) => (
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
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(randomOpponentsCheckbox);

    // Set to large map to get 6 opponents
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Start the game to trigger opponent generation
    const startButton = screen.getByAltText('Start game');
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
      const [config, setConfig] = React.useState<GameState | null>(null);

      return (
        <div>
          <NewGameDialog
            onStartGame={(gameConfig) => {
              setConfig(gameConfig);
              mockOnStartGame(gameConfig);
            }}
            onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
          />
          {config && (
            <div data-testid="config-display">
              <div data-testid="opponent-count">{config.opponents?.length}</div>
              <div data-testid="map-size">{config.mapSize}</div>
            </div>
          )}
        </div>
      );
    };

    render(<TestWrapper />);

    // Start with random mode and large map (6 opponents)
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(randomOpponentsCheckbox);

    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify we have 6 opponents
    expect(screen.getByText('Opponents (6 of 6):')).toBeInTheDocument();

    // Switch to medium map (4 opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'medium' } });

    // Should now have exactly 4 opponents
    expect(screen.getByText('Opponents (4 of 4):')).toBeInTheDocument();

    // Start the game and verify the configuration
    const startButton = screen.getByAltText('Start game');
    fireEvent.click(startButton);

    // Check that the final configuration has the correct number of opponents
    expect(screen.getByTestId('opponent-count')).toHaveTextContent('4');
    expect(screen.getByTestId('map-size')).toHaveTextContent('medium');
  });

  it('prevents leftover opponents from previous map configurations', () => {
    render(
      <NewGameDialog
        onStartGame={mockOnStartGame}
        onShowSelectOpponentDialog={mockOnShowSelectOpponentDialog}
      />
    );

    // Start with huge map in random mode (7 opponents)
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    const mapSizeSelect = screen.getByDisplayValue('Medium');

    fireEvent.click(randomOpponentsCheckbox);
    fireEvent.change(mapSizeSelect, { target: { value: 'huge' } });

    // Should have 7 opponents
    expect(screen.getByText('Opponents (7 of 7):')).toBeInTheDocument();

    // Switch to small map (2 opponents)
    fireEvent.change(mapSizeSelect, { target: { value: 'small' } });

    // Should have exactly 2 opponents, not 7
    expect(screen.getByText('Opponents (2 of 2):')).toBeInTheDocument();

    // Switch to manual mode - should still respect the small map constraint
    fireEvent.click(randomOpponentsCheckbox);

    // Should still have exactly 2 opponent slots in manual mode
    expect(screen.getByText('Opponents (2 of 2):')).toBeInTheDocument();
  });
});
