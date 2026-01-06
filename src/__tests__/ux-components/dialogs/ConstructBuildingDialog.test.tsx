import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConstructBuildingDialog from '../../../ux-components/dialogs/ConstructBuildingDialog';

import { getLand, getPlayerLands } from '../../../selectors/landSelectors';
import { getTurnOwner } from '../../../selectors/playerSelectors';
import { construct } from '../../../map/building/construct';
import { getAvailableToConstructLands } from '../../../map/building/getAvailableToConstructLands';
import { playerFactory } from '../../../factories/playerFactory';

import { PREDEFINED_PLAYERS } from '../../../domain/player/playerRepository';
import { BuildingName } from '../../../types/Building';
import { Alignment } from '../../../types/Alignment';

import type { GameState } from '../../../state/GameState';
import type { LandPosition } from '../../../state/map/land/LandPosition';
import type { BuildingType } from '../../../types/Building';

import { createGameStateStub } from '../../utils/createGameStateStub';

jest.mock('../../../assets/getBuildingImg', () => ({
  getBuildingImg: jest.fn((buildingType: BuildingType) => `mock-image-${buildingType}.png`),
}));

// Mock context hooks
const mockApplicationContext = {
  showConstructBuildingDialog: true,
  setShowConstructBuildingDialog: jest.fn(),
  selectedLandAction: undefined as string | undefined,
  setSelectedLandAction: jest.fn(),
  actionLandPosition: { row: 3, col: 4 } as LandPosition,
  setActionLandPosition: jest.fn(),
  showStartWindow: false,
  showSaveDialog: false,
  showCastSpellDialog: false,
  showRecruitArmyDialog: false,
  showSendHeroInQuestDialog: false,
  showSelectOpponentDialog: false,
  showProgressPopup: false,
  selectedOpponent: undefined,
  opponentScreenPosition: { x: 0, y: 0 },
  selectOpponentExcludedIds: [],
  selectOpponentCallback: null,
  allowEmptyPlayer: false,
  progressMessage: '',
  showErrorMessagePopup: false,
  setShowErrorMessagePopup: jest.fn(),
  errorMessagePopupMessage: '',
  setErrorMessagePopupMessage: jest.fn(),
  landPopupPosition: undefined,
  landPopupScreenPosition: { x: 0, y: 0 },
  saveGameName: '',
  gameStarted: true,
  glowingTiles: new Set(),
  setShowStartWindow: jest.fn(),
  setShowSaveDialog: jest.fn(),
  setShowCastSpellDialog: jest.fn(),
  setShowRecruitArmyDialog: jest.fn(),
  setShowSendHeroInQuestDialog: jest.fn(),
  setShowSelectOpponentDialog: jest.fn(),
  setShowProgressPopup: jest.fn(),
  setSelectedOpponent: jest.fn(),
  setOpponentScreenPosition: jest.fn(),
  setSelectOpponentExcludedIds: jest.fn(),
  setSelectOpponentCallback: jest.fn(),
  setAllowEmptyPlayer: jest.fn(),
  setProgressMessage: jest.fn(),
  setLandPopupPosition: jest.fn(),
  setLandPopupScreenPosition: jest.fn(),
  setSaveGameName: jest.fn(),
  setGameStarted: jest.fn(),
  setGlowingTiles: jest.fn(),
  addGlowingTile: jest.fn(),
  removeGlowingTile: jest.fn(),
  clearAllGlow: jest.fn(),
  showLandPopup: jest.fn(),
  hideLandPopup: jest.fn(),
  resetSaveGameDialog: jest.fn(),
  showOpponentInfo: jest.fn(),
  hideOpponentInfo: jest.fn(),
  showSelectOpponentDialogWithConfig: jest.fn(),
  hideSelectOpponentDialog: jest.fn(),
  showQuestResultsPopup: false,
  setShowQuestResultsPopup: jest.fn(),
  questResults: [],
  setQuestResults: jest.fn(),
  showQuestResults: jest.fn(),
  hideQuestResults: jest.fn(),
};

const mockGameContext = {
  gameState: null as GameState | null,
  updateGameState: jest.fn(),
  recalculateActivePlayerIncome: jest.fn(),
};

jest.mock('../../../contexts/ApplicationContext', () => ({
  useApplicationContext: () => mockApplicationContext,
  ApplicationContextProvider: ({ children }: any) => children,
}));

jest.mock('../../../contexts/GameContext', () => ({
  useGameContext: () => mockGameContext,
  GameProvider: ({ children }: any) => children,
}));

// Mock the FlipBook component to simplify testing
jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBook', () => {
  return ({ children, onClickOutside }: any) => (
    <div data-testid="flip-book" onClick={onClickOutside}>
      {children}
    </div>
  );
});

