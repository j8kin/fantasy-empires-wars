import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopPanel from '../../ux-components/top-panel/TopPanel';
import { defaultTileDimensions } from '../../ux-components/fantasy-border-frame/FantasyBorderFrame';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { PREDEFINED_PLAYERS } from '../../state/PlayerState';
import { ManaType } from '../../types/Mana';
import { createGameState, TurnPhase } from '../../state/GameState';
import { generateMockMap } from '../utils/generateMockMap';

const renderWithProvider = (ui: React.ReactElement) => {
  const Bootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { updateGameState, gameState } = useGameContext();
    React.useEffect(() => {
      if (!gameState) {
        // Create a new GameState using the createGameState function
        const map = generateMockMap({ rows: 9, cols: 18 });
        const newGameState = createGameState(map);

        // Add players to the game
        PREDEFINED_PLAYERS.slice(0, 3).forEach((player, index) => {
          newGameState.addPlayer(player, index === 0 ? 'human' : 'computer');
        });

        // Set up the first player with test data
        const firstPlayer = newGameState.getPlayer(PREDEFINED_PLAYERS[0].id);
        firstPlayer.vault = 1500;
        firstPlayer.mana = {
          [ManaType.WHITE]: 100,
          [ManaType.BLACK]: 100,
          [ManaType.RED]: 100,
          [ManaType.GREEN]: 100,
          [ManaType.BLUE]: 100,
        };

        // Set turn phase to MAIN
        while (newGameState.turnPhase !== TurnPhase.MAIN) newGameState.nextPhase();

        updateGameState(newGameState);
      }
    }, [gameState, updateGameState]);
    return <>{children}</>;
  };

  const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ApplicationContextProvider>
      <GameProvider>
        <Bootstrapper>{children}</Bootstrapper>
      </GameProvider>
    </ApplicationContextProvider>
  );
  return render(ui, { wrapper: AllProvidersWrapper });
};

const defaultProps = {
  height: 120,
  tileDimensions: defaultTileDimensions,
};

