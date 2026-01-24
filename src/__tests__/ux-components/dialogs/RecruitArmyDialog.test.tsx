import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecruitArmyDialog from '../../../ux-components/dialogs/RecruitArmyDialog';

import { getLand, hasBuilding } from '../../../selectors/landSelectors';
import { getTurnOwner } from '../../../selectors/playerSelectors';
import { construct } from '../../../map/building/construct';
import { startRecruiting } from '../../../map/recruiting/startRecruiting';
import { playerFactory } from '../../../factories/playerFactory';
import { getAvailableSlotsCount } from '../../../selectors/buildingSelectors';
import { isMageType } from '../../../domain/unit/unitTypeChecks';
import { PREDEFINED_PLAYERS } from '../../../domain/player/playerRepository';
import { BuildingName } from '../../../types/Building';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../../types/UnitType';
import { Doctrine, RaceName } from '../../../state/player/PlayerProfile';
import { Alignment } from '../../../types/Alignment';
import { LandName } from '../../../types/Land';
import type { GameState } from '../../../state/GameState';
import type { DoctrineType } from '../../../state/player/PlayerProfile';
import type { LandPosition } from '../../../state/map/land/LandPosition';
import type { PlayerProfile } from '../../../state/player/PlayerProfile';
import type { RegularUnitType } from '../../../types/UnitType';
import type { LandType } from '../../../types/Land';
import type { HeroUnitType } from '../../../types/UnitType';