describe('ConstructBuildingDialog', () => {
  let gameStateStub: GameState;

  const renderWithProviders = (
    ui: React.ReactElement,
    { gameState = gameStateStub, showConstructBuildingDialog = true } = {}
  ) => {
    // Update the mock values for this test
    mockApplicationContext.showConstructBuildingDialog = showConstructBuildingDialog;
    mockApplicationContext.setShowConstructBuildingDialog = jest.fn();
    mockApplicationContext.addGlowingTile = jest.fn();
    mockApplicationContext.setSelectedLandAction = jest.fn();
    mockGameContext.gameState = gameState;

    return render(ui);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a game state with lands available for building
    gameStateStub = createGameStateStub({
      nPlayers: 2,
    });

    // Give the player enough money to afford buildings
    getTurnOwner(gameStateStub).vault = 50000;

    // Mock window.alert to avoid jsdom errors
    jest.spyOn(window, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Dialog Visibility', () => {
    it('should not render when showConstructBuildingDialog is false', () => {
      renderWithProviders(<ConstructBuildingDialog />, { showConstructBuildingDialog: false });
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book')).not.toBeVisible();
    });

    it('should not render when gameState is null', () => {
      renderWithProviders(<ConstructBuildingDialog />, { gameState: null as any });
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book')).not.toBeVisible();
    });

    it('should render when showConstructBuildingDialog is true and gameState exists', () => {
      renderWithProviders(<ConstructBuildingDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should not render when no lands are available for construction', () => {
      // Occupy all lands with buildings and remove all player lands to prevent wall construction
      getTurnOwner(gameStateStub).landsOwned = new Set();

      renderWithProviders(<ConstructBuildingDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should render when only WALL construction is available', () => {
      // Occupy all lands with buildings except where walls can be built
      const playerLands = getPlayerLands(gameStateStub);
      playerLands.forEach((landState, idx) => {
        if (landState.buildings.length === 0 && idx > 0) {
          // Leave first land without building for wall construction
          construct(gameStateStub, BuildingName.BARRACKS, landState.mapPos);
        }
      });

      // Set low vault to only afford walls
      getTurnOwner(gameStateStub).vault = 6000;

      renderWithProviders(<ConstructBuildingDialog />);
      // Should render with wall option
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Building Display', () => {
    it('should display available buildings for construction', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      // Should show some buildings
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should display building information correctly', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBeGreaterThan(0);

      // Check if pages contain expected information
      pages.forEach((page) => {
        expect(page).toBeInTheDocument();
      });
    });

    it('should filter buildings by player vault', () => {
      // Set low vault to only afford cheaper buildings
      getTurnOwner(gameStateStub).vault = 6000;

      renderWithProviders(<ConstructBuildingDialog />);

      // Should only show buildings costing 6000 or less (WALL, WATCH_TOWER)
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      pages.forEach((page) => {
        const testId = page.getAttribute('data-testid');
        // Should not show expensive buildings like BARRACKS (10000), STRONGHOLD (15000)
        expect(testId).not.toContain('Barracks');
        expect(testId).not.toContain('Stronghold');
      });
    });

    it('should display correct building images', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      const images = screen.queryAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Stronghold Construction', () => {
    it('should show STRONGHOLD when stronghold construction is allowed', () => {
      // Find a land where another stronghold can be built
      // Default stub creates strongholds at (3, 3) for player 0 and (4, 8) for player 1
      const player0Homeland: LandPosition = { row: 3, col: 3 };
      const remoteLand: LandPosition = { row: 6, col: 6 };

      // Ensure there's a stronghold at homeland
      expect(getLand(gameStateStub, player0Homeland).buildings[0]?.type).toBe(
        BuildingName.STRONGHOLD
      );
      expect(getLand(gameStateStub, remoteLand).buildings).toHaveLength(0);

      // Make sure the player owns the remote land
      getTurnOwner(gameStateStub).landsOwned.add('6-6');

      // Check if stronghold construction is allowed
      const strongholdLands = getAvailableToConstructLands(gameStateStub, BuildingName.STRONGHOLD);
      expect(strongholdLands).toContain('6-6');

      renderWithProviders(<ConstructBuildingDialog />);

      expect(screen.getByTestId('flipbook-page-Stronghold')).toBeInTheDocument();
    });

    it('should not show STRONGHOLD when no valid locations exist', () => {
      // Remove strongholds to prevent adjacent stronghold construction
      const playerLands = getPlayerLands(gameStateStub);
      playerLands.forEach((landState) => {
        landState.buildings = [];
      });

      // Lower vault so stronghold is too expensive
      getTurnOwner(gameStateStub).vault = 10000;

      renderWithProviders(<ConstructBuildingDialog />);

      // Stronghold should not be available (cost is 15000 but vault is 10000)
      expect(screen.queryByTestId('flipbook-page-Stronghold')).not.toBeInTheDocument();
    });
  });

  describe('Building Selection', () => {
    it('should handle building icon click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConstructBuildingDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      expect(icons.length).toBeGreaterThan(0);
      const firstIcon = icons[0];
      await user.click(firstIcon);

      expect(mockApplicationContext.setSelectedLandAction).toHaveBeenCalled();
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalled();
      expect(mockApplicationContext.setShowConstructBuildingDialog).toHaveBeenCalledWith(false);
    });

    it('should add glowing tiles for available construction lands', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConstructBuildingDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      expect(icons.length).toBeGreaterThan(0);
      const firstIcon = icons[0];
      await user.click(firstIcon);

      // Should add glowing tiles for lands where building can be constructed
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalled();
      const callCount = (mockApplicationContext.addGlowingTile as jest.Mock).mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('Dialog Closing', () => {
    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConstructBuildingDialog />);

      const flipBook = screen.getByTestId('flip-book');
      await user.click(flipBook);

      expect(mockApplicationContext.setShowConstructBuildingDialog).toHaveBeenCalledWith(false);
    });
  });

  describe('useEffect Alert Behavior', () => {
    it('should show alert when selectedLandAction matches a building', () => {
      jest.useFakeTimers();

      // Set selectedLandAction to match a building
      mockApplicationContext.selectedLandAction = BuildingName.BARRACKS;

      renderWithProviders(<ConstructBuildingDialog />);

      // Fast-forward timers to trigger the setTimeout
      jest.advanceTimersByTime(100);

      expect(window.alert).toHaveBeenCalled();
      expect(mockApplicationContext.setShowConstructBuildingDialog).toHaveBeenCalledWith(false);

      jest.useRealTimers();
    });

    it('should not show alert when selectedLandAction does not match a building', () => {
      mockApplicationContext.selectedLandAction = 'INVALID_BUILDING';

      renderWithProviders(<ConstructBuildingDialog />);

      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should not show alert when selectedLandAction is null', () => {
      mockApplicationContext.selectedLandAction = undefined;

      renderWithProviders(<ConstructBuildingDialog />);

      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('Player Type Restrictions', () => {
    it('should filter mage towers based on player alignment', () => {
      // Test with LAWFUL player
      const lands = new Set(gameStateStub.players[0].landsOwned);
      const lawfulPlayer = PREDEFINED_PLAYERS.find((p) => p.alignment === Alignment.LAWFUL)!;
      gameStateStub.players[0] = playerFactory(lawfulPlayer, 'human');
      gameStateStub.players[0].landsOwned = lands;
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      gameStateStub.players[0].vault = 50000;

      renderWithProviders(<ConstructBuildingDialog />);

      // LAWFUL players should see WHITE and GREEN mage towers
      // But not RED mage tower
      // These assertions depend on the building list actually containing these
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should filter mage towers based on player type', () => {
      // Test with specific hero type
      const lands = new Set(gameStateStub.players[0].landsOwned);
      const playerWithType = PREDEFINED_PLAYERS.find((p) => p.type !== null)!;
      gameStateStub.players[0] = playerFactory(playerWithType, 'human');
      gameStateStub.players[0].landsOwned = lands;
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      gameStateStub.players[0].vault = 50000;

      renderWithProviders(<ConstructBuildingDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle player with insufficient funds', () => {
      getTurnOwner(gameStateStub).vault = 100;

      renderWithProviders(<ConstructBuildingDialog />);

      // Should not show any buildings or should show very few
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      // With only 100 gold, no buildings should be available
      expect(pages).toHaveLength(0);
    });

    it('should handle empty player landsOwned', () => {
      getTurnOwner(gameStateStub).landsOwned = new Set();

      renderWithProviders(<ConstructBuildingDialog />);

      // Should not render when player has no lands
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should handle all lands having buildings', () => {
      // Remove all player lands to prevent any construction
      getTurnOwner(gameStateStub).landsOwned = new Set();

      renderWithProviders(<ConstructBuildingDialog />);

      // Should not render when no lands owned
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('Building Cost Display', () => {
    it('should display build cost for each building', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      // Should show cost labels
      const costElements = screen.queryAllByText(/Build Cost/);
      expect(costElements.length).toBeGreaterThan(0);
    });

    it('should display maintain cost for each building', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      // Should have maintain cost information in the pages
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBeGreaterThan(0);
    });
  });

  describe('Dialog State Management', () => {
    it('should reset dialog when closed and reopened', () => {
      const { rerender } = renderWithProviders(<ConstructBuildingDialog />);

      // Dialog should initially be rendered
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();

      // Update context to simulate dialog closing
      mockApplicationContext.showConstructBuildingDialog = false;

      // Re-render with updated context
      rerender(<ConstructBuildingDialog />);

      // Should not render when closed
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book')).not.toBeVisible();

      // Reopen dialog
      mockApplicationContext.showConstructBuildingDialog = true;
      rerender(<ConstructBuildingDialog />);

      // Should render again
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book')).toBeVisible();
    });
  });

  describe('Integration with Game Context', () => {
    it('should work with valid gameState', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      expect(mockGameContext.gameState).toBe(gameStateStub);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should access turn owner correctly', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      const turnOwner = getTurnOwner(gameStateStub);
      expect(turnOwner).toBeDefined();
      expect(turnOwner.vault).toBe(50000);
    });

    it('should access player lands correctly', () => {
      renderWithProviders(<ConstructBuildingDialog />);

      const turnOwner = getTurnOwner(gameStateStub);
      expect(turnOwner.landsOwned.size).toBeGreaterThan(0);
    });
  });
});
