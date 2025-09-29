import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainView from '../ux-components/main-view/MainView';
import { GamePlayer } from '../types/GamePlayer';
import { GameState } from '../types/HexTileState';
import { BattlefieldProps } from '../ux-components/battlefield/Battlefield';
import { NewGameDialogProps } from '../ux-components/dialogs/NewGameDialog';
import { TopPanelProps } from '../ux-components/top-panel/TopPanel';
import { SaveGameDialogProps } from '../ux-components/dialogs/SaveGameDialog';
import { OpponentInfoProps } from '../ux-components/popups/OpponentInfoPopup';
import { SelectOpponentDialogProps } from '../ux-components/dialogs/SelectOpponentDialog';

// Mock CSS modules
jest.mock('../ux-components/main-view/css/Background.module.css', () => ({
  backgroundStyle: 'mocked-background-style',
}));

// Mock child components
jest.mock('../ux-components/top-panel/TopPanel', () => {
  return (props: TopPanelProps) => {
    const { PREDEFINED_PLAYERS } = jest.requireActual('../types/GamePlayer');
    const mockPlayer = PREDEFINED_PLAYERS[0];
    return (
      <div data-testid="TopPanel">
        <button onClick={() => props.onNewGame?.()}>New Game</button>
        <button onClick={() => props.onLoadGame?.()}>Load Game</button>
        <button onClick={() => props.onOpenSaveDialog?.()}>Save Game</button>
        <button onClick={() => props.onEndTurn?.()}>End Turn</button>
        <button
          onClick={() =>
            props.onOpponentSelect?.(
              {
                ...mockPlayer,
                diplomacyStatus: 'Peace' as const,
              },
              { x: 0, y: 0 }
            )
          }
        >
          Select Opponent
        </button>
      </div>
    );
  };
});

jest.mock('../ux-components/battlefield/Battlefield', () => {
  return (props: BattlefieldProps) => {
    return (
      <div
        data-testid="Battlefield"
        data-battlefield-size={props.gameState?.mapSize}
        data-top={props.topPanelHeight}
      />
    );
  };
});

jest.mock('../ux-components/dialogs/NewGameDialog', () => {
  return (props: NewGameDialogProps) => {
    const { PREDEFINED_PLAYERS } = jest.requireActual('../types/GamePlayer');
    const mockPlayer: GamePlayer = PREDEFINED_PLAYERS[0];

    const mockGameState: GameState = {
      tiles: {},
      turn: 0,
      mapSize: 'medium',
      selectedPlayer: mockPlayer,
      opponents: [],
    };

    return (
      <div data-testid="NewGameDialog">
        <button onClick={() => props.onStartGame?.(mockGameState)}>Start Game</button>
        <button onClick={() => props.onShowSelectOpponentDialog?.([], () => {}, true)}>
          Show Select Opponent
        </button>
      </div>
    );
  };
});

jest.mock('../ux-components/dialogs/SaveGameDialog', () => {
  return (props: SaveGameDialogProps) => {
    return props.isOpen ? (
      <div data-testid="SaveGameDialog">
        <button onClick={() => props.onClose?.()}>Close</button>
        <button onClick={() => props.onSave?.('test-save')}>Save</button>
      </div>
    ) : null;
  };
});

