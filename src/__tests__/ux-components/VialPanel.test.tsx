import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';

import VialPanel from '../../ux-components/vial-panel/VialPanel';

import { GameState } from '../../state/GameState';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getMinManaCost } from '../../selectors/spellSelectors';
import { nextPlayer } from '../../systems/playerActions';
import { heroFactory } from '../../factories/heroFactory';

import { ManaType } from '../../types/Mana';
import { HeroUnitType } from '../../types/UnitType';
import { createGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

// Mock the image import
jest.mock('../../assets/getManaVialImg', () => ({
  getManaVialImg: () => 'mock-vial-image.png',
}));

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
  exchangeVialContainer: 'exchangeVialContainer',
  exchangeTooltip: 'exchangeTooltip',
}));

// Test wrapper component that provides game state to context
const TestVialPanelWrapper: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const { updateGameState } = useGameContext();

  React.useEffect(() => {
    updateGameState(gameState);
  }, [gameState, updateGameState]);

  return <VialPanel />;
};

const renderVialPanelWithGameState = (gameState: GameState) => {
  return render(
    <ApplicationContextProvider>
      <GameProvider>
        <TestVialPanelWrapper gameState={gameState} />
      </GameProvider>
    </ApplicationContextProvider>
  );
};

describe('VialPanel Integration Test', () => {
  let gameState: GameState;
  beforeEach(() => {
    gameState = createGameStateStub({ nPlayers: 2 });
  });

  describe('Human player scenarios', () => {
    it('should render mana vials for human player with sufficient mana', () => {
      placeUnitsOnMap(
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.ENCHANTER, HeroUnitType.ENCHANTER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.DRUID, HeroUnitType.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.PYROMANCER, HeroUnitType.PYROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      // Set mana values above minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: 1,
        [ManaType.BLUE]: 1,
        [ManaType.GREEN]: 1,
        [ManaType.RED]: 1,
        [ManaType.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that all mana vials are rendered
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();
      expect(screen.getByTestId('blue-filled-mana-vial')).toBeInTheDocument();
      expect(screen.getByTestId('green-filled-mana-vial')).toBeInTheDocument();
      expect(screen.getByTestId('red-filled-mana-vial')).toBeInTheDocument();
      expect(screen.getByTestId('black-filled-mana-vial')).toBeInTheDocument();

      // Check that ManaVial components render their alt text
      expect(screen.getByAltText('white mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('blue mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('green mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('red mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('black mana vial')).toBeInTheDocument();
    });

    it('should only render vials for mana types with sufficient mana', () => {
      // Display only mana when related mage is available if mana level below minimum threshold
      placeUnitsOnMap(
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.DRUID, HeroUnitType.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: 1,
        [ManaType.BLUE]: 1,
        [ManaType.GREEN]: 1,
        [ManaType.RED]: 1,
        [ManaType.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that only sufficient mana vials are rendered
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('green-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('black-filled-mana-vial')).toBeInTheDocument();
    });

    it('should render no vials when all mana is below minimum thresholds', () => {
      // Set all mana types below minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) - 1,
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) - 1,
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) - 1,
        [ManaType.RED]: getMinManaCost(ManaType.RED) - 1,
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) - 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that no mana vials are rendered
      expect(screen.queryByTestId('white-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('green-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('black-filled-mana-vial')).not.toBeInTheDocument();
    });
  });

  describe('AI player scenarios', () => {
    it('should not render for AI player turn', () => {
      nextPlayer(gameState); // Switch to AI player
      // Set mana values above minimum thresholds for AI player
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10,
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) + 15,
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) + 20,
        [ManaType.RED]: getMinManaCost(ManaType.RED) + 25,
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) + 30,
      };

      renderVialPanelWithGameState(gameState);

      // Check that no mana vials are rendered for AI player
      expect(screen.queryByTestId('white-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('green-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('black-filled-mana-vial')).not.toBeInTheDocument();
    });
  });

  describe('ManaVial component integration', () => {
    it('should properly render ManaVial with different mana amounts', () => {
      // Set specific mana amounts to test ManaVial rendering
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: 50, // Low mana
        [ManaType.BLUE]: 100, // Medium mana
        [ManaType.GREEN]: 200, // Max mana
        [ManaType.RED]: getMinManaCost(ManaType.RED) - 1, // Below threshold (won't render)
        [ManaType.BLACK]: 150, // High mana
      };

      renderVialPanelWithGameState(gameState);

      // Check that ManaVials render with proper styling
      const whiteManaVial = screen.getByTestId('white-filled-mana-vial');
      const blueManaVial = screen.getByTestId('blue-filled-mana-vial');
      const greenManaVial = screen.getByTestId('green-filled-mana-vial');
      const blackManaVial = screen.getByTestId('black-filled-mana-vial');

      expect(whiteManaVial).toBeInTheDocument();
      expect(blueManaVial).toBeInTheDocument();
      expect(greenManaVial).toBeInTheDocument();
      expect(blackManaVial).toBeInTheDocument();

      // Red mana vial should not render as it's below threshold
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();

      // Check that images are rendered for each vial
      expect(screen.getByAltText('white mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('blue mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('green mana vial')).toBeInTheDocument();
      expect(screen.getByAltText('black mana vial')).toBeInTheDocument();
    });

    it('should handle null/undefined mana values gracefully', () => {
      // place all mages to verify that null/zero mana handled properly
      placeUnitsOnMap(
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.ENCHANTER, HeroUnitType.ENCHANTER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.DRUID, HeroUnitType.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.PYROMANCER, HeroUnitType.PYROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      const humanPlayer = getTurnOwner(gameState);
      humanPlayer.mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10,
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) + 15,
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) + 20,
        [ManaType.RED]: getMinManaCost(ManaType.RED) + 25,
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) + 30,
      };

      const { rerender } = renderVialPanelWithGameState(gameState);

      // Initially all vials should render
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();

      // Now set mana to undefined/null for some types and re-render
      // This tests the ManaVial component's null handling (should return null)
      humanPlayer.mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10,
        [ManaType.BLUE]: undefined as any,
        [ManaType.GREEN]: null as any,
        [ManaType.RED]: getMinManaCost(ManaType.RED) + 25,
        [ManaType.BLACK]: 0, // Since hero exist vial should be rendered
      };

      rerender(
        <ApplicationContextProvider>
          <GameProvider>
            <TestVialPanelWrapper gameState={gameState} />
          </GameProvider>
        </ApplicationContextProvider>
      );

      // Only white and red vials should render
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('green-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('red-filled-mana-vial')).toBeInTheDocument();
      expect(screen.getByTestId('black-filled-mana-vial')).toBeInTheDocument();
    });
  });

  describe('Component structure and styling', () => {
    it('should render with correct CSS classes and structure', () => {
      placeUnitsOnMap(
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.DRUID, HeroUnitType.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: 1,
        [ManaType.BLUE]: 1, // Won't render
        [ManaType.GREEN]: 1,
        [ManaType.RED]: 1, // Won't render
        [ManaType.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that ManaVial components have correct structure using accessible queries
      const vialContainers = screen.getAllByTestId(/filled-mana-vial$/i);
      expect(vialContainers).toHaveLength(3); // Only 3 should render

      // Check for images by their accessible name (alt text)
      const vialImages = screen.getAllByRole('img', { name: /mana vial/i });
      expect(vialImages).toHaveLength(3);

      // Verify that the mana vials are rendered correctly
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('green-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('black-filled-mana-vial')).toBeInTheDocument();
    });
  });
});
