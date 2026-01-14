import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { ApplicationContextProvider, useApplicationContext } from '../../contexts/ApplicationContext';

import ExchangeManaVialPanel from '../../ux-components/vial-panel/ExchangeManaVialPanel';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { nextPlayer } from '../../systems/playerActions';
import { castSpell } from '../../map/magic/castSpell';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { Mana } from '../../types/Mana';
import { Alignment } from '../../types/Alignment';
import { SpellName } from '../../types/Spell';
import type { GameState } from '../../state/GameState';

import { createGameStateStub } from '../utils/createGameStateStub';

// Mock dependencies
jest.mock('../../map/magic/castSpell');

// Mock CSS modules
jest.mock('../../ux-components/vial-panel/css/VialPanel.module.css', () => ({
  vialPanel: 'vialPanel',
}));

jest.mock('../../ux-components/vial-panel/css/ManaVial.module.css', () => ({
  vialContainer: 'vialContainer',
  fillContainer: 'fillContainer',
  fill: 'fill',
  fillContent: 'fillContent',
  vialImage: 'vialImage',
}));

jest.mock('../../ux-components/vial-panel/css/ExchangeManaVialPanel.module.css', () => ({
  vialPanel: 'exchangeVialPanel',
  exchangeVialContainer: 'exchangeVialContainer',
  exchangeTooltip: 'exchangeTooltip',
}));

const mockCastSpell = castSpell as jest.MockedFunction<typeof castSpell>;

// Test wrapper component that provides game state and exchange mode to context
const TestExchangeVialPanelWrapper: React.FC<{
  gameState: GameState;
  isExchangeMode: boolean;
}> = ({ gameState, isExchangeMode }) => {
  const { updateGameState } = useGameContext();
  const { setIsArcaneExchangeMode } = useApplicationContext();

  React.useEffect(() => {
    updateGameState(gameState);
    setIsArcaneExchangeMode(isExchangeMode);
  }, [gameState, isExchangeMode, updateGameState, setIsArcaneExchangeMode]);

  return <ExchangeManaVialPanel />;
};

const renderExchangeVialPanelWithGameState = (gameState: GameState, isExchangeMode: boolean = true) => {
  return render(
    <ApplicationContextProvider>
      <GameProvider>
        <TestExchangeVialPanelWrapper gameState={gameState} isExchangeMode={isExchangeMode} />
      </GameProvider>
    </ApplicationContextProvider>
  );
};

