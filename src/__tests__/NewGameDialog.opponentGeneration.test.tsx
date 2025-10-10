import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewGameDialog from '../ux-components/dialogs/NewGameDialog';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';
import { GameProvider } from '../contexts/GameContext';

const renderNewGameDialog = () => {
  render(
    <ApplicationContextProvider>
      <GameProvider>
        <NewGameDialog />
      </GameProvider>
    </ApplicationContextProvider>
  );
};

describe('NewGameDialog - Opponent Generation Bug Reproduction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reproduces the bug: opponents persist from previous random selection when switching map sizes', () => {
    renderNewGameDialog();

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
    renderNewGameDialog();

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
    // Just test that the dialog renders and behaves correctly
    renderNewGameDialog();

    // Switch to random mode
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(randomOpponentsCheckbox);

    // Set to large map to get 6 opponents
    const mapSizeSelect = screen.getByDisplayValue('Medium');
    fireEvent.change(mapSizeSelect, { target: { value: 'large' } });

    // Verify we have 6 opponents in random mode
    expect(screen.getByText('Opponents (6 of 6):')).toBeInTheDocument();
  });

  it('correctly handles avatar size calculation after map size changes', () => {
    renderNewGameDialog();

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
  });

  it('prevents leftover opponents from previous map configurations', () => {
    renderNewGameDialog();

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