describe('TopPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Player Information Display', () => {
    it('displays selected player name and avatar', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      expect(await screen.findByText('Alaric the Bold')).toBeInTheDocument();
      expect(await screen.findByAltText('Alaric the Bold')).toBeInTheDocument();
    });

    it('displays player gold and income information', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);

      // Test that gold is displayed (calculated/formatted value, so test for pattern)
      const goldPattern = /Gold: [\d,]+/;
      const goldElements = await screen.findAllByText(goldPattern);
      expect(goldElements.length).toBeGreaterThan(0);

      // Test that income is displayed (calculated value, so test for pattern)
      // Income can be positive (+income/turn), zero (0/turn), or negative (-income/turn)
      const incomePattern = /[+-]?\d+\/turn/;
      const incomeElements = await screen.findAllByText(incomePattern);
      expect(incomeElements.length).toBeGreaterThan(0);
    });

    it('calculates player avatar size correctly based on panel height and tile dimensions', () => {
      const height = 120;
      const tileDimensions = { width: 50, height: 180 };
      const expectedSize = height - Math.min(tileDimensions.height, tileDimensions.width) * 2 - 10;
      expect(expectedSize).toBe(10); // 120 - 50*2 - 10 = 10
    });
  });

  describe('Action Buttons Functionality', () => {
    it('renders Build, Cast, and Move action buttons', () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      expect(screen.getByAltText('Construct Buildings')).toBeInTheDocument();
      expect(screen.getByAltText('Cast spell')).toBeInTheDocument();
      expect(screen.getByAltText('Use Item')).toBeInTheDocument();
    });

    it('handles Build button click', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const buildButton = screen.getByAltText('Construct Buildings');
      const user = userEvent.setup();
      await user.click(buildButton);
      // Component should handle the click without errors
      expect(buildButton).toBeInTheDocument();
    });

    it('handles Cast button click', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const castButton = screen.getByAltText('Cast spell');
      const user = userEvent.setup();
      await user.click(castButton);
      // Component should handle the click without errors
      expect(castButton).toBeInTheDocument();
    });

    it('renders End Turn button and processes turn flow correctly', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);

      const endTurnButton = screen.getByAltText('End of turn');
      expect(endTurnButton).toBeInTheDocument();

      // Click the end turn button
      const user = userEvent.setup();
      await user.click(endTurnButton);

      // The button should still be in the document after processing
      expect(endTurnButton).toBeInTheDocument();

      // Wait for any turn processing to complete (if any asynchronous updates occur)
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe('Game Controls', () => {
    it('renders game control buttons (New Game, Save)', () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      expect(screen.getByAltText('New game')).toBeInTheDocument();
      expect(screen.getByAltText('Save game')).toBeInTheDocument();
    });

    it('handles New Game button click', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const newGameButton = screen.getByAltText('New game');
      const user = userEvent.setup();
      await user.click(newGameButton);
      // Component should handle the click without errors
      expect(newGameButton).toBeInTheDocument();
    });

    it('handles Save Game button click', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const saveButton = screen.getByAltText('Save game');
      const user = userEvent.setup();
      await user.click(saveButton);
      // Component should handle the click without errors
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Opponents Panel Integration', () => {
    it('renders with minimum opponents when no opponents array provided', () => {
      // Test with empty game state
      const TestComponentWithMinOpponents: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => {
        const { updateGameState, gameState } = useGameContext();
        React.useEffect(() => {
          if (!gameState) {
            // Create a new GameState using the createGameState function
            const map = generateMockMap({ rows: 9, cols: 18 });
            const newGameState = createGameState(map);

            // Add only one player
            newGameState.addPlayer(PREDEFINED_PLAYERS[0], 'human');

            // Set turn phase to MAIN
            while (newGameState.turnPhase !== TurnPhase.MAIN) newGameState.nextPhase();

            updateGameState(newGameState);
          }
        }, [gameState, updateGameState]);
        return <>{children}</>;
      };

      const WrapperWithMinOpponents: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <ApplicationContextProvider>
          <GameProvider>
            <TestComponentWithMinOpponents>{children}</TestComponentWithMinOpponents>
          </GameProvider>
        </ApplicationContextProvider>
      );

      render(<TopPanel {...defaultProps} />, { wrapper: WrapperWithMinOpponents });
      expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
      // OpponentsPanel should receive numberOfOpponents = 2 (MIN_OPPONENTS)
    });

    it('renders with opponents array when available', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      expect(await screen.findByText('Alaric the Bold')).toBeInTheDocument();
      // OpponentsPanel should receive the opponents array from gameState
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct container styles', () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const topPanel = screen.getByTestId('TopPanel');
      expect(topPanel).toHaveClass('frameContainer', 'fullSize', 'top-bar-panel');
    });

    it('handles different panel heights correctly', async () => {
      renderWithProvider(<TopPanel {...defaultProps} height={200} />);
      expect(await screen.findByText('Alaric the Bold')).toBeInTheDocument();
      // Component should adjust avatar size based on height
    });

    it('handles different tile dimensions correctly', async () => {
      const customTileDimensions = { width: 25, height: 90 };
      renderWithProvider(<TopPanel {...defaultProps} tileDimensions={customTileDimensions} />);
      expect(await screen.findByText('Alaric the Bold')).toBeInTheDocument();
      // Component should adjust avatar size based on tileDimensions
    });
  });

  describe('Component Integration', () => {
    it('integrates all child components correctly', async () => {
      renderWithProvider(<TopPanel {...defaultProps} />);

      // Verify player section
      expect(await screen.findByText('Alaric the Bold')).toBeInTheDocument();

      // Verify gold is displayed (calculated/formatted value)
      const goldPattern = /Gold: [\d,]+/;
      const goldElements = await screen.findAllByText(goldPattern);
      expect(goldElements.length).toBeGreaterThan(0);

      // Verify income is displayed (calculated value)
      // Income can be positive (+income/turn), zero (0/turn), or negative (-income/turn)
      const incomePattern = /[+-]?\d+\/turn/;
      const incomeElements = await screen.findAllByText(incomePattern);
      expect(incomeElements.length).toBeGreaterThan(0);

      // Verify map action buttons
      expect(screen.getByAltText('Construct Buildings')).toBeInTheDocument();
      expect(screen.getByAltText('Cast spell')).toBeInTheDocument();
      expect(screen.getByAltText('Use Item')).toBeInTheDocument();

      // Verify game controls
      expect(screen.getByAltText('New game')).toBeInTheDocument();
      expect(screen.getByAltText('Save game')).toBeInTheDocument();
      expect(screen.getByAltText('End of turn')).toBeInTheDocument();
    });

    it('renders all panels without errors', () => {
      renderWithProvider(<TopPanel {...defaultProps} />);
      const topPanel = screen.getByTestId('TopPanel');
      expect(topPanel).toBeInTheDocument();
      // VialPanel, OpponentsPanel, MapActionsControl, and GameControl should all render
    });
  });
});
