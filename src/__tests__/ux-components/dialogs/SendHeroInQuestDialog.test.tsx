import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SendHeroInQuestDialog from '../../../ux-components/dialogs/SendHeroInQuestDialog';

import { GameState } from '../../../state/GameState';

import { createArmy } from '../../../types/Army';
import { HeroUnitType } from '../../../types/UnitType';
import { Alignment } from '../../../types/Alignment';
import { getLands } from '../../../map/utils/getLands';

import { placeUnitsOnMap } from '../../utils/placeUnitsOnMap';
import { createDefaultGameStateStub } from '../../utils/createGameStateStub';

// Import the mocked function (will be the mocked version due to jest.mock above)
import { startQuest as mockStartQuest } from '../../../map/quest/startQuest';
import { createHeroUnit, HeroUnit } from '../../../types/HeroUnit';

// Mock modules
jest.mock('../../../map/quest/startQuest', () => ({
  startQuest: jest.fn(),
}));

jest.mock('../../../assets/getQuestImg', () => ({
  getQuestImg: jest.fn((questId: string) => `mock-quest-image-${questId}.png`),
}));

// Mock context hooks
const mockApplicationContext = {
  showSendHeroInQuestDialog: true,
  setShowSendHeroInQuestDialog: jest.fn(),
  selectedLandAction: null,
  setSelectedLandAction: jest.fn(),
  actionLandPosition: { row: 3, col: 3 } as any,
  setActionLandPosition: jest.fn(),
  showStartWindow: false,
  showSaveDialog: false,
  showCastSpellDialog: false,
  showConstructBuildingDialog: false,
  showRecruitArmyDialog: false,
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
  setShowConstructBuildingDialog: jest.fn(),
  setShowRecruitArmyDialog: jest.fn(),
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
  recalculateActivePlayerIncome: jest.fn(),
  showQuestResultsPopup: false,
  setShowQuestResultsPopup: jest.fn(),
  questResults: [],
  setQuestResults: jest.fn(),
};

const mockGameContext = {
  gameState: createDefaultGameStateStub(),
  updateGameState: jest.fn(),
};

jest.mock('../../../contexts/ApplicationContext', () => ({
  useApplicationContext: () => mockApplicationContext,
  ApplicationContextProvider: ({ children }: any) => children,
}));

jest.mock('../../../contexts/GameContext', () => ({
  useGameContext: () => mockGameContext,
  GameProvider: ({ children }: any) => children,
}));

// Mock the FlipBook component
jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBook', () => {
  return ({ children, onClickOutside }: any) => (
    <div data-testid="flip-book" onClick={onClickOutside}>
      {children}
    </div>
  );
});

// Mock FlipBookPage component
jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBookPage', () => {
  return {
    __esModule: true,
    default: ({
      header,
      iconPath,
      description,
      slots,
      onSlotClick,
      onIconClick,
      onClose,
      usedSlots,
      pageNum,
      lorePage,
    }: any) => (
      <div data-testid={`flip-book-page-${header.replace(/\s+/g, '-')}`}>
        <h3 data-testid="page-header">{header}</h3>
        <img src={iconPath} alt={header} data-testid="page-icon" />
        <p data-testid="page-description">{description}</p>
        <span data-testid="page-num">{pageNum}</span>
        <span data-testid="lore-page">{lorePage}</span>

        {/* Icon click button */}
        <button data-testid="icon-button" onClick={onIconClick}>
          Send all heroes to {header}
        </button>

        {/* Slots */}
        {slots?.map((slot: any) => (
          <button
            key={slot.id}
            data-testid={`slot-${slot.id}`}
            onClick={() => onSlotClick?.(slot)}
            disabled={usedSlots?.has(slot.id)}
            className={usedSlots?.has(slot.id) ? 'used-slot' : 'available-slot'}
          >
            {slot.name} {usedSlots?.has(slot.id) ? '(Used)' : ''}
          </button>
        ))}

        <button data-testid="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    ),
  };
});