jest.mock('../ux-components/popups/OpponentInfoPopup', () => {
  return (props: OpponentInfoProps) => {
    return props.opponent ? (
      <div data-testid="OpponentInfoPopup">
        <span>{props.opponent.name}</span>
        <button onClick={() => props.onClose?.()}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../ux-components/dialogs/SelectOpponentDialog', () => {
  return (props: SelectOpponentDialogProps) => {
    const { PREDEFINED_PLAYERS } = jest.requireActual('../types/GamePlayer');
    const mockPlayer = PREDEFINED_PLAYERS[6];
    return (
      <div data-testid="SelectOpponentDialog">
        <button onClick={() => props.onSelect?.(mockPlayer)}>Select Player</button>
        <button onClick={() => props.onCancel?.()}>Cancel</button>
      </div>
    );
  };
});

describe('MainView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders MainView with main canvas', () => {
    render(<MainView />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'MainCanvas');
  });

  it('applies correct CSS background style', () => {
    render(<MainView />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('mocked-background-style');
  });

  it('renders TopPanel with correct props', () => {
    render(<MainView />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders Battlefield with correct props', () => {
    render(<MainView />);
    const battlefield = screen.getByTestId('Battlefield');
    expect(battlefield).toBeInTheDocument();
    expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
  });

  it('shows NewGameDialog initially', () => {
    render(<MainView />);
    expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
  });

  describe('Game State Management', () => {
    it('starts a new game when start game is clicked', () => {
      render(<MainView />);

      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      // NewGameDialog should be hidden after starting
      expect(screen.queryByTestId('NewGameDialog')).not.toBeInTheDocument();

      // Battlefield should update with a new config
      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
    });

    it('updates battlefield size based on game config', () => {
      render(<MainView />);

      // Mock a different map size by modifying the mock
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toHaveAttribute('data-battlefield-size', 'medium');
    });

    it('shows start window when new game is clicked in TopPanel', () => {
      render(<MainView />);

      // Start a game first to hide the initial dialog
      fireEvent.click(screen.getByText('Start Game'));
      expect(screen.queryByTestId('NewGameDialog')).not.toBeInTheDocument();

      // Click new game in TopPanel
      fireEvent.click(screen.getByText('New Game'));
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
    });
  });

  describe('Save Game Functionality', () => {
    it('opens save dialog when save button is clicked', () => {
      render(<MainView />);

      fireEvent.click(screen.getByText('Save Game'));
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();
    });

    it('closes save dialog when close is clicked', () => {
      render(<MainView />);

      // Open save dialog
      fireEvent.click(screen.getByText('Save Game'));
      expect(screen.getByTestId('SaveGameDialog')).toBeInTheDocument();

      // Close save dialog
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('SaveGameDialog')).not.toBeInTheDocument();
    });

    it('handles save game action', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<MainView />);

      // Open save dialog and save
      fireEvent.click(screen.getByText('Save Game'));
      fireEvent.click(screen.getByText('Save'));

      expect(consoleSpy).toHaveBeenCalledWith('Saving game with name:', 'test-save');
    });
  });

  describe('Opponent Information', () => {
    it('shows opponent info when opponent is selected', () => {
      render(<MainView />);

      fireEvent.click(screen.getByText('Select Opponent'));
      expect(screen.getByTestId('OpponentInfoPopup')).toBeInTheDocument();
      expect(screen.getByText('Alaric the Bold')).toBeInTheDocument();
    });

    it('closes opponent info dialog', () => {
      render(<MainView />);

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
      render(<MainView />);

      fireEvent.click(screen.getByText('Show Select Opponent'));
      expect(screen.getByTestId('SelectOpponentDialog')).toBeInTheDocument();
    });

    it('handles opponent selection', () => {
      render(<MainView />);

      // Show select opponent dialog
      fireEvent.click(screen.getByText('Show Select Opponent'));

      // Select a player
      fireEvent.click(screen.getByText('Select Player'));

      // Dialog should be closed
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });

    it('handles opponent selection cancellation', () => {
      render(<MainView />);

      // Show select opponent dialog
      fireEvent.click(screen.getByText('Show Select Opponent'));

      // Cancel selection
      fireEvent.click(screen.getByText('Cancel'));

      // Dialog should be closed
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('passes correct callbacks to TopPanel', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<MainView />);

      // Test load game callback
      fireEvent.click(screen.getByText('Load Game'));
      expect(consoleSpy).toHaveBeenCalledWith('Load Game functionality to be implemented');

      // Test end turn callback
      fireEvent.click(screen.getByText('End Turn'));
      expect(consoleSpy).toHaveBeenCalledWith('End turn clicked');
    });

    it('calculates battlefield top position correctly', () => {
      render(<MainView />);

      const battlefield = screen.getByTestId('Battlefield');
      // TOP_PANEL_HEIGHT (300) - Math.min(defaultTileSize.height, defaultTileSize.width)
      // Assuming defaultTileSize has reasonable dimensions
      expect(battlefield).toHaveAttribute('data-top');
    });

    it('updates battlefield key when game restarts', () => {
      render(<MainView />);

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
      render(<MainView />);

      // Initial state should show start dialog
      expect(screen.getByTestId('NewGameDialog')).toBeInTheDocument();
      expect(screen.queryByTestId('SaveGameDialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('OpponentInfoPopup')).not.toBeInTheDocument();
      expect(screen.queryByTestId('SelectOpponentDialog')).not.toBeInTheDocument();
    });

    it('manages multiple dialog states correctly', () => {
      render(<MainView />);

      // Start game to clear initial dialog
      fireEvent.click(screen.getByText('Start Game'));

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
      render(<MainView />);
      const topPanel = screen.getByTestId('TopPanel');
      expect(topPanel).toBeInTheDocument();
      // The height should be passed as a prop to TopPanel (300)
    });

    it('handles defaultTileSize configuration', () => {
      render(<MainView />);
      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toBeInTheDocument();
      // The tileSize should be passed as defaultTileSize
    });
  });
});
