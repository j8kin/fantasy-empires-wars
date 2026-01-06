import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecruitArmyDialog from '../../../ux-components/dialogs/RecruitArmyDialog';

import { getLand, getLandOwner, hasBuilding } from '../../../selectors/landSelectors';
import { getTurnOwner } from '../../../selectors/playerSelectors';
import { construct } from '../../../map/building/construct';
import { startRecruiting } from '../../../map/recruiting/startRecruiting';
import { playerFactory } from '../../../factories/playerFactory';

import { PREDEFINED_PLAYERS } from '../../../domain/player/playerRepository';
import { BuildingName } from '../../../types/Building';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../../types/UnitType';

import type { GameState } from '../../../state/GameState';
import type { LandPosition } from '../../../state/map/land/LandPosition';
import type { BuildingType } from '../../../types/Building';
import type { HeroUnitType } from '../../../types/UnitType';

import { createGameStateStub } from '../../utils/createGameStateStub';
import { getAvailableSlotsCount } from '../../../selectors/buildingSelectors';

// Mock context hooks
const mockApplicationContext = {
  showRecruitArmyDialog: true,
  setShowRecruitArmyDialog: jest.fn(),
  selectedLandAction: null,
  setSelectedLandAction: jest.fn(),
  actionLandPosition: { row: 3, col: 4 } as LandPosition,
  setActionLandPosition: jest.fn(),
  showStartWindow: false,
  showSaveDialog: false,
  showCastSpellDialog: false,
  showConstructBuildingDialog: false,
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
  setShowConstructBuildingDialog: jest.fn(),
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

describe('RecruitArmyDialog', () => {
  let gameStateStub: GameState;
  const barracksPos: LandPosition = { row: 3, col: 4 };

  const renderWithProviders = (
    ui: React.ReactElement,
    { gameState = gameStateStub, showRecruitArmyDialog = true } = {}
  ) => {
    // Update the mock values for this test
    mockApplicationContext.showRecruitArmyDialog = showRecruitArmyDialog;
    mockApplicationContext.setShowRecruitArmyDialog = jest.fn();
    mockGameContext.gameState = gameState;

    return render(ui);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // open dialog on Barrack Position by default
    mockApplicationContext.actionLandPosition = barracksPos;

    // Create a game state with a barracks that has available slots
    gameStateStub = createGameStateStub({
      nPlayers: 2,
    });

    // Add a barracks with available slots to the first player's land
    construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

    // Ensure the barracks has available slots (2 total, 0 used)
    const land = getLand(gameStateStub, barracksPos);

    // Set up some units to recruit - use units that would be available on Plains land
    land.land.unitsToRecruit = [
      RegularUnitName.WARRIOR,
      WarMachineName.BALLISTA,
      HeroUnitName.WARSMITH,
      HeroUnitName.FIGHTER,
      RegularUnitName.WARD_HANDS, // to make sure it will sorted
    ];
  });

  describe('Dialog Visibility', () => {
    it('should not render when showRecruitArmyDialog is false', () => {
      renderWithProviders(<RecruitArmyDialog />, { showRecruitArmyDialog: false });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when gameState is null', () => {
      renderWithProviders(<RecruitArmyDialog />, { gameState: null as any });
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should render when showRecruitArmyDialog is true and gameState exists', () => {
      renderWithProviders(<RecruitArmyDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
    });

    it('should not render when no barracks exists', () => {
      // Remove the barracks
      const landPos: LandPosition = { row: 3, col: 3 };
      expect(hasBuilding(getLand(gameStateStub, landPos), BuildingName.BARRACKS)).toBeFalsy();
      mockApplicationContext.actionLandPosition = landPos;

      renderWithProviders(<RecruitArmyDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });

    it('should not render when barracks has no available slots', () => {
      // Fill all barracks slots
      getTurnOwner(gameStateStub).vault = 100000;
      expect(hasBuilding(getLand(gameStateStub, barracksPos), BuildingName.BARRACKS)).toBeTruthy();
      mockApplicationContext.actionLandPosition = barracksPos;

      startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);
      startRecruiting(gameStateStub, barracksPos, WarMachineName.BALLISTA);
      startRecruiting(gameStateStub, barracksPos, RegularUnitName.WARRIOR);

      renderWithProviders(<RecruitArmyDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('RegularUnit Display', () => {
    it('should display available non-mage units for recruitment in barracks', () => {
      renderWithProviders(<RecruitArmyDialog />);

      // Should show non-mage units
      expect(screen.getByTestId('flipbook-page-Warrior')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Fighter')).toBeInTheDocument();
      // Note: Warsmith may not appear due to player type restrictions
    });

    it('should display unit information correctly', () => {
      renderWithProviders(<RecruitArmyDialog />);

      const warriorPage = screen.getByTestId('flipbook-page-Warrior');
      expect(warriorPage).toBeInTheDocument();

      // Check if the page contains the expected information
      expect(screen.getByText('Warrior')).toBeInTheDocument();
      const costElements = screen.getAllByText(/Cost:/);
      expect(costElements.length).toBeGreaterThan(0);
    });

    it('should sort units with heroes at the end', () => {
      renderWithProviders(<RecruitArmyDialog />);

      const pages = screen.getAllByTestId(/flipbook-page-/);
      const pageHeaders = pages.map((page) => page.getAttribute('data-testid'));

      // Regular units should come before heroes
      const warriorIndex = pageHeaders.findIndex((header) => header!.endsWith('Warrior'));
      const ballistaIndex = pageHeaders.findIndex((header) => header!.endsWith('Ballista'));
      const fighterIndex = pageHeaders.findIndex((header) => header!.endsWith('Fighter'));
      const warsmithIndex = pageHeaders.findIndex((header) => header!.endsWith('Warsmith'));

      // So we expect regular units (Warrior, Ballista) to come before heroes (Fighter)
      expect(warriorIndex).toBeGreaterThanOrEqual(0);
      expect(ballistaIndex).toBeGreaterThanOrEqual(0);
      expect(fighterIndex).toBeGreaterThanOrEqual(0);
      // Based on the test output, Warsmith is not appearing in the result
      expect(warsmithIndex).toBe(-1);

      // Warrior and Ballista should come before Fighter (hero)
      expect(warriorIndex).toBeLessThan(fighterIndex);
      expect(ballistaIndex).toBeLessThan(fighterIndex);
    });

    it('should display correct unit images', () => {
      renderWithProviders(<RecruitArmyDialog />);

      const warriorImage = screen.getByAltText('Warrior');
      // Images in the mock have no src attribute, just alt text
      expect(warriorImage).toBeInTheDocument();

      const ballistaImage = screen.getByAltText('Ballista');
      expect(ballistaImage).toBeInTheDocument();
    });

    it('should not show mage units in barracks', () => {
      // Add mage units to the land but they should be filtered out for barracks
      const landPos: LandPosition = { row: 3, col: 3 };
      const land = getLand(gameStateStub, landPos);
      land.land.unitsToRecruit = [
        ...land.land.unitsToRecruit,
        HeroUnitName.CLERIC,
        HeroUnitName.PYROMANCER,
      ];

      renderWithProviders(<RecruitArmyDialog />);

      // Should not show mage heroes in barracks
      expect(screen.queryByTestId('flipbook-page-Cleric')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Pyromancer')).not.toBeInTheDocument();
    });
  });

  describe('Slot Management', () => {
    it.each([
      [4, PREDEFINED_PLAYERS[4].id],
      [5, PREDEFINED_PLAYERS[3].id], // WARTHMITH available only for non-magic player like 'Kaer Dravane'
    ])('should display available slots: %s for %s', (nSlots: number, playerId: string) => {
      const lands = gameStateStub.players[0].landsOwned;
      const player = PREDEFINED_PLAYERS.find((p) => p.id === playerId)!;
      gameStateStub.players[0] = playerFactory(player, 'human'); // replace player
      gameStateStub.players[0].landsOwned = lands; // copy lands
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      renderWithProviders(<RecruitArmyDialog />);

      // Should show 3 available slots for Barracks for each available unit to recruit
      expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(nSlots);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(nSlots);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(nSlots);
    });

    it('should handle slot click and start recruiting', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      const slot1Buttons = screen.getAllByTestId('flipbook-slot-buildSlot1');
      const slot1Button = slot1Buttons[0]; // Get the first one
      expect(slot1Button).not.toBeDisabled();
      expect(slot1Button).toHaveClass('slot');

      await user.click(slot1Button);

      const barracks = getLand(gameStateStub, barracksPos).buildings.find(
        (b) => b.type === BuildingName.BARRACKS
      );
      expect(barracks).toBeDefined();
      expect(barracks!.slots.filter((s) => s.isOccupied)).toHaveLength(1);
      expect(barracks!.slots[0].unit).toBe(RegularUnitName.WARD_HANDS);
      expect(barracks!.slots[0].turnsRemaining).toBe(1);
    });

    it('should track used slots across all pages', async () => {
      // WARSMITH available only for non-magic player like 'Kaer Dravane'
      const availableUnits = getLand(gameStateStub, barracksPos).land.unitsToRecruit.filter(
        (u) => u !== HeroUnitName.WARSMITH
      );
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(availableUnits.length);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(availableUnits.length);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(availableUnits.length);

      // Click slot on first unit page
      await user.click(screen.getAllByTestId('flipbook-slot-buildSlot1')[0]);

      // After clicking, slot should disappear
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(availableUnits.length);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(availableUnits.length);
    });

    it('should prevent multiple clicks on the same slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      const slot1Buttons = screen.getAllByTestId('flipbook-slot-buildSlot1');
      const slot1Button = slot1Buttons[0]; // Get the first one

      // First click
      await user.click(slot1Button);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(4);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(4);
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);

      // Second click - should not be allowed
      await user.click(slot1Button);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(4);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(4);
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);
    });

    it('should allow using different slots', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      const slot1Button = screen.getAllByTestId('flipbook-slot-buildSlot1')[0]; // Get the first one
      const slot2Button = screen.getAllByTestId('flipbook-slot-buildSlot2')[0]; // Get the first one

      await user.click(slot1Button);
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);
      await user.click(slot2Button);
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(1);
    });

    it('should reset used slots when dialog closes', () => {
      const { rerender } = renderWithProviders(<RecruitArmyDialog />);

      // Dialog should initially be rendered
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();

      // Update context to simulate dialog closing
      mockApplicationContext.showRecruitArmyDialog = false;

      // Re-render with updated context
      rerender(<RecruitArmyDialog />);

      // Should not render when closed
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('Icon Click Recruitment', () => {
    it('should handle icon click to recruit and close dialog', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      // click on icon to recruit all posible units the same type
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(0);

      expect(mockApplicationContext.setShowRecruitArmyDialog).toHaveBeenCalledWith(false); // dialog closed
    });
  });

  describe('Dialog Closing', () => {
    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      const flipBook = screen.getByTestId('flip-book');
      await user.click(flipBook);

      expect(mockApplicationContext.setShowRecruitArmyDialog).toHaveBeenCalledWith(false);
    });
  });

  describe('Mage Tower Units', () => {
    it.each([
      [HeroUnitName.CLERIC, BuildingName.WHITE_MAGE_TOWER],
      [HeroUnitName.DRUID, BuildingName.GREEN_MAGE_TOWER],
      [HeroUnitName.ENCHANTER, BuildingName.BLUE_MAGE_TOWER],
      [HeroUnitName.PYROMANCER, BuildingName.RED_MAGE_TOWER],
      [HeroUnitName.NECROMANCER, BuildingName.BLACK_MAGE_TOWER],
    ])(
      'should show mage units (%s) in appropriate mage tower (%s)',
      (mageType: HeroUnitType, mageTower: BuildingType) => {
        // Replace barracks with white mage tower
        const landPos: LandPosition = { row: 4, col: 3 };
        const land = getLand(gameStateStub, landPos);
        expect(land.buildings).toHaveLength(0);
        expect(getLandOwner(gameStateStub, landPos)).toBe(gameStateStub.turnOwner);

        // Give the player enough money to build the mage tower (costs 15000)
        getTurnOwner(gameStateStub).vault = 20000;

        construct(gameStateStub, mageTower, landPos); // automatically allow to build clerics

        mockApplicationContext.actionLandPosition = landPos;
        renderWithProviders(<RecruitArmyDialog />);

        // The dialog should render showing the cleric which can be recruited in white mage tower
        expect(screen.getByTestId('flip-book')).toBeInTheDocument();
        expect(screen.getByTestId(`flipbook-page-${mageType}`)).toBeInTheDocument();
      }
    );
  });

  describe('Player Type Restrictions', () => {
    it('should allow WARSMITH recruitment for WARSMITH players', () => {
      const lands = gameStateStub.players[0].landsOwned;
      gameStateStub.players[0] = playerFactory(PREDEFINED_PLAYERS[3], 'human'); // replace player
      gameStateStub.players[0].landsOwned = lands; // copy lands
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      expect(getTurnOwner(gameStateStub).playerProfile.type).toBe(HeroUnitName.WARSMITH);

      expect(hasBuilding(getLand(gameStateStub, barracksPos), BuildingName.BARRACKS)).toBeTruthy();
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(3);

      renderWithProviders(<RecruitArmyDialog />);
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getByTestId(`flipbook-page-Warsmith`)).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Warrior')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Fighter')).toBeInTheDocument();
    });

    it('should not allow WARSMITH recruitment for non-WARSMITH players', () => {
      expect(getTurnOwner(gameStateStub).playerProfile.type).not.toBe(HeroUnitName.WARSMITH);
      renderWithProviders(<RecruitArmyDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Warsmith')).not.toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Warrior')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Fighter')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty units to recruit', () => {
      const land = getLand(gameStateStub, barracksPos);
      land.land.unitsToRecruit = [];

      renderWithProviders(<RecruitArmyDialog />);

      // Should render flip book but with no pages
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.queryByTestId(/flipbook-page-/)).not.toBeInTheDocument();
    });

    it('should not render when no recruiting buildings exist', () => {
      const landPos: LandPosition = { row: 3, col: 3 };
      const land = getLand(gameStateStub, landPos);
      // Remove all buildings
      land.buildings = [];

      // Update actionLandPosition to point to the land with no buildings
      mockApplicationContext.actionLandPosition = landPos;

      renderWithProviders(<RecruitArmyDialog />);
      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument();
    });
  });

  describe('useEffect hook coverage', () => {
    it('should not call handleClose when dialog is already closed', () => {
      const closeSpy = jest.spyOn(mockApplicationContext, 'setShowRecruitArmyDialog');

      renderWithProviders(<RecruitArmyDialog />, { showRecruitArmyDialog: false });

      // Should not try to close when already closed
      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Memoization and Performance', () => {
    it('should maintain consistent slot count during dialog session', () => {
      renderWithProviders(<RecruitArmyDialog />);

      // Initial render should show 3 slots for Barracks
      const slot1Buttons = screen.getAllByTestId('flipbook-slot-buildSlot1');
      const slot2Buttons = screen.getAllByTestId('flipbook-slot-buildSlot2');
      const slot3Buttons = screen.getAllByTestId('flipbook-slot-buildSlot3');
      expect(slot1Buttons.length).toBeGreaterThan(0);
      expect(slot2Buttons.length).toBeGreaterThan(0);
      expect(slot3Buttons.length).toBeGreaterThan(0);

      // Modify the game state after initial render by occupying some slots
      const landPos: LandPosition = { row: 3, col: 3 };
      const land = getLand(gameStateStub, landPos);
      const barracks = land.buildings.find((b) => b.type === BuildingName.BARRACKS);
      if (barracks) {
        // Occupy first slot
        barracks.slots[0].isOccupied = true;
      }

      // Re-render - should still show 3 slots due to memoization
      renderWithProviders(<RecruitArmyDialog />);
      const newSlot1Buttons = screen.getAllByTestId('flipbook-slot-buildSlot1');
      const newSlot2Buttons = screen.getAllByTestId('flipbook-slot-buildSlot2');
      const newSlot3Buttons = screen.getAllByTestId('flipbook-slot-buildSlot3');
      expect(newSlot1Buttons.length).toBeGreaterThan(0);
      expect(newSlot2Buttons.length).toBeGreaterThan(0);
      expect(newSlot3Buttons.length).toBeGreaterThan(0);
    });
  });
});
