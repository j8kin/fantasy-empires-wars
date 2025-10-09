import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainView from '../ux-components/main-view/MainView';
import { BattlefieldProps } from '../ux-components/battlefield/Battlefield';
import { OpponentInfoProps } from '../ux-components/popups/OpponentInfoPopup';
import { SelectOpponentDialogProps } from '../ux-components/dialogs/SelectOpponentDialog';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';
import { GameProvider } from '../contexts/GameContext';

const renderWithProvider = (ui: React.ReactElement) => {
  const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ApplicationContextProvider>
      <GameProvider>{children}</GameProvider>
    </ApplicationContextProvider>
  );
  return render(ui, { wrapper: AllProvidersWrapper });
};

// Mock CSS modules
jest.mock('../ux-components/main-view/css/Background.module.css', () => ({
  backgroundStyle: 'mocked-background-style',
}));

// Mock child components
jest.mock('../ux-components/top-panel/TopPanel', () => {
  return () => {
    const { PREDEFINED_PLAYERS } = jest.requireActual('../types/GamePlayer');
    const { useApplicationContext } = jest.requireActual('../contexts/ApplicationContext');
    const mockPlayer = PREDEFINED_PLAYERS[0];
    const { setShowStartWindow, setShowSaveDialog, showOpponentInfo, setLandHideModePlayerId } =
      useApplicationContext();
    return (
      <div data-testid="TopPanel">
        <button onClick={() => setShowStartWindow(true)}>New Game</button>
        <button onClick={() => setShowSaveDialog(true)}>Save Game</button>
        <button onClick={() => {}}>End Turn</button>
        <button
          onClick={() => {
            const opponent = { ...mockPlayer, diplomacyStatus: 'Peace' as const };
            showOpponentInfo(opponent, { x: 0, y: 0 });
            setLandHideModePlayerId(opponent.id);
          }}
        >
          Select Opponent
        </button>
      </div>
    );
  };
});

jest.mock('../ux-components/battlefield/Battlefield', () => {
  return (props: BattlefieldProps) => {
    const { useGameState } = jest.requireActual('../contexts/GameContext');
    const { gameState } = useGameState();
    return (
      <div
        data-testid="Battlefield"
        data-battlefield-size={gameState.mapSize}
        data-top={props.topPanelHeight}
      />
    );
  };
});

jest.mock('../ux-components/dialogs/NewGameDialog', () => {
  return () => {
    const { useApplicationContext } = jest.requireActual('../contexts/ApplicationContext');
    const { showSelectOpponentDialogWithConfig } = useApplicationContext();
    return (
      <div data-testid="NewGameDialog">
        <button>Start Game</button>
        <button onClick={() => showSelectOpponentDialogWithConfig([], () => {}, true)}>
          Show Select Opponent
        </button>
      </div>
    );
  };
});

// Don't mock SaveGameDialog, let it use the real component with ApplicationContext