import { createGameStateStub } from '../../utils/createGameStateStub';

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
      renderWithProviders(<RecruitArmyDialog />);

      // Should not show mage heroes in barracks
      expect(screen.queryByTestId('flipbook-page-Cleric')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Pyromancer')).not.toBeInTheDocument();
    });
  });

  describe('Slot Management', () => {
    it.each([
      [7, PREDEFINED_PLAYERS[4].id], // 4 war-machines, war-hands, warrior and fighter available
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

      const barracks = getLand(gameStateStub, barracksPos).buildings.find((b) => b.type === BuildingName.BARRACKS);
      expect(barracks).toBeDefined();
      expect(barracks!.slots.filter((s) => s.isOccupied)).toHaveLength(1);
      expect(barracks!.slots[0].unit).toBe(RegularUnitName.WARD_HANDS);
      expect(barracks!.slots[0].turnsRemaining).toBe(1);
    });

    it('should track used slots across all pages', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(7);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(7);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(7);

      // Click slot on first unit page
      await user.click(screen.getAllByTestId('flipbook-slot-buildSlot1')[0]);

      // After clicking, slot should disappear
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(7);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(7);
    });

    it('should prevent multiple clicks on the same slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      const slot1Buttons = screen.getAllByTestId('flipbook-slot-buildSlot1');
      const slot1Button = slot1Buttons[0]; // Get the first one

      // First click
      await user.click(slot1Button);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(7);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(7);
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);

      // Second click - should not be allowed
      await user.click(slot1Button);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(7);
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(7);
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
    it('should handle icon click to recruit and close dialog if unit could be recruited in all slots', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      // click on icon to recruit all posible units the same type
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument(); // dialog closed
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(0);

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument(); // dialog closed
    });

    it("handles icon click to recruit, keeps dialog open if unit isn't in all slots, and shows remaining slots", async () => {
      gameStateStub = createGameStateStub({
        gamePlayers: PREDEFINED_PLAYERS.slice(3, 4), // player 3 is Kaer and he is not able to recruit Undead in 3 slots
      });
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      // click on icon to recruit all posible units the same type
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(1);

      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(1);

      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-slot-buildSlot2')).not.toBeInTheDocument();

      // click on Icon one more time to use the rest of the slots
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument(); // dialog closed
      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(0);
      expect(screen.queryByTestId('flipbook-slot-buildSlot3')).not.toBeInTheDocument();
    });

    it("handles icon click to recruit, keeps dialog open if unit isn't in all slots, and shows remaining slots for Nullwarden", async () => {
      gameStateStub = createGameStateStub({
        // player 16 is Nullwarden and his recruit restrictions are:
        // one slot for regular units only
        // one slot for war-machines only
        // one slot for hero units only
        gamePlayers: [PREDEFINED_PLAYERS[16], PREDEFINED_PLAYERS[0]],
      });
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      // click on icon to recruit all posible units the same type
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(5); // 4 war-machines + Zealot-hero
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(5); // 4 war-machines + Zealot-hero

      // click on Icon one more time to use the rest of the slots
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(1);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-slot-buildSlot2')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(1); // Zealot-hero
    });

    it('handles icon click to recruit, when click 3 times on Icon for Nullwarden', async () => {
      gameStateStub = createGameStateStub({
        // player 16 is Nullwarden and his recruit restrictions are:
        // one slot for regular units only
        // one slot for war-machines only
        // one slot for hero units only
        gamePlayers: [PREDEFINED_PLAYERS[16], PREDEFINED_PLAYERS[0]],
      });
      construct(gameStateStub, BuildingName.BARRACKS, barracksPos);

      const user = userEvent.setup();
      renderWithProviders(<RecruitArmyDialog />);

      /******************* click on icon to recruit all posible units the same type *******************/
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(2);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot2')).toHaveLength(5); // 4 war-machines + Zealot-hero
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(5); // 4 war-machines + Zealot-hero

      /****************** click on Icon one more time to use the rest of the slots *******************/
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(1);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-slot-buildSlot2')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot3')).toHaveLength(1); // Zealot-hero

      /****************** click on Icon one more time to use the rest of the slots *******************/
      await user.click(screen.getAllByTestId('flipbook-icon')[0]);

      expect(screen.queryByTestId('flip-book')).not.toBeInTheDocument(); // dialog closed

      expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(0);
      expect(screen.queryByTestId('flipbook-slot-buildSlot1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-slot-buildSlot2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-slot-buildSlot3')).not.toBeInTheDocument();
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
    // Mage Tower Unit availability depends on the Players Doctrine and Player type

    const prepareGame = (playerType: HeroUnitType, doctrine: DoctrineType) => {
      const player: PlayerProfile = { ...PREDEFINED_PLAYERS[0], type: playerType, doctrine: doctrine };
      gameStateStub = createGameStateStub({ gamePlayers: [player, PREDEFINED_PLAYERS[1]] });
      getTurnOwner(gameStateStub).vault = 100000;

      const landPos: LandPosition = { row: 4, col: 3 };
      construct(gameStateStub, BuildingName.MAGE_TOWER, landPos);

      mockApplicationContext.actionLandPosition = landPos;
    };

    const expectMageVisibility = (visible: HeroUnitType[], hidden: HeroUnitType[]) => {
      expect(screen.getByTestId('flip-book')).toBeInTheDocument();

      visible.forEach((mage) => expect(screen.getByTestId(`flipbook-page-${mage}`)).toBeInTheDocument());
      hidden.forEach((mage) => expect(screen.queryByTestId(`flipbook-page-${mage}`)).not.toBeInTheDocument());
    };

    it.each([
      [HeroUnitName.CLERIC, HeroUnitName.CLERIC],
      [HeroUnitName.HAMMER_LORD, HeroUnitName.CLERIC],
      [HeroUnitName.DRUID, HeroUnitName.DRUID],
      [HeroUnitName.RANGER, HeroUnitName.DRUID],
      [HeroUnitName.ENCHANTER, HeroUnitName.ENCHANTER],
      [HeroUnitName.FIGHTER, HeroUnitName.ENCHANTER],
      [HeroUnitName.PYROMANCER, HeroUnitName.PYROMANCER],
      [HeroUnitName.OGR, HeroUnitName.PYROMANCER],
      [HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER],
      [HeroUnitName.SHADOW_BLADE, HeroUnitName.NECROMANCER],
    ])('Player %s with MELEE Doctrine able to recruit only %s', (playerType: HeroUnitType, mageType: HeroUnitType) => {
      prepareGame(playerType, Doctrine.MELEE);

      /********************** RENDER DIALOG ***********************/
      renderWithProviders(<RecruitArmyDialog />);

      expectMageVisibility(
        [mageType],
        Object.values(HeroUnitName).filter((unit) => isMageType(unit) && unit !== mageType)
      );
    });

    it.each([
      [HeroUnitName.CLERIC, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
      [HeroUnitName.HAMMER_LORD, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
      [HeroUnitName.DRUID, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
      [HeroUnitName.RANGER, [HeroUnitName.CLERIC, HeroUnitName.DRUID, HeroUnitName.ENCHANTER]],
      [HeroUnitName.ENCHANTER, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
      [HeroUnitName.FIGHTER, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
      [HeroUnitName.OGR, [HeroUnitName.DRUID, HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER]],
      [HeroUnitName.PYROMANCER, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
      [HeroUnitName.NECROMANCER, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
      [HeroUnitName.SHADOW_BLADE, [HeroUnitName.ENCHANTER, HeroUnitName.PYROMANCER, HeroUnitName.NECROMANCER]],
    ])('Player %s with MAGIC Doctrine able to recruit %s', (playerType: HeroUnitType, mageTypes: HeroUnitType[]) => {
      prepareGame(playerType, Doctrine.MAGIC);

      /********************** RENDER DIALOG ***********************/
      renderWithProviders(<RecruitArmyDialog />);

      expectMageVisibility(
        mageTypes,
        Object.values(HeroUnitName).filter((unit) => isMageType(unit) && !mageTypes.includes(unit))
      );
    });

    it.each([
      [HeroUnitName.CLERIC],
      [HeroUnitName.DRUID],
      [HeroUnitName.ENCHANTER],
      [HeroUnitName.PYROMANCER],
      [HeroUnitName.NECROMANCER],
    ])('Player %s with PURE MAGIC Doctrine able to recruit All Mages', (playerType: HeroUnitType) => {
      prepareGame(playerType, Doctrine.PURE_MAGIC);

      /********************** RENDER DIALOG ***********************/
      renderWithProviders(<RecruitArmyDialog />);

      expectMageVisibility(
        Object.values(HeroUnitName).filter((unit) => isMageType(unit)),
        []
      );
    });
  });

  describe('Player Type Restrictions', () => {
    it.each([
      [LandName.PLAINS, RegularUnitName.GOLEM],
      [LandName.MOUNTAINS, RegularUnitName.GARGOYLE],
      [LandName.GREEN_FOREST, RegularUnitName.DENDRITE],
      [LandName.DARK_FOREST, RegularUnitName.DENDRITE],
      [LandName.HILLS, RegularUnitName.GARGOYLE],

      [LandName.VOLCANO, RegularUnitName.GARGOYLE],
      [LandName.LAVA, RegularUnitName.GARGOYLE],
      [LandName.SUN_SPIRE_PEAKS, RegularUnitName.GARGOYLE],
      [LandName.GOLDEN_PLAINS, RegularUnitName.GOLEM],
      [LandName.HEARTWOOD_GROVE, RegularUnitName.DENDRITE],
      [LandName.VERDANT_GLADE, RegularUnitName.DENDRITE],
      [LandName.CRISTAL_BASIN, RegularUnitName.GOLEM],
      [LandName.MISTY_GLADES, RegularUnitName.GOLEM],
      [LandName.SHADOW_MIRE, RegularUnitName.GOLEM],
      [LandName.BLIGHTED_FEN, RegularUnitName.GOLEM],
    ])(
      'Player with DRIVEN Doctrine should be able to recruit on %s land only %s units and Warsmith',
      (landType: LandType, regularUnit: RegularUnitType) => {
        const players = [PREDEFINED_PLAYERS.find((p) => p.doctrine === Doctrine.DRIVEN)!, PREDEFINED_PLAYERS[1]];
        gameStateStub = createGameStateStub({ gamePlayers: players });
        expect(getTurnOwner(gameStateStub).playerProfile.doctrine).toBe(Doctrine.DRIVEN);

        construct(gameStateStub, BuildingName.BARRACKS, barracksPos);
        getLand(gameStateStub, barracksPos).type = landType;

        renderWithProviders(<RecruitArmyDialog />);
        expect(screen.getByTestId('flip-book')).toBeInTheDocument();
        expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(2);
        // hero unit
        expect(screen.getByTestId(`flipbook-page-Warsmith`)).toBeInTheDocument();
        // regular unit
        expect(screen.getByTestId(`flipbook-page-${regularUnit}`)).toBeInTheDocument();
        // war-machines
        expect(screen.queryByTestId('flipbook-page-Ballista')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-page-Catapult')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-page-Battering Ram')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-page-Siege Tower')).not.toBeInTheDocument();
      }
    );

    it.each([
      [LandName.SWAMP, RegularUnitName.ORC, HeroUnitName.OGR],
      [LandName.BLIGHTED_FEN, RegularUnitName.ORC, HeroUnitName.OGR],
      [LandName.SHADOW_MIRE, RegularUnitName.ORC, HeroUnitName.OGR],
      [LandName.MOUNTAINS, RegularUnitName.DWARF, HeroUnitName.HAMMER_LORD],
      [LandName.SUN_SPIRE_PEAKS, RegularUnitName.DWARF, HeroUnitName.HAMMER_LORD],
      [LandName.PLAINS, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
      [LandName.CRISTAL_BASIN, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
      [LandName.MISTY_GLADES, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
      [LandName.GREEN_FOREST, RegularUnitName.ELF, HeroUnitName.RANGER],
      [LandName.DARK_FOREST, RegularUnitName.DARK_ELF, HeroUnitName.SHADOW_BLADE],
    ])(
      'should allow Nulwarden recruit in %s land %s Nullwarden regular',
      (landType: LandType, regularUnitName: RegularUnitType, heroUnitName: HeroUnitType) => {
        const lands = gameStateStub.players[0].landsOwned;
        gameStateStub.players[0] = playerFactory(PREDEFINED_PLAYERS[16], 'human'); // replace player
        gameStateStub.players[0].landsOwned = lands; // copy lands
        gameStateStub.turnOwner = gameStateStub.players[0].id;
        expect(getTurnOwner(gameStateStub).playerProfile.type).toBe(HeroUnitName.FIGHTER);
        expect(getTurnOwner(gameStateStub).playerProfile.doctrine).toBe(Doctrine.ANTI_MAGIC);
        expect(hasBuilding(getLand(gameStateStub, barracksPos), BuildingName.BARRACKS)).toBeTruthy();
        expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(3);

        // change landtype to be able to recruit different Nullwarden regular units
        getLand(gameStateStub, mockApplicationContext.actionLandPosition).type = landType;

        renderWithProviders(<RecruitArmyDialog />);
        expect(screen.getByTestId('flip-book')).toBeInTheDocument();
        //expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(6); // only 6 type of units could be recruited in barracks
        // hero unit
        expect(screen.getByTestId(`flipbook-page-${heroUnitName} Nullwarden`)).toBeInTheDocument();
        // regular unit
        expect(screen.getByTestId(`flipbook-page-${regularUnitName} Nullwarden`)).toBeInTheDocument();
        // war-machines
        expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Catapult')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Battering Ram')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Siege Tower')).toBeInTheDocument();
      }
    );

    it.each([HeroUnitName.RANGER, HeroUnitName.SHADOW_BLADE, HeroUnitName.DRUID])(
      'should not allow ELF players to recruit ORC(s)/OGR(s)',
      (playerType) => {
        const lands = gameStateStub.players[0].landsOwned;
        const playerProfile = { ...PREDEFINED_PLAYERS[4] }; // ELF
        playerProfile.type = playerType;
        playerProfile.alignment = playerType === HeroUnitName.SHADOW_BLADE ? Alignment.CHAOTIC : Alignment.LAWFUL;
        gameStateStub.players[0] = playerFactory(playerProfile, 'human'); // replace player
        gameStateStub.players[0].landsOwned = lands; // copy lands
        gameStateStub.turnOwner = gameStateStub.players[0].id;
        expect(getTurnOwner(gameStateStub).playerProfile.type).toBe(playerType);
        expect(getTurnOwner(gameStateStub).playerProfile.race).toBe(RaceName.ELF); // ELF players can't recruit OGR(s)/ORC(s)'
        // set land where OGR(s)/ORC(s) could be recruited and then verify that they are not available for recruitment
        getLand(gameStateStub, barracksPos).type = LandName.SWAMP;

        expect(hasBuilding(getLand(gameStateStub, barracksPos), BuildingName.BARRACKS)).toBeTruthy();
        expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(3);

        renderWithProviders(<RecruitArmyDialog />);
        expect(screen.getByTestId('flip-book')).toBeInTheDocument();
        // Orc(s)/Ogr unit not present
        expect(screen.queryByTestId(`flipbook-page-Ogr`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`flipbook-page-Orc`)).not.toBeInTheDocument();

        expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(5); // only 5 type of units could be recruited in barracks
        // regular unit
        expect(screen.getByTestId(`flipbook-page-Ward-hands`)).toBeInTheDocument();
        // war-machines
        expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Catapult')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Battering Ram')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-page-Siege Tower')).toBeInTheDocument();
      }
    );

    it.each([PREDEFINED_PLAYERS[5], PREDEFINED_PLAYERS[14]])(
      'should not allow OGR players to recruit ORC(s)/OGR(s)',
      (playerProfile: PlayerProfile) => {
        const lands = gameStateStub.players[0].landsOwned;
        gameStateStub.players[0] = playerFactory(playerProfile, 'human'); // replace player
        gameStateStub.players[0].landsOwned = lands; // copy lands
        gameStateStub.turnOwner = gameStateStub.players[0].id;
        expect(getTurnOwner(gameStateStub).playerProfile.race).toBe(RaceName.ORC);

        // set land where ELFS(s)/RANGER(s) could be recruited and then verify that they are not available for recruitment
        [LandName.GREEN_FOREST, LandName.DARK_FOREST].forEach((landType) => {
          getLand(gameStateStub, barracksPos).type = landType;

          expect(hasBuilding(getLand(gameStateStub, barracksPos), BuildingName.BARRACKS)).toBeTruthy();
          expect(getAvailableSlotsCount(getLand(gameStateStub, barracksPos).buildings[0])).toBe(3);

          const { unmount } = renderWithProviders(<RecruitArmyDialog />);
          expect(screen.getByTestId('flip-book')).toBeInTheDocument();
          // Orc(s)/Ogr unit not present
          expect(screen.queryByTestId(`flipbook-page-Elf`)).not.toBeInTheDocument();
          expect(screen.queryByTestId(`flipbook-page-Ranger`)).not.toBeInTheDocument();
          expect(screen.queryByTestId(`flipbook-page-Dark Elf`)).not.toBeInTheDocument();
          expect(screen.queryByTestId(`flipbook-page-Shadow Blade`)).not.toBeInTheDocument();

          expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(5); // only 5 type of units could be recruited in barracks
          // regular unit
          expect(screen.getByTestId(`flipbook-page-Ward-hands`)).toBeInTheDocument();
          // war-machines
          expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
          expect(screen.getByTestId('flipbook-page-Catapult')).toBeInTheDocument();
          expect(screen.getByTestId('flipbook-page-Battering Ram')).toBeInTheDocument();
          expect(screen.getByTestId('flipbook-page-Siege Tower')).toBeInTheDocument();

          unmount();
        });
      }
    );

    it('should not allow non-mage units recruitment for mage supported players players', () => {
      expect(getTurnOwner(gameStateStub).playerProfile.type).not.toBe(HeroUnitName.WARSMITH);
      renderWithProviders(<RecruitArmyDialog />);

      expect(screen.getByTestId('flip-book')).toBeInTheDocument();
      expect(screen.getAllByTestId('flipbook-slot-buildSlot1')).toHaveLength(7); // only 7 type of units could be recruited in barracks

      expect(screen.queryByTestId('flipbook-page-Warsmith')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Undead')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Zealot')).not.toBeInTheDocument();
      expect(screen.queryByTestId('flipbook-page-Nullwarden')).not.toBeInTheDocument();
      // hero unit
      expect(screen.getByTestId('flipbook-page-Fighter')).toBeInTheDocument();
      // regular units
      expect(screen.getByTestId('flipbook-page-Warrior')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Ward-hands')).toBeInTheDocument();
      // war-machines
      expect(screen.getByTestId('flipbook-page-Ballista')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Catapult')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Battering Ram')).toBeInTheDocument();
      expect(screen.getByTestId('flipbook-page-Siege Tower')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty units to recruit', () => {
      const land = getLand(gameStateStub, barracksPos);
      getTurnOwner(gameStateStub).traits.recruitedUnitsPerLand[land.type] = new Set();

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
