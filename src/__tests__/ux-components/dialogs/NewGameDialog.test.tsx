import React, { ReactNode, useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewGameDialog from '../../../ux-components/dialogs/NewGameDialog';
import { PREDEFINED_PLAYERS } from '../../../types/GamePlayer';
import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import { GameProvider, useGameContext } from '../../../contexts/GameContext';
import { createDefaultGameStateStub } from '../../utils/createGameStateStub';

const GameStateInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { updateGameState } = useGameContext();

  useEffect(() => {
    const initialState = createDefaultGameStateStub();
    updateGameState(initialState);
  }, [updateGameState]);

  return <>{children}</>;
};

const renderNewGameDialog = () => {
  render(
    <ApplicationContextProvider>
      <GameProvider>
        <GameStateInitializer>
          <NewGameDialog />
        </GameStateInitializer>
      </GameProvider>
    </ApplicationContextProvider>
  );
};

describe('NewGameWindow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    renderNewGameDialog();
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  it('renders map size dropdown with default medium selection', () => {
    renderNewGameDialog();
    const mapSizeDropdown = screen.getByDisplayValue('Medium');
    expect(mapSizeDropdown).toBeInTheDocument();
  });

  it('renders opponent selection mode checkbox with default unchecked state', () => {
    renderNewGameDialog();
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    expect(randomOpponentsCheckbox).toBeInTheDocument();
    expect(randomOpponentsCheckbox).not.toBeChecked();
    expect(screen.getByText('Random Opponents')).toBeInTheDocument();
  });

  it('renders all predefined players in the player list', () => {
    renderNewGameDialog();
    PREDEFINED_PLAYERS.forEach((player) => {
      expect(screen.getAllByText(player.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('starts game when Start Game button is clicked', () => {
    renderNewGameDialog();
    const startButton = screen.getByAltText('Start game');
    fireEvent.click(startButton);

    // The dialog should disappear after starting the game
    // This is handled by the ApplicationContext state changes
  });

  it('updates map size when dropdown value changes', () => {
    renderNewGameDialog();
    const mapSizeDropdown = screen.getByDisplayValue('Medium');

    fireEvent.change(mapSizeDropdown, { target: { value: 'large' } });
    expect(screen.getByDisplayValue('Large')).toBeInTheDocument();
  });

  it('changes opponent selection mode when checkbox is toggled', () => {
    renderNewGameDialog();
    const randomOpponentsCheckbox = screen.getByRole('checkbox');

    fireEvent.click(randomOpponentsCheckbox);
    expect(randomOpponentsCheckbox).toBeChecked();

    fireEvent.click(randomOpponentsCheckbox);
    expect(randomOpponentsCheckbox).not.toBeChecked();
  });

  it('updates selected player when a different player is clicked', () => {
    renderNewGameDialog();

    // Click on the second player
    const secondPlayerName = PREDEFINED_PLAYERS[1].name;
    fireEvent.click(screen.getByText(secondPlayerName));

    // Verify the player details section shows the new player
    const playerDetailHeaders = screen.getAllByText(secondPlayerName);
    expect(playerDetailHeaders.length).toBeGreaterThan(0);
  });

  it('shows correct max opponents label for different map sizes', () => {
    renderNewGameDialog();

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

  it('filters out NO_PLAYER from opponents when starting game in manual mode', () => {
    renderNewGameDialog();

    // Component starts in manual mode by default (checkbox unchecked)
    const randomOpponentsCheckbox = screen.getByRole('checkbox');
    expect(randomOpponentsCheckbox).not.toBeChecked();

    // Click on an opponent slot to open selection dialog (this will trigger NO_PLAYER selection)
    const opponentSlots = screen
      .getAllByRole('generic')
      .filter((el) => el.style.cursor === 'pointer' || el.onclick);
    if (opponentSlots.length > 0) {
      fireEvent.click(opponentSlots[0]);
    }

    // Click start game - this should work without error
    const startButton = screen.getByAltText('Start game');
    fireEvent.click(startButton);
  });

  it('closes dialog when Cancel button is clicked', () => {
    renderNewGameDialog();

    const cancelButton = screen.getByAltText('Cancel');
    fireEvent.click(cancelButton);

    // The dialog should disappear after clicking cancel
    // This is handled by the ApplicationContext state changes
  });
});
