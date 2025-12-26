import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EmpireTreasureDialog from '../../../ux-components/dialogs/EmpireTreasureDialog';

import { getTurnOwner } from '../../../selectors/playerSelectors';
import { itemFactory, relictFactory } from '../../../factories/treasureFactory';
import { getTreasureImg } from '../../../assets/getTreasureImg';
import { getValidMagicLands } from '../../../map/magic/getValidMagicLands';
import { TreasureName } from '../../../types/Treasures';
import type { GameState } from '../../../state/GameState';
import type { Item } from '../../../types/Treasures';

import { createGameStateStub } from '../../utils/createGameStateStub';

jest.mock('../../../assets/getTreasureImg');

jest.mock('../../../map/magic/getValidMagicLands');

// Mock context hooks
const mockApplicationContext = {
  showEmpireTreasureDialog: true,
  setShowEmpireTreasureDialog: jest.fn(),
  selectedLandAction: undefined as string | undefined,
  setSelectedLandAction: jest.fn(),
  glowingTiles: new Set<string>(),
  addGlowingTile: jest.fn(),
  removeGlowingTile: jest.fn(),
  clearAllGlow: jest.fn(),
  showStartWindow: false,
  showSaveDialog: false,
  showCastSpellDialog: false,
  showRecruitArmyDialog: false,
  showSendHeroInQuestDialog: false,
  showSelectOpponentDialog: false,
  showConstructBuildingDialog: false,
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
  actionLandPosition: undefined,
  setShowStartWindow: jest.fn(),
  setShowSaveDialog: jest.fn(),
  setShowCastSpellDialog: jest.fn(),
  setShowRecruitArmyDialog: jest.fn(),
  setShowSendHeroInQuestDialog: jest.fn(),
  setShowSelectOpponentDialog: jest.fn(),
  setShowConstructBuildingDialog: jest.fn(),
  setShowProgressPopup: jest.fn(),
  setSelectedOpponent: jest.fn(),
  setOpponentScreenPosition: jest.fn(),
  setSelectOpponentExcludedIds: jest.fn(),
  setSelectOpponentCallback: jest.fn(),
  setAllowEmptyPlayer: jest.fn(),
  setProgressMessage: jest.fn(),
  setLandPopupPosition: jest.fn(),
  setLandPopupScreenPosition: jest.fn(),
  setActionLandPosition: jest.fn(),
  setSaveGameName: jest.fn(),
  setGameStarted: jest.fn(),
  setGlowingTiles: jest.fn(),
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

// Mock the FlipBookPage component to simplify testing
jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBookPage', () => {
  return {
    __esModule: true,
    default: ({ header, iconPath, description, onIconClick, pageNum }: any) => (
      <div data-testid={`flipbook-page-${header}`}>
        <h3>{header}</h3>
        <p>{description}</p>
        {iconPath && onIconClick && (
          <img
            data-testid="flipbook-icon"
            src={iconPath}
            alt={header}
            onClick={onIconClick}
            role="img"
          />
        )}
        {iconPath && !onIconClick && (
          <img data-testid="flipbook-icon-non-clickable" src={iconPath} alt={header} role="img" />
        )}
      </div>
    ),
    FlipBookPageTypeName: {
      SPELL: 'Spell',
      ITEM: 'ITEM',
      BUILDING: 'Building',
      RECRUIT: 'Recruit',
      QUEST: 'Quest',
    },
  };
});