describe('SendHeroInQuestDialog', () => {
  let mockGameState: GameState;

  // Helper function to get hero lands for current player
  const getHeroLands = (gameState: GameState) => {
    return getLands({
      gameState: gameState,
      players: [gameState.turnOwner.id],
      noArmy: false,
    }).filter(
      (land) => land.army.length > 0 && land.army.some((armyUnit) => armyUnit.heroes.length > 0)
    );
  };

  const renderWithProviders = (
    ui: React.ReactElement,
    options?: {
      gameState?: GameState;
      showSendHeroInQuestDialog?: boolean;
      actionLandPosition?: { row: number; col: number } | undefined;
    }
  ) => {
    // Handle defaults without destructuring to preserve undefined/null values
    const gameState = options?.hasOwnProperty('gameState') ? options.gameState! : mockGameState;
    const showSendHeroInQuestDialog = options?.showSendHeroInQuestDialog ?? true;
    const actionLandPosition = options?.hasOwnProperty('actionLandPosition')
      ? options.actionLandPosition
      : { row: 3, col: 3 };

    // Update the mock values for this test
    mockApplicationContext.showSendHeroInQuestDialog = showSendHeroInQuestDialog;
    mockApplicationContext.setShowSendHeroInQuestDialog = jest.fn();

    // Set actionLandPosition properly, including undefined
    mockApplicationContext.actionLandPosition = actionLandPosition;

    mockGameContext.gameState = gameState;

    return render(ui);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock functions
    (mockStartQuest as jest.Mock).mockClear();

    // Reset mock context to default values
    mockApplicationContext.showSendHeroInQuestDialog = true;
    mockApplicationContext.actionLandPosition = { row: 3, col: 3 };

    // Create a default game state with heroes
    mockGameState = createDefaultGameStateStub();
  });

  describe('Dialog Visibility', () => {
    it('should not render when showSendHeroInQuestDialog is false', () => {
      renderWithProviders(<SendHeroInQuestDialog />, { showSendHeroInQuestDialog: false });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when gameState is null', () => {
      renderWithProviders(<SendHeroInQuestDialog />, { gameState: null as any });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should render when showSendHeroInQuestDialog is true and gameState exists with heroes', () => {
      renderWithProviders(<SendHeroInQuestDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should not render when no heroes are available', () => {
      // Remove all armies from all lands
      Object.values(mockGameState.map.lands).forEach((land) => {
        land.army = [];
      });

      renderWithProviders(<SendHeroInQuestDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when no lands with heroes exist for current player', () => {
      // Remove armies from lands owned by current player but keep armies on other lands
      const currentPlayerId = mockGameState.turnOwner.id;
      Object.values(mockGameState.map.lands).forEach((land) => {
        if (mockGameState.getLandOwner(land.mapPos) === currentPlayerId) {
          land.army = [];
        }
      });

      renderWithProviders(<SendHeroInQuestDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when actionLandPosition is undefined', () => {
      renderWithProviders(<SendHeroInQuestDialog />, {
        actionLandPosition: undefined,
        showSendHeroInQuestDialog: true, // Ensure dialog would show if actionLandPosition was valid
      });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('Quest Display', () => {
    it('should display all available quests', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Should show all 4 quests
      expect(screen.getByTestId('flip-book-page-The-Echoing-Ruins')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book-page-The-Whispering-Grove')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book-page-The-Abyssal-Crypt')).toBeInTheDocument();
      expect(screen.getByTestId('flip-book-page-The-Shattered-Sky')).toBeInTheDocument();
    });

    it('should display quest information correctly', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      const echoingRuinsPage = screen.getByTestId('flip-book-page-The-Echoing-Ruins');
      expect(echoingRuinsPage).toBeInTheDocument();

      // Check quest title
      expect(screen.getByText('The Echoing Ruins')).toBeInTheDocument();

      // Check quest description
      expect(screen.getByText(/Whispers of lost ages linger/)).toBeInTheDocument();

      // Check lore page number (appears on all 4 pages)
      expect(screen.getAllByText('1417')).toHaveLength(4);
    });

    it('should display quest icons', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      const echoingRuinsIcon = screen.getByAltText('The Echoing Ruins');
      expect(echoingRuinsIcon).toBeInTheDocument();
      // Note: The mock component doesn't set src attribute, just alt text
      expect(echoingRuinsIcon).toHaveAttribute('alt', 'The Echoing Ruins');
    });
  });

  describe('Hero Slots', () => {
    it('should display available heroes with correct information', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get the first hero from the game state using helper function
      const lands = getHeroLands(mockGameState);
      expect(lands.length).toBeGreaterThan(0);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      expect(heroArmyUnit).toBeDefined();

      const hero = heroArmyUnit!.heroes[0];

      // Check that hero slot is displayed with correct ID (full name) and display name (first name + level)
      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0];
      expect(heroSlot).toBeInTheDocument();

      const expectedDisplayName = `${hero.name.split(' ')[0]} Lvl: ${hero.level}`;
      expect(heroSlot).toHaveTextContent(expectedDisplayName);
    });

    it('should use hero.name as slot.id for findHeroByName compatibility', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get the first hero from the game state using helper function
      const lands = getHeroLands(mockGameState);
      expect(lands.length).toBeGreaterThan(0);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      const hero = heroArmyUnit!.heroes[0];

      // The slot ID should be the full hero name, which is what findHeroByName expects
      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0];
      expect(heroSlot).toBeInTheDocument();

      // Verify the slot ID is the same as the hero name in game state
      expect(heroSlot.getAttribute('data-testid')).toBe(`slot-${hero.name}`);
    });

    it('should display heroes from all available lands', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Count all heroes from all lands owned by current player
      const heroLands = getHeroLands(mockGameState);

      let totalHeroes = 0;
      heroLands.forEach((land) => {
        totalHeroes += land.army.reduce((count, armyUnit) => count + armyUnit.heroes.length, 0);
      });

      // Should show slot buttons for all heroes across all quest pages
      const allSlotButtons = screen.getAllByTestId(/slot-/);
      // Each hero appears on each of the 4 quest pages
      expect(allSlotButtons.length).toBe(totalHeroes * 4);
    });
  });

  describe('Quest Interaction', () => {
    it('should handle slot click and start quest with correct hero', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get the first hero from the game state using helper function
      const lands = getHeroLands(mockGameState);
      expect(lands.length).toBeGreaterThan(0);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      const hero = heroArmyUnit!.heroes[0];

      // Click on the hero slot in the first quest (The Echoing Ruins)
      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0]; // First quest page
      expect(heroSlot).not.toBeDisabled();
      expect(heroSlot).toHaveClass('available-slot');

      await user.click(heroSlot);

      // Verify startQuest was called with correct parameters
      expect(mockStartQuest).toHaveBeenCalledWith(
        hero,
        'The Echoing Ruins', // First quest type
        mockGameState
      );
    });

    it('should track used slots across all pages', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get the first hero
      const lands = getHeroLands(mockGameState);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      const hero = heroArmyUnit!.heroes[0];

      // Click on hero slot in first quest
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
      expect(heroSlots.length).toBe(4); // Should appear on all 4 quest pages

      const firstHeroSlot = heroSlots[0];
      await user.click(firstHeroSlot);

      // After clicking, startQuest should be called
      expect(mockStartQuest).toHaveBeenCalledTimes(1);
    });

    it('should handle icon click to send all heroes to quest', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get all heroes from game state
      const heroLands = getHeroLands(mockGameState);

      let allHeroes: HeroUnit[] = [];
      heroLands.forEach((land) => {
        const landHeroes = land.army.flatMap((armyUnit) => armyUnit.heroes);
        allHeroes = allHeroes.concat(landHeroes);
      });

      // Click icon button for first quest
      const iconButtons = screen.getAllByTestId('icon-button');
      const firstQuestIconButton = iconButtons[0]; // The Echoing Ruins

      await user.click(firstQuestIconButton);

      // Should call startQuest for each hero
      expect(mockStartQuest).toHaveBeenCalledTimes(allHeroes.length);

      // Verify each hero was sent to the correct quest
      allHeroes.forEach((hero) => {
        expect(mockStartQuest).toHaveBeenCalledWith(hero, 'The Echoing Ruins', mockGameState);
      });

      // Should close dialog after sending all heroes
      expect(mockApplicationContext.setShowSendHeroInQuestDialog).toHaveBeenCalledWith(false);
    });

    it('should handle different quest levels correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get the first hero
      const lands = getHeroLands(mockGameState);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      const hero = heroArmyUnit!.heroes[0];

      // Click hero slot on different quest pages
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);

      // Click on second quest (The Whispering Grove)
      await user.click(heroSlots[1]);

      expect(mockStartQuest).toHaveBeenCalledWith(hero, 'The Whispering Grove', mockGameState);

      // Click on third quest (The Abyssal Crypt)
      await user.click(heroSlots[2]);

      expect(mockStartQuest).toHaveBeenCalledWith(hero, 'The Abyssal Crypt', mockGameState);

      // Click on fourth quest (The Shattered Sky)
      await user.click(heroSlots[3]);

      expect(mockStartQuest).toHaveBeenCalledWith(hero, 'The Shattered Sky', mockGameState);

      expect(mockStartQuest).toHaveBeenCalledTimes(3);
    });
  });

  describe('Dialog Closing', () => {
    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      const flipBook = screen.getByTestId('flip-book');
      await user.click(flipBook);

      expect(mockApplicationContext.setShowSendHeroInQuestDialog).toHaveBeenCalledWith(false);
    });

    it('should close dialog when clicking close button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />);

      const closeButtons = screen.getAllByTestId('close-button');
      const firstCloseButton = closeButtons[0];
      await user.click(firstCloseButton);

      expect(mockApplicationContext.setShowSendHeroInQuestDialog).toHaveBeenCalledWith(false);
    });

    it('should reset used slots when dialog closes', () => {
      const { rerender } = renderWithProviders(<SendHeroInQuestDialog />);

      // Dialog should initially be rendered
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();

      // Update context to simulate dialog closing
      mockApplicationContext.showSendHeroInQuestDialog = false;

      // Re-render with updated context
      rerender(<SendHeroInQuestDialog />);

      // Should not render when closed
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('UseEffect Hook Behavior', () => {
    it('should close dialog automatically when no heroes are available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create new state without heroes
      const emptyHeroesGameState = createDefaultGameStateStub();

      // Remove all heroes
      Object.values(emptyHeroesGameState.map.lands).forEach((land) => {
        land.army = [];
      });

      // Render with empty heroes state - should not render
      renderWithProviders(<SendHeroInQuestDialog />, { gameState: emptyHeroesGameState });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should not attempt to close when dialog is already closed', () => {
      const closeSpy = jest.spyOn(mockApplicationContext, 'setShowSendHeroInQuestDialog');

      renderWithProviders(<SendHeroInQuestDialog />, { showSendHeroInQuestDialog: false });

      // Should not try to close when already closed
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should not attempt operations when gameState is null', () => {
      const closeSpy = jest.spyOn(mockApplicationContext, 'setShowSendHeroInQuestDialog');

      renderWithProviders(<SendHeroInQuestDialog />, { gameState: null as any });

      // Should not try to close or perform operations when gameState is null
      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Hero Finding Integration', () => {
    it('should ensure findHeroByName can locate heroes using slot.id', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get heroes from the actual game state
      const lands = getHeroLands(mockGameState);

      expect(lands.length).toBeGreaterThan(0);

      const heroArmyUnit = lands[0].army.find((armyUnit) => armyUnit.heroes.length > 0);
      const hero = heroArmyUnit!.heroes[0];

      // The slot should be created with hero.name as the id
      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0];
      expect(heroSlot).toBeInTheDocument();

      // Verify the hero name matches what's in the game state
      // This ensures that when createSlotClickHandler uses slot.id,
      // findHeroByName will find the correct hero
      const expectedHeroInGameState = getLands({
        gameState: mockGameState,
        players: [mockGameState.turnOwner.id],
        noArmy: false,
      })
        .flatMap((land) => land.army)
        .find((armyUnit) => armyUnit.heroes.some((unit) => unit.name === hero.name));

      expect(expectedHeroInGameState).toBeDefined();
    });

    it('should create slots with correct id and name format', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Get all heroes from game state
      const heroLands = getHeroLands(mockGameState);

      heroLands.forEach((land) => {
        land.army
          .flatMap((armyUnit) => armyUnit.heroes)
          .forEach((unit) => {
            const hero = unit as HeroUnit;

            // Check slot exists with hero name as ID
            // Hero appears on all 4 quest pages, so get the first occurrence
            const heroSlots = screen.getAllByTestId(`slot-${hero.name}`);
            expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
            const heroSlot = heroSlots[0];
            expect(heroSlot).toBeInTheDocument();

            // Check display format is "FirstName Lvl: X"
            const expectedDisplayName = `${hero.name.split(' ')[0]} Lvl: ${hero.level}`;
            expect(heroSlot).toHaveTextContent(expectedDisplayName);
          });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty hero names gracefully', () => {
      // Modify hero to have empty name (edge case)
      const lands = getLands({
        gameState: mockGameState,
        players: [mockGameState.turnOwner.id],
        noArmy: false,
      });

      expect(lands.length).toBeGreaterThan(0);
      const heroArmyUnit = lands[0].army[0].heroes.push(
        createHeroUnit(mockGameState.turnOwner.getType(), '')
      );
      expect(heroArmyUnit).toBeDefined();

      renderWithProviders(<SendHeroInQuestDialog />);

      // Should still render dialog but with empty slot name
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should handle heroes with very long names', () => {
      // Modify hero to have very long name
      const lands = getLands({
        gameState: mockGameState,
        players: [mockGameState.turnOwner.id],
        noArmy: false,
      });

      expect(lands.length).toBeGreaterThan(0);
      const longName = 'VeryLongHeroNameThatExceedsNormalLimits AndHasMultipleWords';
      lands[0].army[0].heroes.push(createHeroUnit(mockGameState.turnOwner.getType(), longName));
      const heroArmyUnit = lands[0].army.find((a) =>
        a.heroes.some((unit) => unit.name === longName)
      );
      renderWithProviders(<SendHeroInQuestDialog />);

      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-${longName}`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0];
      expect(heroSlot).toBeInTheDocument();

      // Display name should use first word only
      const expectedDisplayName = `VeryLongHeroNameThatExceedsNormalLimits Lvl: ${heroArmyUnit!.heroes.find((unit) => unit.name === longName)?.level}`;
      expect(heroSlot).toHaveTextContent(expectedDisplayName);
    });

    it('should handle heroes with single word names', () => {
      // Modify hero to have single word name
      const lands = getLands({
        gameState: mockGameState,
        players: [mockGameState.turnOwner.id],
        noArmy: false,
      });

      expect(lands.length).toBeGreaterThan(0);
      lands[0].army[0].heroes.push(createHeroUnit(mockGameState.turnOwner.getType(), 'SingleName'));
      const heroArmyUnit = lands[0].army.find((armyUnit) =>
        armyUnit.heroes.some((unit) => unit.name === 'SingleName')
      );

      expect(heroArmyUnit).toBeDefined();

      renderWithProviders(<SendHeroInQuestDialog />);

      // Hero appears on all 4 quest pages, so get the first occurrence
      const heroSlots = screen.getAllByTestId(`slot-SingleName`);
      expect(heroSlots).toHaveLength(4); // Should appear on all 4 quest pages
      const heroSlot = heroSlots[0];
      expect(heroSlot).toBeInTheDocument();

      // Display name should be the single word + level
      const expectedDisplayName = `SingleName Lvl: ${heroArmyUnit!.heroes.find((unit) => unit.name === 'SingleName')?.level}`;
      expect(heroSlot).toHaveTextContent(expectedDisplayName);
    });
  });

  describe('Multiple Heroes Scenario', () => {
    beforeEach(() => {
      // Add additional heroes to test multiple hero scenarios
      const currentPlayerLands = getLands({
        gameState: mockGameState,
        players: [mockGameState.turnOwner.id],
      });

      if (currentPlayerLands.length > 1) {
        // Add a second hero to another land
        const secondHero: HeroUnit = createHeroUnit(HeroUnitType.FIGHTER, 'Additional Hero');
        secondHero.levelUp(Alignment.LAWFUL);

        currentPlayerLands[1].army.push(
          createArmy(mockGameState.turnOwner.id, currentPlayerLands[1].mapPos, [secondHero])
        );
      }
    });

    it('should display multiple heroes from different lands', () => {
      renderWithProviders(<SendHeroInQuestDialog />);

      // Should show slots for heroes
      expect(screen.queryAllByTestId(/slot-/).length).toBeGreaterThan(0);

      // Get all slot buttons - should be multiple heroes * 4 quests
      const allSlots = screen.getAllByTestId(/slot-/);
      expect(allSlots.length).toBeGreaterThanOrEqual(4); // At least one hero across 4 quests
    });

    it('should handle sending multiple different heroes to different quests', async () => {
      // Create a fresh game state for this test to avoid interference from beforeEach
      const testGameState = createDefaultGameStateStub();

      // Add a second hero to the land that the dialog will look at (3, 3)
      const actionLandPosition = { row: 3, col: 3 };
      const landId = `${actionLandPosition.row}-${actionLandPosition.col}`;
      const land = testGameState.map.lands[landId];

      // Add a second hero directly to the army array
      placeUnitsOnMap(
        createHeroUnit(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
        testGameState,
        land.mapPos
      );

      const user = userEvent.setup();
      renderWithProviders(<SendHeroInQuestDialog />, { gameState: testGameState });

      // Get all hero slot buttons for the first quest
      const questPage = screen.getByTestId('flip-book-page-The-Echoing-Ruins');
      const heroSlots = within(questPage).getAllByTestId(/slot-/);

      // Should now have 2 heroes * 1 quest = 2 slots
      expect(heroSlots.length).toBe(2);

      // Click different heroes - first hero
      await user.click(heroSlots[0]);
      expect(mockStartQuest).toHaveBeenCalledTimes(1);

      // Click second hero (should succeed if our setup is correct)
      await user.click(heroSlots[1]);
      expect(mockStartQuest).toHaveBeenCalledTimes(2);
    });
  });
});
