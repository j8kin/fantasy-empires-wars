import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';

import VialPanel from '../../ux-components/vial-panel/VialPanel';

import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getMinManaCost } from '../../selectors/spellSelectors';
import { nextPlayer } from '../../systems/playerActions';
import { heroFactory } from '../../factories/heroFactory';
import { ManaKind } from '../../types/Mana';
import { HeroUnitName } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';

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
        heroFactory(HeroUnitName.CLERIC, HeroUnitName.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.ENCHANTER, HeroUnitName.ENCHANTER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.DRUID, HeroUnitName.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.PYROMANCER, HeroUnitName.PYROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      // Set mana values above minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaKind.WHITE]: 1,
        [ManaKind.BLUE]: 1,
        [ManaKind.GREEN]: 1,
        [ManaKind.RED]: 1,
        [ManaKind.BLACK]: 1,
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
        heroFactory(HeroUnitName.CLERIC, HeroUnitName.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.DRUID, HeroUnitName.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      getTurnOwner(gameState).mana = {
        [ManaKind.WHITE]: 1,
        [ManaKind.BLUE]: 1,
        [ManaKind.GREEN]: 1,
        [ManaKind.RED]: 1,
        [ManaKind.BLACK]: 1,
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
        [ManaKind.WHITE]: getMinManaCost(ManaKind.WHITE) - 1,
        [ManaKind.BLUE]: getMinManaCost(ManaKind.BLUE) - 1,
        [ManaKind.GREEN]: getMinManaCost(ManaKind.GREEN) - 1,
        [ManaKind.RED]: getMinManaCost(ManaKind.RED) - 1,
        [ManaKind.BLACK]: getMinManaCost(ManaKind.BLACK) - 1,
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
        [ManaKind.WHITE]: getMinManaCost(ManaKind.WHITE) + 10,
        [ManaKind.BLUE]: getMinManaCost(ManaKind.BLUE) + 15,
        [ManaKind.GREEN]: getMinManaCost(ManaKind.GREEN) + 20,
        [ManaKind.RED]: getMinManaCost(ManaKind.RED) + 25,
        [ManaKind.BLACK]: getMinManaCost(ManaKind.BLACK) + 30,
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
        [ManaKind.WHITE]: 50, // Low mana
        [ManaKind.BLUE]: 100, // Medium mana
        [ManaKind.GREEN]: 200, // Max mana
        [ManaKind.RED]: getMinManaCost(ManaKind.RED) - 1, // Below threshold (won't render)
        [ManaKind.BLACK]: 150, // High mana
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
        heroFactory(HeroUnitName.CLERIC, HeroUnitName.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.ENCHANTER, HeroUnitName.ENCHANTER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.DRUID, HeroUnitName.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.PYROMANCER, HeroUnitName.PYROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      const humanPlayer = getTurnOwner(gameState);
      humanPlayer.mana = {
        [ManaKind.WHITE]: getMinManaCost(ManaKind.WHITE) + 10,
        [ManaKind.BLUE]: getMinManaCost(ManaKind.BLUE) + 15,
        [ManaKind.GREEN]: getMinManaCost(ManaKind.GREEN) + 20,
        [ManaKind.RED]: getMinManaCost(ManaKind.RED) + 25,
        [ManaKind.BLACK]: getMinManaCost(ManaKind.BLACK) + 30,
      };

      const { rerender } = renderVialPanelWithGameState(gameState);

      // Initially all vials should render
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();

      // Now set mana to undefined/null for some types and re-render
      // This tests the ManaVial component's null handling (should return null)
      humanPlayer.mana = {
        [ManaKind.WHITE]: getMinManaCost(ManaKind.WHITE) + 10,
        [ManaKind.BLUE]: undefined as any,
        [ManaKind.GREEN]: null as any,
        [ManaKind.RED]: getMinManaCost(ManaKind.RED) + 25,
        [ManaKind.BLACK]: 0, // Since hero exist vial should be rendered
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
        heroFactory(HeroUnitName.CLERIC, HeroUnitName.CLERIC),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.DRUID, HeroUnitName.DRUID),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
        gameState,
        getPlayerLands(gameState)[0].mapPos
      );

      getTurnOwner(gameState).mana = {
        [ManaKind.WHITE]: 1,
        [ManaKind.BLUE]: 1, // Won't render
        [ManaKind.GREEN]: 1,
        [ManaKind.RED]: 1, // Won't render
        [ManaKind.BLACK]: 1,
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