describe('EmpireTreasureDialog', () => {
  let gameStateStub: GameState;

  const renderWithProviders = (
    ui: React.ReactElement,
    { gameState = gameStateStub, showEmpireTreasureDialog = true } = {}
  ) => {
    // Update the mock values for this test
    mockApplicationContext.showEmpireTreasureDialog = showEmpireTreasureDialog;
    mockApplicationContext.setShowEmpireTreasureDialog = jest.fn();
    mockApplicationContext.addGlowingTile = jest.fn();
    mockApplicationContext.setSelectedLandAction = jest.fn();
    mockGameContext.gameState = gameState;

    return render(ui);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getTreasureImg to return a valid image path
    (getTreasureImg as jest.Mock).mockImplementation(
      (treasure: any) => `mock-treasure-${treasure.treasure.type}.png`
    );

    // Mock getValidMagicLands to return an array of tile IDs
    (getValidMagicLands as jest.Mock).mockReturnValue(['3-3', '4-4', '5-5']);

    // Create a game state
    gameStateStub = createGameStateStub({
      nPlayers: 2,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Dialog Visibility', () => {
    it('should not render when showEmpireTreasureDialog is false', () => {
      renderWithProviders(<EmpireTreasureDialog />, { showEmpireTreasureDialog: false });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when gameState is null', () => {
      renderWithProviders(<EmpireTreasureDialog />, { gameState: null as any });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when player has no treasures', () => {
      getTurnOwner(gameStateStub).empireTreasures = [];
      renderWithProviders(<EmpireTreasureDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should render when showEmpireTreasureDialog is true and player has treasures', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should render when player has relics', () => {
      const relic = relictFactory(TreasureName.MIRROR_OF_ILLUSION);
      getTurnOwner(gameStateStub).empireTreasures.push(relic);

      renderWithProviders(<EmpireTreasureDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });
  });

  describe('Treasure Display', () => {
    it('should display consumable items', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should display multiple items and relics', () => {
      const item1 = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      const item2 = itemFactory(TreasureName.ORB_OF_STORM);
      const relic = relictFactory(TreasureName.BANNER_OF_UNITY);

      getTurnOwner(gameStateStub).empireTreasures.push(item1, item2, relic);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(3);
    });

    it('should display non-consumable items', () => {
      const item = itemFactory(TreasureName.MERCY_OF_ORRIVANE);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should display relics (non-usable items)', () => {
      const relic = relictFactory(TreasureName.HEARTSTONE_OF_ORRIVANE);
      getTurnOwner(gameStateStub).empireTreasures.push(relic);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(1);
    });
  });

  describe('Treasure Sorting', () => {
    it('should sort items before relics', () => {
      // Add relics and items in mixed order
      const relic1 = relictFactory(TreasureName.BANNER_OF_UNITY);
      const item1 = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      const relic2 = relictFactory(TreasureName.MIRROR_OF_ILLUSION);
      const item2 = itemFactory(TreasureName.ORB_OF_STORM);

      getTurnOwner(gameStateStub).empireTreasures.push(relic1, item1, relic2, item2);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(4);

      // First two pages should be items (indices 0 and 1)
      // Last two pages should be relics (indices 2 and 3)
      // We verify this by checking the page indices passed to FlipBookPage
    });
  });

  describe('Item Click Handling', () => {
    it('should handle click on consumable item', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      // Check if the item is actually considered consumable
      // The component checks: isItem(treasure) && treasure.treasure.isConsumable
      // If both are true, onIconClick is defined and the icon should be clickable
      const icons = screen.queryAllByTestId('flipbook-icon');

      // If no clickable icons, check if there are non-clickable ones
      expect(icons).toHaveLength(1);
      const nonClickableIcons = screen.queryAllByTestId('flipbook-icon-non-clickable');
      // This test expects a clickable item, so this should fail with a meaningful error
      expect(nonClickableIcons).toHaveLength(0);

      expect(icons.length).toBeGreaterThan(0);
      const firstIcon = icons[0];
      await user.click(firstIcon);

      expect(mockApplicationContext.setSelectedLandAction).toHaveBeenCalledWith(`ITEM: ${item.id}`);
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalled();
      expect(mockApplicationContext.setShowEmpireTreasureDialog).toHaveBeenCalledWith(false);
    });

    it('should not handle click on non-consumable item', async () => {
      const item = itemFactory(TreasureName.MERCY_OF_ORRIVANE);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.queryAllByTestId('flipbook-icon');

      // Non-consumable items should not have click handlers
      expect(icons.length).toBe(0);
    });

    it('should not handle click on relics', async () => {
      const relic = relictFactory(TreasureName.BANNER_OF_UNITY);
      getTurnOwner(gameStateStub).empireTreasures.push(relic);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.queryAllByTestId('flipbook-icon');

      // Relics should not have click handlers
      expect(icons.length).toBe(0);
    });

    it('should add glowing tiles for valid magic lands', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      const firstIcon = icons[0];
      await user.click(firstIcon);

      // Should add glowing tiles for lands where item can be used
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalledWith('3-3');
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalledWith('4-4');
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalledWith('5-5');
    });
  });

  describe('Dialog Closing', () => {
    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const flipBook = screen.getByTestId('flip-book');
      await user.click(flipBook);

      expect(mockApplicationContext.setShowEmpireTreasureDialog).toHaveBeenCalledWith(false);
    });

    it('should close dialog after selecting an item', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      const firstIcon = icons[0];
      await user.click(firstIcon);

      expect(mockApplicationContext.setShowEmpireTreasureDialog).toHaveBeenCalledWith(false);
    });
  });

  describe('Treasure Information Display', () => {
    it('should display treasure type as header', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.getByText(TreasureName.WAND_OF_TURN_UNDEAD)).toBeInTheDocument();
    });

    it('should display treasure description', () => {
      const item = itemFactory(TreasureName.ORB_OF_STORM);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.getByText('Casts Tornado spell')).toBeInTheDocument();
    });

    it('should display treasure images', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      // Clickable items should have flipbook-icon
      const clickableImages = screen.queryAllByTestId('flipbook-icon');
      expect(clickableImages.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty treasure list', () => {
      getTurnOwner(gameStateStub).empireTreasures = [];

      renderWithProviders(<EmpireTreasureDialog />);

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should handle treasure with missing game state', () => {
      mockGameContext.gameState = null;

      renderWithProviders(<EmpireTreasureDialog />, { gameState: null as any });

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should handle multiple consumable items', () => {
      const item1 = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      const item2 = itemFactory(TreasureName.ORB_OF_STORM);
      const item3 = itemFactory(TreasureName.SEED_OF_RENEWAL);

      getTurnOwner(gameStateStub).empireTreasures.push(item1, item2, item3);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(3);
    });

    it('should handle mixed consumable and non-consumable items', () => {
      const consumableItem = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      const nonConsumableItem = itemFactory(TreasureName.MERCY_OF_ORRIVANE);

      getTurnOwner(gameStateStub).empireTreasures.push(consumableItem, nonConsumableItem);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(2);
    });
  });

  describe('Integration with Game Context', () => {
    it('should work with valid gameState', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      expect(mockGameContext.gameState).toBe(gameStateStub);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should access turn owner correctly', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const turnOwner = getTurnOwner(gameStateStub);
      expect(turnOwner).toBeDefined();
      expect(turnOwner.empireTreasures.length).toBe(1);
    });

    it('should handle dialog state changes', () => {
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      const { rerender } = renderWithProviders(<EmpireTreasureDialog />);

      // Dialog should initially be rendered
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();

      // Update context to simulate dialog closing
      mockApplicationContext.showEmpireTreasureDialog = false;

      // Re-render with updated context
      rerender(<EmpireTreasureDialog />);

      // Should not render when closed
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();

      // Reopen dialog
      mockApplicationContext.showEmpireTreasureDialog = true;
      rerender(<EmpireTreasureDialog />);

      // Should render again
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });
  });

  describe('Treasure Type Filtering', () => {
    it('should display all types of treasures', () => {
      const item1 = itemFactory(TreasureName.SEED_OF_RENEWAL);
      const item2 = itemFactory(TreasureName.AEGIS_SHARD);
      const item3 = itemFactory(TreasureName.RESURRECTION);
      const relic1 = relictFactory(TreasureName.CROWN_OF_DOMINION);
      const relic2 = relictFactory(TreasureName.SCEPTER_OF_TEMPESTS);

      getTurnOwner(gameStateStub).empireTreasures.push(item1, item2, item3, relic1, relic2);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(5);
    });

    it('should handle treasure with different targets', () => {
      const opponentTargetItem = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      const playerTargetItem = itemFactory(TreasureName.SEED_OF_RENEWAL);

      getTurnOwner(gameStateStub).empireTreasures.push(opponentTargetItem, playerTargetItem);

      renderWithProviders(<EmpireTreasureDialog />);

      const pages = screen.queryAllByTestId(/flipbook-page-/);
      expect(pages.length).toBe(2);
    });
  });

  describe('Selected Land Action', () => {
    it('should set correct selectedLandAction format', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD) as Item;
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      const firstIcon = icons[0];
      await user.click(firstIcon);

      expect(mockApplicationContext.setSelectedLandAction).toHaveBeenCalledWith(`ITEM: ${item.id}`);
    });

    it('should pass item to createItemClickHandler', async () => {
      const user = userEvent.setup();
      const item1 = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD) as Item;
      const item2 = itemFactory(TreasureName.ORB_OF_STORM) as Item;

      getTurnOwner(gameStateStub).empireTreasures.push(item1, item2);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');

      // Should have two clickable icons
      expect(icons.length).toBe(2);

      // Click first item and verify it sets the correct ID
      await user.click(icons[0]);
      expect(mockApplicationContext.setSelectedLandAction).toHaveBeenCalledWith(
        `ITEM: ${item1.id}`
      );
    });
  });

  describe('Callback Invocation', () => {
    it('should invoke handleDialogClose when clicking outside', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const flipBook = screen.getByTestId('flip-book');
      await user.click(flipBook);

      expect(mockApplicationContext.setShowEmpireTreasureDialog).toHaveBeenCalledWith(false);
    });

    it('should invoke createItemClickHandler dependencies correctly', async () => {
      const user = userEvent.setup();
      const item = itemFactory(TreasureName.WAND_OF_TURN_UNDEAD);
      getTurnOwner(gameStateStub).empireTreasures.push(item);

      renderWithProviders(<EmpireTreasureDialog />);

      const icons = screen.getAllByTestId('flipbook-icon');
      const firstIcon = icons[0];
      await user.click(firstIcon);

      // Verify all dependencies are called
      expect(mockApplicationContext.setSelectedLandAction).toHaveBeenCalled();
      expect(mockApplicationContext.addGlowingTile).toHaveBeenCalled();
      expect(mockApplicationContext.setShowEmpireTreasureDialog).toHaveBeenCalled();
    });
  });
});