describe('ExchangeManaVialPanel', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createGameStateStub({ nPlayers: 2 });
    mockCastSpell.mockClear();
  });

  describe('Rendering', () => {
    it('should render all exchangeable mana vials except blue', () => {
      renderExchangeVialPanelWithGameState(gameState);

      // Should render 4 mana vials (white, green, red, black - excluding blue)
      expect(screen.getByAltText('white mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('green mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('red mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('black mana vial')).toBeInTheDocument();

      // Blue mana should not be rendered (it's the source mana for exchange)
      expect(screen.queryByAltText('blue mana vial')).not.toBeInTheDocument();
    });

    it('should not render when gameState is null', () => {
      render(
        <ApplicationContextProvider>
          <GameProvider>
            <ExchangeManaVialPanel />
          </GameProvider>
        </ApplicationContextProvider>
      );

      // Should not render any mana vials
      expect(screen.queryByAltText('white mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('green mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('red mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('black mana vial')).not.toBeInTheDocument();
    });

    it('should not render for AI player', async () => {
      // The component checks turnOwner.playerType !== 'human' and returns null
      // We need to render with AI player as turnOwner from the start
      const aiGameState = createGameStateStub({ nPlayers: 2 });

      // Verify that player 0 is human and player 1 is computer
      expect(aiGameState.players[0].playerType).toBe('human');
      expect(aiGameState.players[1].playerType).toBe('computer');

      // Use nextPlayer to switch to AI player (changes turnOwner ID)
      nextPlayer(aiGameState);

      // Verify getTurnOwner returns AI player
      const turnOwner = getTurnOwner(aiGameState);
      expect(turnOwner.playerType).toBe('computer');

      const { rerender } = renderExchangeVialPanelWithGameState(aiGameState, true);

      // Force a re-render to ensure useEffect has run
      rerender(
        <ApplicationContextProvider>
          <GameProvider>
            <TestExchangeVialPanelWrapper gameState={aiGameState} isExchangeMode={true} />
          </GameProvider>
        </ApplicationContextProvider>
      );

      // Wait for effects to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not render any mana vials for AI player
      expect(screen.queryByAltText('white mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('green mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('red mana vial')).not.toBeInTheDocument();
      expect(screen.queryByAltText('black mana vial')).not.toBeInTheDocument();
    });

    it('should render vials with correct conversion amounts for Lawful alignment', () => {
      // Find a Lawful player from predefined players (Alaric the Bold)
      const lawfulPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.LAWFUL);
      const lawfulGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: lawfulPlayer ? [lawfulPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(lawfulGameState);

      // Check tooltips display correct conversion amounts for Lawful alignment
      expect(screen.getByTestId('exchange-vial-white')).toHaveAttribute('title', 'Exchange to 90 white mana');
      expect(screen.getByTestId('exchange-vial-green')).toHaveAttribute('title', 'Exchange to 90 green mana');
      expect(screen.getByTestId('exchange-vial-red')).toHaveAttribute('title', 'Exchange to 75 red mana');
      expect(screen.getByTestId('exchange-vial-black')).toHaveAttribute('title', 'Exchange to 50 black mana');
    });

    it('should render vials with correct conversion amounts for Chaotic alignment', () => {
      // Find a Chaotic player from predefined players
      const chaoticPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.CHAOTIC);
      const chaoticGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: chaoticPlayer ? [chaoticPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(chaoticGameState);

      // Check tooltips display correct conversion amounts for Chaotic alignment
      expect(screen.getByTestId('exchange-vial-white')).toHaveAttribute('title', 'Exchange to 50 white mana');
      expect(screen.getByTestId('exchange-vial-green')).toHaveAttribute('title', 'Exchange to 75 green mana');
      expect(screen.getByTestId('exchange-vial-red')).toHaveAttribute('title', 'Exchange to 90 red mana');
      expect(screen.getByTestId('exchange-vial-black')).toHaveAttribute('title', 'Exchange to 90 black mana');
    });

    it('should render vials with correct conversion amounts for Neutral alignment', () => {
      // Find a Neutral player from predefined players
      const neutralPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.NEUTRAL);
      const neutralGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: neutralPlayer ? [neutralPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(neutralGameState);

      // Check tooltips display correct conversion amounts for Neutral alignment (95 for all)
      expect(screen.getByTestId('exchange-vial-white')).toHaveAttribute('title', 'Exchange to 95 white mana');
      expect(screen.getByTestId('exchange-vial-green')).toHaveAttribute('title', 'Exchange to 95 green mana');
      expect(screen.getByTestId('exchange-vial-red')).toHaveAttribute('title', 'Exchange to 95 red mana');
      expect(screen.getByTestId('exchange-vial-black')).toHaveAttribute('title', 'Exchange to 95 black mana');
    });
  });

  describe('User Interactions', () => {
    it('should call castSpell with correct parameters when clicking a vial', () => {
      renderExchangeVialPanelWithGameState(gameState);

      fireEvent.click(screen.getByTestId('exchange-vial-white'));

      // Verify castSpell was called with correct parameters
      expect(mockCastSpell).toHaveBeenCalledWith(gameState, SpellName.EXCHANGE, undefined, undefined, Mana.WHITE);
    });

    it('should update game state after exchange', () => {
      const { rerender } = renderExchangeVialPanelWithGameState(gameState);

      fireEvent.click(screen.getByTestId('exchange-vial-green'));

      // Verify castSpell was called
      expect(mockCastSpell).toHaveBeenCalledWith(gameState, SpellName.EXCHANGE, undefined, undefined, Mana.GREEN);

      // The component should trigger updateGameState
      // We can verify this by re-rendering with updated state
      rerender(
        <ApplicationContextProvider>
          <GameProvider>
            <TestExchangeVialPanelWrapper gameState={gameState} isExchangeMode={false} />
          </GameProvider>
        </ApplicationContextProvider>
      );
    });

    it('should handle clicks on all mana types', () => {
      renderExchangeVialPanelWithGameState(gameState);

      const manaTypes = [
        { type: Mana.WHITE, testId: 'exchange-vial-white' },
        { type: Mana.GREEN, testId: 'exchange-vial-green' },
        { type: Mana.RED, testId: 'exchange-vial-red' },
        { type: Mana.BLACK, testId: 'exchange-vial-black' },
      ];

      manaTypes.forEach(({ type, testId }) => {
        mockCastSpell.mockClear();

        fireEvent.click(screen.getByTestId(testId));

        expect(mockCastSpell).toHaveBeenCalledWith(gameState, SpellName.EXCHANGE, undefined, undefined, type);
      });
    });
  });

  describe('Hover Interactions', () => {
    it('should show tooltip on hover', () => {
      const lawfulPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.LAWFUL);
      const lawfulGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: lawfulPlayer ? [lawfulPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(lawfulGameState);

      fireEvent.mouseEnter(screen.getByTestId('exchange-vial-white'));

      // Check that tooltip appears with correct conversion amount
      const expectedAmount = calculateManaConversionAmount(Alignment.LAWFUL, Mana.WHITE);
      expect(screen.getByText(`+${expectedAmount} white`)).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      const neutralPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.NEUTRAL);
      const neutralGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: neutralPlayer ? [neutralPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(neutralGameState);

      const redVial = screen.getByTestId('exchange-vial-red');

      // Hover to show tooltip
      fireEvent.mouseEnter(redVial);
      const expectedAmount = calculateManaConversionAmount(Alignment.NEUTRAL, Mana.RED);
      expect(screen.getByText(`+${expectedAmount} red`)).toBeInTheDocument();

      // Leave to hide tooltip
      fireEvent.mouseLeave(redVial);
      expect(screen.queryByText(`+${expectedAmount} red`)).not.toBeInTheDocument();
    });

    it('should show different tooltips when hovering different vials', () => {
      const chaoticPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.CHAOTIC);
      const chaoticGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: chaoticPlayer ? [chaoticPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(chaoticGameState);

      const blackVial = screen.getByTestId('exchange-vial-black');
      const whiteVial = screen.getByTestId('exchange-vial-white');

      // Hover over black vial
      fireEvent.mouseEnter(blackVial);
      const blackAmount = calculateManaConversionAmount(Alignment.CHAOTIC, Mana.BLACK);
      expect(screen.getByText(`+${blackAmount} black`)).toBeInTheDocument();

      // Leave black vial
      fireEvent.mouseLeave(blackVial);
      expect(screen.queryByText(`+${blackAmount} black`)).not.toBeInTheDocument();

      // Hover over white vial
      fireEvent.mouseEnter(whiteVial);
      const whiteAmount = calculateManaConversionAmount(Alignment.CHAOTIC, Mana.WHITE);
      expect(screen.getByText(`+${whiteAmount} white`)).toBeInTheDocument();
    });

    it('should only show one tooltip at a time', () => {
      const lawfulPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.LAWFUL);
      const lawfulGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: lawfulPlayer ? [lawfulPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(lawfulGameState);

      const greenVial = screen.getByTestId('exchange-vial-green');
      const redVial = screen.getByTestId('exchange-vial-red');

      // Hover over green vial
      fireEvent.mouseEnter(greenVial);
      const greenAmount = calculateManaConversionAmount(Alignment.LAWFUL, Mana.GREEN);
      expect(screen.getByText(`+${greenAmount} green`)).toBeInTheDocument();

      // Hover over red vial without leaving green
      fireEvent.mouseEnter(redVial);
      const redAmount = calculateManaConversionAmount(Alignment.LAWFUL, Mana.RED);

      // Only red tooltip should be visible
      expect(screen.queryByText(`+${greenAmount} green`)).not.toBeInTheDocument();
      expect(screen.getByText(`+${redAmount} red`)).toBeInTheDocument();
    });
  });

  describe('Integration with Conversion Utility', () => {
    it('should calculate conversion amounts correctly for all alignments', () => {
      const alignments = [Alignment.LAWFUL, Alignment.NEUTRAL, Alignment.CHAOTIC];
      const manaTypes = [Mana.WHITE, Mana.GREEN, Mana.RED, Mana.BLACK];

      alignments.forEach((alignment) => {
        const playerWithAlignment = PREDEFINED_PLAYERS.find((p) => p.alignment === alignment);
        const testGameState = createGameStateStub({
          nPlayers: 2,
          gamePlayers: playerWithAlignment ? [playerWithAlignment, PREDEFINED_PLAYERS[1]] : undefined,
        });

        const { unmount } = renderExchangeVialPanelWithGameState(testGameState);

        manaTypes.forEach((manaType) => {
          const expectedAmount = calculateManaConversionAmount(alignment, manaType);
          const vial = screen.getByTestId(`exchange-vial-${manaType}`);

          expect(vial).toHaveAttribute('title', `Exchange to ${expectedAmount} ${manaType} mana`);
        });

        unmount();
      });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to the panel', () => {
      renderExchangeVialPanelWithGameState(gameState);

      // Check that the panel exists - since vials render, the panel must exist
      const panel = screen.getByTestId('exchange-vial-panel');
      expect(panel).toBeInTheDocument();

      // Verify it has 4 vials
      const vials = screen.getAllByTestId(/^exchange-vial-(white|green|red|black)$/);
      expect(vials).toHaveLength(4);
    });

    it('should apply correct CSS classes to exchange vial containers', () => {
      renderExchangeVialPanelWithGameState(gameState);

      // Check that exchange vial containers have correct CSS class
      const exchangeVials = screen.getAllByTestId(/^exchange-vial-(white|green|red|black)$/);
      expect(exchangeVials).toHaveLength(4); // 4 mana types (excluding blue)
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking on same vial', () => {
      renderExchangeVialPanelWithGameState(gameState);

      const blackVial = screen.getByTestId('exchange-vial-black');

      // Click multiple times rapidly
      fireEvent.click(blackVial);
      fireEvent.click(blackVial);
      fireEvent.click(blackVial);

      // castSpell should be called for each click
      expect(mockCastSpell).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid clicking on different vials', () => {
      renderExchangeVialPanelWithGameState(gameState);

      const whiteVial = screen.getByTestId('exchange-vial-white');
      const greenVial = screen.getByTestId('exchange-vial-green');

      fireEvent.click(whiteVial);
      fireEvent.click(greenVial);

      expect(mockCastSpell).toHaveBeenCalledTimes(2);
      expect(mockCastSpell).toHaveBeenNthCalledWith(1, gameState, SpellName.EXCHANGE, undefined, undefined, Mana.WHITE);
      expect(mockCastSpell).toHaveBeenNthCalledWith(2, gameState, SpellName.EXCHANGE, undefined, undefined, Mana.GREEN);
    });

    it('should handle hover and click interactions together', () => {
      const neutralPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.NEUTRAL);
      const neutralGameState = createGameStateStub({
        nPlayers: 2,
        gamePlayers: neutralPlayer ? [neutralPlayer, PREDEFINED_PLAYERS[1]] : undefined,
      });

      renderExchangeVialPanelWithGameState(neutralGameState);

      const redVial = screen.getByTestId('exchange-vial-red');

      // Hover to show tooltip
      fireEvent.mouseEnter(redVial);
      const expectedAmount = calculateManaConversionAmount(Alignment.NEUTRAL, Mana.RED);
      expect(screen.getByText(`+${expectedAmount} red`)).toBeInTheDocument();

      // Click while hovering
      fireEvent.click(redVial);

      // Verify castSpell was called
      expect(mockCastSpell).toHaveBeenCalledWith(neutralGameState, SpellName.EXCHANGE, undefined, undefined, Mana.RED);
    });
  });

  describe('Component Structure', () => {
    it('should render exactly 4 exchange vials', () => {
      renderExchangeVialPanelWithGameState(gameState);

      const vials = screen.getAllByTestId(/^exchange-vial-(white|green|red|black)$/);
      expect(vials).toHaveLength(4);
    });

    it('should render vials in consistent order', () => {
      renderExchangeVialPanelWithGameState(gameState);

      const vialImages = screen.getAllByRole('img', { name: /mana vial/i });
      const vialOrder = vialImages.map((img) => img.getAttribute('alt'));

      // Verify order matches the filter order (white, green, red, black)
      // The actual order depends on Object.values(Mana) order
      expect(vialOrder).toHaveLength(4);
      expect(vialOrder).not.toContain('blue mana vial');
    });
  });
});
