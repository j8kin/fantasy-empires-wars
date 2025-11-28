import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import VialPanel from '../../ux-components/vial-panel/VialPanel';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { nextPlayer } from '../../systems/playerActions';

import { ManaType } from '../../types/Mana';
import { getMinManaCost } from '../../types/Spell';
import { createGameStateStub } from '../utils/createGameStateStub';

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
    <GameProvider>
      <TestVialPanelWrapper gameState={gameState} />
    </GameProvider>
  );
};

describe('VialPanel Integration Test', () => {
  let gameState: GameState;
  beforeEach(() => {
    gameState = createGameStateStub({ nPlayers: 2 });
  });

  describe('Human player scenarios', () => {
    it('should render mana vials for human player with sufficient mana', () => {
      // Set mana values above minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10,
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) + 15,
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) + 20,
        [ManaType.RED]: getMinManaCost(ManaType.RED) + 25,
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) + 30,
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
      // Set only some mana types above minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10, // Above threshold
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) - 5, // Below threshold
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) + 20, // Above threshold
        [ManaType.RED]: getMinManaCost(ManaType.RED) - 10, // Below threshold
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) + 30, // Above threshold
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

    it('should handle edge case when mana is exactly at minimum threshold', () => {
      // Set mana exactly at minimum thresholds
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE), // Exactly at threshold (won't render)
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) + 1, // Just above threshold (will render)
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN),
        [ManaType.RED]: getMinManaCost(ManaType.RED),
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK),
      };

      renderVialPanelWithGameState(gameState);

      // Only blue mana vial should render as it's the only one above threshold
      expect(screen.queryByTestId('white-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('blue-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('green-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('red-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('black-filled-mana-vial')).not.toBeInTheDocument();
    });

    it('should handle null/undefined mana values gracefully', () => {
      // Set mana to undefined/null to test ManaVial null handling
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
        [ManaType.BLACK]: 0, // This will be below threshold
      };

      rerender(
        <GameProvider>
          <TestVialPanelWrapper gameState={gameState} />
        </GameProvider>
      );

      // Only white and red vials should render
      expect(screen.getByTestId('white-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('blue-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.queryByTestId('green-filled-mana-vial')).not.toBeInTheDocument();
      expect(screen.getByTestId('red-filled-mana-vial')).toBeInTheDocument();
      expect(screen.queryByTestId('black-filled-mana-vial')).not.toBeInTheDocument();
    });
  });

  describe('Component structure and styling', () => {
    it('should render with correct CSS classes and structure', () => {
      getTurnOwner(gameState).mana = {
        [ManaType.WHITE]: getMinManaCost(ManaType.WHITE) + 10,
        [ManaType.BLUE]: getMinManaCost(ManaType.BLUE) - 1, // Won't render
        [ManaType.GREEN]: getMinManaCost(ManaType.GREEN) + 20,
        [ManaType.RED]: getMinManaCost(ManaType.RED) - 1, // Won't render
        [ManaType.BLACK]: getMinManaCost(ManaType.BLACK) + 30,
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
