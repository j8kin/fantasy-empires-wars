import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';

import VialPanel from '../../ux-components/vial-panel/VialPanel';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { getMinManaCost } from '../../selectors/spellSelectors';
import { nextPlayer } from '../../systems/playerActions';
import { heroFactory } from '../../factories/heroFactory';
import { Mana, ManaType } from '../../types/Mana';
import { HeroUnitName } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';

import { createGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

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

  const checkVialVisibility = (manaVisibilities: Record<ManaType, boolean>) => {
    Object.entries(manaVisibilities).forEach(([manaType, isVisible]) => {
      const vial = screen.getByTestId(`${manaType}-filled-mana-vial`);
      expect(vial).toBeInTheDocument();
      isVisible ? expect(vial).toBeVisible() : expect(vial).not.toBeVisible();
      expect(screen.getByAltText(`${manaType} mana vial`)).toBeInTheDocument();
    });
  };

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
        [Mana.WHITE]: 1,
        [Mana.BLUE]: 1,
        [Mana.GREEN]: 1,
        [Mana.RED]: 1,
        [Mana.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that all mana vials are rendered
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: true,
        [Mana.GREEN]: true,
        [Mana.RED]: true,
        [Mana.BLACK]: true,
      });
    });

    it('should render no vials when all mana is below minimum thresholds', () => {
      // Set all mana types below minimum thresholds
      getTurnOwner(gameState).mana = {
        [Mana.WHITE]: getMinManaCost(Mana.WHITE) - 1,
        [Mana.BLUE]: getMinManaCost(Mana.BLUE) - 1,
        [Mana.GREEN]: getMinManaCost(Mana.GREEN) - 1,
        [Mana.RED]: getMinManaCost(Mana.RED) - 1,
        [Mana.BLACK]: getMinManaCost(Mana.BLACK) - 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that no mana vials are visible
      checkVialVisibility({
        [Mana.WHITE]: false,
        [Mana.BLUE]: false,
        [Mana.GREEN]: false,
        [Mana.RED]: false,
        [Mana.BLACK]: false,
      });
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
        [Mana.WHITE]: 1,
        [Mana.BLUE]: 1,
        [Mana.GREEN]: 1,
        [Mana.RED]: 1,
        [Mana.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that only sufficient mana vials are visible
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: false,
        [Mana.GREEN]: true,
        [Mana.RED]: false,
        [Mana.BLACK]: true,
      });
    });
  });

  describe('AI player scenarios', () => {
    it('should not render for AI player turn', () => {
      nextPlayer(gameState); // Switch to AI player
      // Set mana values above minimum thresholds for AI player
      getTurnOwner(gameState).mana = {
        [Mana.WHITE]: getMinManaCost(Mana.WHITE) + 10,
        [Mana.BLUE]: getMinManaCost(Mana.BLUE) + 15,
        [Mana.GREEN]: getMinManaCost(Mana.GREEN) + 20,
        [Mana.RED]: getMinManaCost(Mana.RED) + 25,
        [Mana.BLACK]: getMinManaCost(Mana.BLACK) + 30,
      };

      renderVialPanelWithGameState(gameState);

      // Check that no mana vials are visible for AI player
      checkVialVisibility({
        [Mana.WHITE]: false,
        [Mana.BLUE]: false,
        [Mana.GREEN]: false,
        [Mana.RED]: false,
        [Mana.BLACK]: false,
      });
    });
  });

  describe('ManaVial component integration', () => {
    it('should properly render ManaVial with different mana amounts', () => {
      // Set specific mana amounts to test ManaVial rendering
      getTurnOwner(gameState).mana = {
        [Mana.WHITE]: 50, // Low mana
        [Mana.BLUE]: 100, // Medium mana
        [Mana.GREEN]: 200, // Max mana
        [Mana.RED]: getMinManaCost(Mana.RED) - 1, // Below threshold (won't render)
        [Mana.BLACK]: 150, // High mana
      };

      renderVialPanelWithGameState(gameState);

      // Check that ManaVials render with proper styling
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: true,
        [Mana.GREEN]: true,
        [Mana.RED]: false, // Red mana vial should not be visible as it's below a threshold
        [Mana.BLACK]: true,
      });
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
        [Mana.WHITE]: getMinManaCost(Mana.WHITE) + 10,
        [Mana.BLUE]: getMinManaCost(Mana.BLUE) + 15,
        [Mana.GREEN]: getMinManaCost(Mana.GREEN) + 20,
        [Mana.RED]: getMinManaCost(Mana.RED) + 25,
        [Mana.BLACK]: getMinManaCost(Mana.BLACK) + 30,
      };

      const { rerender } = renderVialPanelWithGameState(gameState);

      // Initially all vials should render
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: true,
        [Mana.GREEN]: true,
        [Mana.RED]: true,
        [Mana.BLACK]: true,
      });

      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();

      // Now set mana to undefined/null for some types and re-render
      // This tests the ManaVial component's null handling (should return null)
      humanPlayer.mana = {
        [Mana.WHITE]: getMinManaCost(Mana.WHITE) + 10,
        [Mana.BLUE]: undefined as any,
        [Mana.GREEN]: null as any,
        [Mana.RED]: getMinManaCost(Mana.RED) + 25,
        [Mana.BLACK]: 0, // Since hero exist vial should be rendered
      };

      rerender(
        <ApplicationContextProvider>
          <GameProvider>
            <TestVialPanelWrapper gameState={gameState} />
          </GameProvider>
        </ApplicationContextProvider>
      );

      // Only white and red vials should render
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: false,
        [Mana.GREEN]: false,
        [Mana.RED]: true,
        [Mana.BLACK]: false,
      });
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
        [Mana.WHITE]: 1,
        [Mana.BLUE]: 1, // Won't render
        [Mana.GREEN]: 1,
        [Mana.RED]: 1, // Won't render
        [Mana.BLACK]: 1,
      };

      renderVialPanelWithGameState(gameState);

      // Check that ManaVial components have correct structure using accessible queries
      const vialContainers = screen.getAllByTestId(/filled-mana-vial$/i);
      expect(vialContainers).toHaveLength(5); // Only 3 should render

      // Check for images by their accessible name (alt text)
      const vialImages = screen.getAllByRole('img', { name: /mana vial/i });
      expect(vialImages).toHaveLength(3);

      // Verify that the mana vials are rendered correctly
      checkVialVisibility({
        [Mana.WHITE]: true,
        [Mana.BLUE]: false,
        [Mana.GREEN]: true,
        [Mana.RED]: false,
        [Mana.BLACK]: true,
      });
    });
  });
});