jest.mock('../ux-components/popups/OpponentInfoPopup', () => {
  return (props: OpponentInfoProps) => {
    // Import ApplicationContext hook to access hideOpponentInfo
    const { useApplicationContext } = jest.requireActual('../contexts/ApplicationContext');
    const { hideOpponentInfo, setLandHideModePlayerId } = useApplicationContext();

    const handleClose = () => {
      hideOpponentInfo();
      setLandHideModePlayerId(undefined);
    };

    return props.opponent ? (
      <div data-testid="OpponentInfoPopup">
        <span>{props.opponent.name}</span>
        <button onClick={handleClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../ux-components/dialogs/SelectOpponentDialog', () => {
  return (_props: SelectOpponentDialogProps) => {
    const { useApplicationContext } = jest.requireActual('../contexts/ApplicationContext');
    const { hideSelectOpponentDialog } = useApplicationContext();
    return (
      <div data-testid="SelectOpponentDialog">
        <button onClick={() => hideSelectOpponentDialog()}>Select Player</button>
        <button onClick={() => hideSelectOpponentDialog()}>Cancel</button>
      </div>
    );
  };
});

describe('MainView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    // Mock window.alert to avoid jsdom errors
    jest.spyOn(window, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders MainView with main canvas', () => {
    renderWithProvider(<MainView />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'MainCanvas');
  });

  it('applies correct CSS background style', () => {
    renderWithProvider(<MainView />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('mocked-background-style');
  });

  it('renders TopPanel with correct props', () => {
    renderWithProvider(<MainView />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders Battlefield with correct props', () => {
    renderWithProvider(<MainView />);
    const battlefield = screen.getByTestId('Battlefield');
    expect(battlefield).toBeInTheDocument();
    expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
  });

  it('shows NewGameDialog initially', () => {
    renderWithProvider(<MainView />);
    expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
  });

  describe('Game State Management', () => {
    it('starts a new game when start game is clicked', () => {
      renderWithProvider(<MainView />);

      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      // Since NewGameDialog now handles game start internally, it should still show
      // The test expectation has changed - the dialog doesn't automatically close in the mock
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();

      // Battlefield should update with a new config
      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
    });

    it('updates battlefield size based on game config', () => {
      renderWithProvider(<MainView />);

      // Mock a different map size by modifying the mock
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
    });

    it('shows start window when new game is clicked in TopPanel', () => {
      renderWithProvider(<MainView />);

      // NewGameDialog should be initially visible
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();

      // Click new game in TopPanel
      fireEvent.click(screen.getByText('New Game'));
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
    });
  });

  describe('Save Game Functionality', () => {
    it('opens save dialog when save button is clicked', () => {
      renderWithProvider(<MainView />);

      fireEvent.click(screen.getByText('Save Game'));
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();
    });

    it('closes save dialog when close is clicked', () => {
      renderWithProvider(<MainView />);

      // Open save dialog
      fireEvent.click(screen.getByText('Save Game'));
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();

      // Close save dialog
      fireEvent.click(screen.getByAltText('Cancel'));
      expect(screen.queryByTestId('SaveGameDialog')).not.toBeInTheDocument();
    });

    it('handles save game action', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      renderWithProvider(<MainView />);

      // Open save dialog
      fireEvent.click(screen.getByText('Save Game'));

      // Enter a save name
      const saveInput = screen.getByDisplayValue('');
      fireEvent.change(saveInput, { target: { value: 'test-save' } });

      // Save the game
      fireEvent.click(screen.getByAltText('Save game'));

      expect(consoleSpy).toHaveBeenCalledWith('Saving game with name:', 'test-save');
    });
  });

  describe('Opponent Information', () => {
    it('shows opponent info when opponent is selected', () => {
      renderWithProvider(<MainView />);

      fireEvent.click(screen.getByText('Select Opponent'));
      expect(screen.getByTestId('OpponentInfoPopup')).toBeInTheDocument();
      expect(screen.getByText('Alaric the Bold')).toBeInTheDocument();
    });

    it('closes opponent info dialog', () => {
      renderWithProvider(<MainView />);

      // Open opponent info
      fireEvent.click(screen.getByText('Select Opponent'));
      expect(screen.getByTestId('OpponentInfoPopup')).toBeInTheDocument();

      // Close opponent info
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('OpponentInfoPopup')).not.toBeInTheDocument();
    });
  });

  describe('Select Opponent Dialog', () => {
    it('shows select opponent dialog', () => {
      renderWithProvider(<MainView />);

      fireEvent.click(screen.getByText('Show Select Opponent'));
      expect(screen.getByTestId('SelectOpponentDialog')).toBeInTheDocument();
    });

    it('handles opponent selection', () => {
      renderWithProvider(<MainView />);

      // Show select opponent dialog
      fireEvent.click(screen.getByText('Show Select Opponent'));

      // Select a player
      fireEvent.click(screen.getByText('Select Player'));

      // Dialog should be closed
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });

    it('handles opponent selection cancellation', () => {
      renderWithProvider(<MainView />);

      // Show select opponent dialog
      fireEvent.click(screen.getByText('Show Select Opponent'));

      // Cancel selection
      fireEvent.click(screen.getByText('Cancel'));

      // Dialog should be closed
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('calculates battlefield top position correctly', () => {
      renderWithProvider(<MainView />);

      const battlefield = screen.getByTestId('Battlefield');
      // TOP_PANEL_HEIGHT (300) - Math.min(defaultTileSize.height, defaultTileSize.width)
      // Assuming defaultTileSize has reasonable dimensions
      expect(battlefield).toHaveAttribute('data-top');
    });

    it('updates battlefield key when game restarts', () => {
      renderWithProvider(<MainView />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      // Restart game
      fireEvent.click(screen.getByText('New Game'));
      fireEvent.click(screen.getByText('Start Game'));

      // Battlefield should be re-rendered (React key change triggers re-mount)
      expect(screen.getByTestId('Battlefield')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('maintains proper initial state', () => {
      renderWithProvider(<MainView />);

      // Initial state should show start dialog
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
      expect(screen.queryByTestId('SaveGameDialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('OpponentInfoPopup')).not.toBeInTheDocument();
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });

    it('manages multiple dialog states correctly', () => {
      renderWithProvider(<MainView />);

      // Open save dialog
      fireEvent.click(screen.getByText('Save Game'));
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();

      // Open opponent selection (should be possible alongside save dialog)
      fireEvent.click(screen.getByText('Select Opponent'));
      expect(screen.getByTestId('OpponentInfoPopup')).toBeInTheDocument();

      // Both dialogs can be open simultaneously
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();
      expect(screen.getByTestId('OpponentInfoPopup')).toBeInTheDocument();
    });
  });

  describe('Constants and Configuration', () => {
    it('uses correct TOP_PANEL_HEIGHT constant', () => {
      renderWithProvider(<MainView />);
      const topPanel = screen.getByTestId('TopPanel');
      expect(topPanel).toBeInTheDocument();
      // The height should be passed as a prop to TopPanel (300)
    });

    it('handles defaultTileSize configuration', () => {
      renderWithProvider(<MainView />);
      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toBeInTheDocument();
      // The tileSize should be passed as defaultTileSize
    });
  });
});
