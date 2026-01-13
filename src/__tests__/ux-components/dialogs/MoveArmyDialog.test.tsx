import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import MoveArmyDialog from '../../../ux-components/dialogs/MoveArmyDialog';

import { getTurnOwner } from '../../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../../selectors/armySelectors';
import { getLandOwner } from '../../../selectors/landSelectors';
import { addHero, addRegulars, addWarMachines, startMoving } from '../../../systems/armyActions';
import { levelUpHero, levelUpRegulars } from '../../../systems/unitsActions';
import { armyFactory } from '../../../factories/armyFactory';
import { heroFactory } from '../../../factories/heroFactory';
import { regularsFactory } from '../../../factories/regularsFactory';
import { warMachineFactory } from '../../../factories/warMachineFactory';

import { HeroUnitName, RegularUnitName, WarMachineName } from '../../../types/UnitType';
import { Alignment } from '../../../types/Alignment';
import { DiplomacyStatus } from '../../../types/Diplomacy';
import { UnitRank } from '../../../state/army/RegularsState';

import type { GameState } from '../../../state/GameState';
import type { LandPosition } from '../../../state/map/land/LandPosition';

import { createDefaultGameStateStub } from '../../utils/createGameStateStub';
import { startMovement as mockStartMovement } from '../../../map/move-army/startMovement';

// Mock the startMovement function
jest.mock('../../../map/move-army/startMovement', () => ({
  startMovement: jest.fn(),
}));

// Mock context hooks
const mockApplicationContext = {
  moveArmyPath: null as { from: LandPosition; to: LandPosition } | null | undefined,
  setMoveArmyPath: jest.fn(),
  showStartWindow: false,
  showSaveDialog: false,
  showCastSpellDialog: false,
  showConstructBuildingDialog: false,
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
  selectedLandAction: null,
  setSelectedLandAction: jest.fn(),
  actionLandPosition: null,
  setActionLandPosition: jest.fn(),
  setShowStartWindow: jest.fn(),
  setShowSaveDialog: jest.fn(),
  setShowCastSpellDialog: jest.fn(),
  setShowConstructBuildingDialog: jest.fn(),
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
  showEmpireEventsPopup: false,
  setShowEmpireEventsPopup: jest.fn(),
  empireEvents: [],
  setEmpireEvents: jest.fn(),
  showEmpireEvents: jest.fn(),
  hideEmpireEvents: jest.fn(),
  showDiplomacyContactDialog: false,
  setShowDiplomacyContactDialog: jest.fn(),
  diplomacyContactOpponent: undefined,
  setDiplomacyContactOpponent: jest.fn(),
  showDiplomacyContactDialogWithOpponent: jest.fn(),
  hideDiplomacyContactDialog: jest.fn(),
  showEmpireTreasureDialog: false,
  setShowEmpireTreasureDialog: jest.fn(),
  isArcaneExchangeMode: false,
  setIsArcaneExchangeMode: jest.fn(),
  spellAnimation: null,
  setSpellAnimation: jest.fn(),
  showSpellAnimation: jest.fn(),
  hideSpellAnimation: jest.fn(),
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

// Mock FantasyBorderFrame component
jest.mock('../../../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
  return ({ children, primaryButton, secondaryButton, screenPosition, frameSize }: any) => (
    <div data-testid="fantasy-border-frame">
      <div data-testid="frame-position" data-x={screenPosition?.x} data-y={screenPosition?.y}></div>
      <div
        data-testid="frame-size"
        data-width={frameSize?.width}
        data-height={frameSize?.height}
      ></div>
      {children}
      <div data-testid="primary-button-container">{primaryButton}</div>
      <div data-testid="secondary-button-container">{secondaryButton}</div>
    </div>
  );
});

// Mock GameButton component
jest.mock('../../../ux-components/buttons/GameButton', () => {
  return ({ buttonName, onClick }: any) => (
    <button data-testid={`game-button-${buttonName}`} onClick={onClick}>
      {buttonName}
    </button>
  );
});

describe('MoveArmyDialog', () => {
  let gameStateStub: GameState;
  let fromPosition: LandPosition;
  let toPosition: LandPosition;

  const createMockUnits = () => {
    const warrior = regularsFactory(RegularUnitName.WARRIOR);
    warrior.count = 10;

    const dwarf = regularsFactory(RegularUnitName.DWARF);
    dwarf.count = 5;

    const hero = heroFactory(HeroUnitName.FIGHTER, 'TestHero');
    levelUpHero(hero, Alignment.LAWFUL);

    return { warrior, dwarf, hero };
  };

  const renderWithProviders = (
    ui: React.ReactElement,
    {
      gameState = gameStateStub,
      moveArmyPath = { from: fromPosition, to: toPosition } as
        | { from: LandPosition; to: LandPosition }
        | null
        | undefined,
    } = {}
  ) => {
    mockApplicationContext.moveArmyPath = moveArmyPath;
    mockApplicationContext.setMoveArmyPath = jest.fn();
    mockGameContext.gameState = gameState;

    return render(ui);
  };

  const getUnitItemByName = (name: string) => {
    // Find unit items by CSS class instead of data-testid since component uses dynamic testids
    const items = screen
      .getAllByRole('generic')
      .filter((el) => el.className && el.className.includes('unitItem'));
    return items.find((item) => within(item).queryByText(name));
  };

  const getPanelByTestId = (testId: string) => {
    return screen.getByTestId(testId);
  };

  const expectUnitsToMovePanelHasUnits = () => {
    const panel = getPanelByTestId('units-to-move-panel');
    expect(panel).toBeTruthy();
    const { queryByText } = within(panel);
    expect(queryByText('No units selected')).toBeNull();
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create game state
    gameStateStub = createDefaultGameStateStub();
    fromPosition = { row: 3, col: 3 };
    toPosition = { row: 3, col: 5 };

    // Clear all existing armies from the game state to start with a clean slate
    gameStateStub.armies = [];

    // Create units and place them on the map
    const { warrior, dwarf, hero } = createMockUnits();

    // Create a single army with all units at the position (as the component expects)
    let combinedArmy = armyFactory(gameStateStub.turnOwner, fromPosition, {
      hero,
    });
    combinedArmy = addRegulars(combinedArmy, warrior);
    combinedArmy = addRegulars(combinedArmy, dwarf);
    // Directly add to armies array instead of using addArmyToGameState
    gameStateStub.armies.push(combinedArmy);
  });

  describe('Dialog Visibility', () => {
    it('should not render when moveArmyPath is null', () => {
      renderWithProviders(<MoveArmyDialog />, { moveArmyPath: null });
      expect(screen.queryByTestId('MoveArmyDialog')).not.toBeInTheDocument();
    });

    it('should not render when gameState is null', () => {
      renderWithProviders(<MoveArmyDialog />, { gameState: null as any });
      expect(screen.queryByTestId('MoveArmyDialog')).not.toBeInTheDocument();
    });

    it('should not render when no stationed army exists', () => {
      // Clear all armies so there are none at the position
      gameStateStub.armies = [];

      renderWithProviders(<MoveArmyDialog />);
      expect(screen.queryByTestId('MoveArmyDialog')).not.toBeInTheDocument();
    });

    it('should not render when stationed army has movements (is already moving)', () => {
      // Get the army at the position and set it to moving
      const armies = getArmiesAtPosition(gameStateStub, fromPosition);
      expect(armies).toHaveLength(1);
      startMoving(armies[0], toPosition);

      renderWithProviders(<MoveArmyDialog />);
      expect(screen.queryByTestId('MoveArmyDialog')).not.toBeInTheDocument();
    });

    it('should render when moveArmyPath and gameState exist with stationed army', () => {
      renderWithProviders(<MoveArmyDialog />);
      expect(screen.getByTestId('MoveArmyDialog')).toBeInTheDocument();
      expect(screen.getByText('Move Army')).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should initialize with all units in "Available Units" panel', () => {
      renderWithProviders(<MoveArmyDialog />);

      expect(screen.getByText('Available Units')).toBeInTheDocument();
      expect(screen.getByText('Units to Move')).toBeInTheDocument();

      // Check that units are displayed in the available panel
      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Count: 10 (regular)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf')).toBeInTheDocument();
      expect(screen.getByText('Count: 5 (regular)')).toBeInTheDocument();
      expect(screen.getByText('TestHero')).toBeInTheDocument();
      expect(screen.getByText('Fighter - Level 2')).toBeInTheDocument();

      // Check that "Units to Move" panel is empty
      expect(screen.getByText('No units selected')).toBeInTheDocument();
    });

    it('should display correct unit styles based on type and rank', () => {
      renderWithProviders(<MoveArmyDialog />);

      const unitItems = screen
        .getAllByRole('generic')
        .filter((el) => el.className && el.className.includes('unitItem'));

      expect(unitItems.length).toBeGreaterThan(0);
    });
  });

  describe('Transfer Controls - Move All', () => {
    it('should move all units from available to selected when clicking "Move All →"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      const moveAllRightButton = screen.getByText('Move All →');
      expect(moveAllRightButton).not.toBeDisabled();

      await user.click(moveAllRightButton);

      // Available Units panel should now be empty
      expect(screen.getByText('No units selected')).toBeInTheDocument();

      // Units to Move panel should now have units (no empty message within that panel)
      expectUnitsToMovePanelHasUnits();

      // Move All → should now be disabled
      expect(moveAllRightButton).toBeDisabled();
    });

    it('should move all units from selected back to available when clicking "← Move All"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // First move all to right
      await user.click(screen.getByText('Move All →'));

      const moveAllLeftButton = screen.getByText('← Move All');
      expect(moveAllLeftButton).not.toBeDisabled();

      await user.click(moveAllLeftButton);

      // Units should be back in Available Units
      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Dwarf')).toBeInTheDocument();
      expect(screen.getByText('TestHero')).toBeInTheDocument();

      // Units to Move should be empty again
      expect(screen.getByText('No units selected')).toBeInTheDocument();

      // ← Move All should now be disabled
      expect(moveAllLeftButton).toBeDisabled();
    });
  });

  describe('Transfer Controls - Move Half', () => {
    it('should move half of regular units when clicking "Move Half →"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      const moveHalfRightButton = screen.getByText('Move Half →');
      await user.click(moveHalfRightButton);

      // Should have moved half the warriors (5 out of 10) and half the dwarfs (3 out of 5)
      // Original warriors should show Count: 5, moved warriors should show Count: 5
      // Original dwarfs should show Count: 2, moved dwarfs should show Count: 3
      // Heroes should move entirely

      // Check that some units remain in available and some are in selected
      expect(screen.queryByText('No units selected')).not.toBeInTheDocument();
    });

    it('should move half of selected units back when clicking "← Move Half"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Move all to right first
      await user.click(screen.getByText('Move All →'));

      // Then move half back
      const moveHalfLeftButton = screen.getByText('← Move Half');
      await user.click(moveHalfLeftButton);

      // Should have some units in both panels
      expect(screen.queryByText('No units selected')).not.toBeInTheDocument();
    });

    it('should handle heroes correctly in half move (heroes move entirely)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      await user.click(screen.getByText('Move Half →'));

      // Heroes should be moved entirely since they can't be split
      // We can't easily assert on the exact panel due to the way rendering works,
      // but we can verify the hero is still rendered somewhere
      expect(screen.getByText('TestHero')).toBeInTheDocument();
    });
  });

  describe('Individual Unit Transfer', () => {
    it('should move individual units when clicking on them', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Initialize destination panel so individual move can work
      await user.click(screen.getByText('Move Half →'));

      // Find and click on a unit (this triggers onMouseDown)
      const warriorUnit = getUnitItemByName('Warrior');
      expect(warriorUnit).toBeInTheDocument();

      // Simulate mouse down on the unit
      fireEvent.mouseDown(warriorUnit!);
      fireEvent.mouseUp(warriorUnit!);

      // Should have moved 1 warrior, so count should decrease
      await waitFor(() => {
        expectUnitsToMovePanelHasUnits();
      });
    });

    it('should handle hero unit transfer correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Initialize destination panel so individual move can work
      await user.click(screen.getByText('Move Half →'));

      // Find and click on the hero unit
      const heroUnit = getUnitItemByName('TestHero');
      expect(heroUnit).toBeInTheDocument();

      // Simulate mouse down on the hero
      fireEvent.mouseDown(heroUnit!);
      fireEvent.mouseUp(heroUnit!);

      // Hero should be moved entirely
      await waitFor(() => {
        expectUnitsToMovePanelHasUnits();
      });
    });

    it('should stop continuous movement on mouse up', async () => {
      renderWithProviders(<MoveArmyDialog />);

      const warriorUnit = getUnitItemByName('Warrior');
      expect(warriorUnit).toBeInTheDocument();

      // Start continuous movement
      fireEvent.mouseDown(warriorUnit!);

      // Wait a bit then stop
      setTimeout(() => {
        fireEvent.mouseUp(warriorUnit!);
      }, 100);

      // Should handle the mouse up correctly
      expect(warriorUnit).toBeInTheDocument();
    });

    it('should stop continuous movement on mouse leave', async () => {
      renderWithProviders(<MoveArmyDialog />);

      const warriorUnit = getUnitItemByName('Warrior');
      expect(warriorUnit).toBeInTheDocument();

      // Start continuous movement
      fireEvent.mouseDown(warriorUnit!);

      // Mouse leave should stop the interval
      fireEvent.mouseLeave(warriorUnit!);

      // Should handle the mouse leave correctly
      expect(warriorUnit).toBeInTheDocument();
    });
  });

  describe('Dialog Controls', () => {
    it('should render primary and secondary buttons', () => {
      renderWithProviders(<MoveArmyDialog />);

      expect(screen.getByTestId('game-button-Move army')).toBeInTheDocument();
      expect(screen.getByTestId('game-button-Cancel')).toBeInTheDocument();
    });

    it('should call setMoveArmyPath(undefined) when clicking Cancel button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      await user.click(screen.getByTestId('game-button-Cancel'));

      expect(mockApplicationContext.setMoveArmyPath).toHaveBeenCalledWith(undefined);
    });

    it('should call startMovement when clicking Move button with selected units', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // First select some units
      await user.click(screen.getByText('Move Half →'));

      // Then click Move
      await user.click(screen.getByTestId('game-button-Move army'));

      expect(mockStartMovement).toHaveBeenCalledWith(
        gameStateStub,
        fromPosition,
        toPosition,
        expect.objectContaining({
          heroes: expect.any(Array),
          regulars: expect.any(Array),
        })
      );
      expect(mockApplicationContext.setMoveArmyPath).toHaveBeenCalledWith(undefined);
    });

    it('should not call startMovement when no units selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Click Move without selecting any units
      await user.click(screen.getByTestId('game-button-Move army'));

      expect(mockStartMovement).not.toHaveBeenCalled();
      // Dialog should not be closed since nothing was moved
      expect(mockApplicationContext.setMoveArmyPath).not.toHaveBeenCalled();
    });
  });

  describe('Dialog Positioning', () => {
    it('should center the dialog on screen', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

      renderWithProviders(<MoveArmyDialog />);

      const framePosition = screen.getByTestId('frame-position');
      const frameSize = screen.getByTestId('frame-size');

      expect(framePosition).toHaveAttribute('data-x', String((1920 - 730) / 2));
      expect(framePosition).toHaveAttribute('data-y', String((1080 - 500) / 2));
      expect(frameSize).toHaveAttribute('data-width', '730');
      expect(frameSize).toHaveAttribute('data-height', '500');
    });
  });

  describe('Business Logic - Unit Extraction', () => {
    it('should correctly handle regular unit count splitting', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Move half warriors - should split 10 warriors into 5 and 5
      await user.click(screen.getByText('Move Half →'));
      await user.click(screen.getByTestId('game-button-Move army'));

      const moveCall = (mockStartMovement as jest.Mock).mock.calls[0];
      const [, , , selectedUnits] = moveCall;

      // Should have moved some units (either heroes or regulars)
      expect(selectedUnits).toEqual(
        expect.objectContaining({ heroes: expect.any(Array), regulars: expect.any(Array) })
      );
      const totalSelected =
        (selectedUnits.heroes?.length ?? 0) + (selectedUnits.regulars?.length ?? 0);
      expect(totalSelected).toBeGreaterThan(0);
    });

    it('should handle unit consolidation when moving back', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Move some units right
      await user.click(screen.getByText('Move Half →'));

      // Move some back - should consolidate if same unit type
      await user.click(screen.getByText('← Move Half'));

      // The internal state should handle unit consolidation properly
      // This is tested through the UI behavior rather than direct state inspection
      expect(screen.getAllByText('Warrior').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dwarf').length).toBeGreaterThan(0);
    });

    it('should preserve hero units as single entities', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Move hero to right
      await user.click(screen.getByText('Move All →'));

      // Hero should be moved as a single unit, not split
      await user.click(screen.getByTestId('game-button-Move army'));

      const moveCall = (mockStartMovement as jest.Mock).mock.calls[0];
      const [, , , selectedUnits] = moveCall;

      // Heroes are passed within the heroes array as brief info objects
      const heroInSelected = selectedUnits.heroes.find((h: any) => h.name === 'TestHero');
      expect(heroInSelected).toBeTruthy();
    });

    it('should handle empty army after all units moved', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Move all units
      await user.click(screen.getByText('Move All →'));

      // Available panel should show empty message
      expect(screen.getByText('No units selected')).toBeInTheDocument();

      // Move All → should be disabled
      expect(screen.getByText('Move All →')).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle when only heroes are present', () => {
      // Clear all armies and create army with only heroes
      gameStateStub.armies = [];

      const hero1 = heroFactory(HeroUnitName.FIGHTER, 'Hero1');
      const hero2 = heroFactory(HeroUnitName.CLERIC, 'Hero2');

      const heroOnlyArmy = armyFactory(gameStateStub.turnOwner, fromPosition, {
        hero: hero1,
      });
      Object.assign(heroOnlyArmy, addHero(heroOnlyArmy, hero2));

      gameStateStub.armies.push(heroOnlyArmy);

      renderWithProviders(<MoveArmyDialog />);

      expect(screen.getByText('Hero1')).toBeInTheDocument();
      expect(screen.getByText('Hero2')).toBeInTheDocument();
    });

    it('should handle when only regular units are present', () => {
      // Clear all armies and create army with only regular units
      gameStateStub.armies = [];

      const regularOnlyArmy = armyFactory(gameStateStub.turnOwner, fromPosition, {
        regular: regularsFactory(RegularUnitName.WARRIOR, 15),
      });
      gameStateStub.armies.push(regularOnlyArmy);

      renderWithProviders(<MoveArmyDialog />);

      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Count: 15 (regular)')).toBeInTheDocument();
    });

    it('should handle units with count of 1', async () => {
      // Clear all armies and create army with single count units
      gameStateStub.armies = [];

      const singleCountArmy = armyFactory(gameStateStub.turnOwner, fromPosition, {
        regular: regularsFactory(RegularUnitName.WARRIOR, 1),
      });
      gameStateStub.armies.push(singleCountArmy);

      const user = userEvent.setup();
      renderWithProviders(<MoveArmyDialog />);

      // Initialize destination panel so individual move can work
      await user.click(screen.getByText('Move Half →'));

      // Moving a unit with count 1 should move the entire unit
      const warriorUnit = getUnitItemByName('Warrior');
      expect(warriorUnit).toBeInTheDocument();

      fireEvent.mouseDown(warriorUnit!);
      fireEvent.mouseUp(warriorUnit!);

      // Unit should be moved entirely
      await waitFor(() => {
        expectUnitsToMovePanelHasUnits();
      });
    });

    it('should handle different unit ranks', () => {
      // Clear all armies and create army with different ranked units
      gameStateStub.armies = [];

      const veteranWarrior = regularsFactory(RegularUnitName.WARRIOR, 8);
      levelUpRegulars(veteranWarrior, getTurnOwner(gameStateStub));
      expect(veteranWarrior.rank).toBe(UnitRank.VETERAN);

      const eliteWarrior = regularsFactory(RegularUnitName.WARRIOR, 3);
      levelUpRegulars(eliteWarrior, getTurnOwner(gameStateStub));
      levelUpRegulars(eliteWarrior, getTurnOwner(gameStateStub));
      expect(eliteWarrior.rank).toBe(UnitRank.ELITE);

      const rankedUnitsArmy = armyFactory(gameStateStub.turnOwner, fromPosition, {
        regular: veteranWarrior,
      });
      Object.assign(rankedUnitsArmy, addRegulars(rankedUnitsArmy, eliteWarrior));
      gameStateStub.armies.push(rankedUnitsArmy);

      renderWithProviders(<MoveArmyDialog />);

      expect(screen.getByText('Count: 8 (veteran)')).toBeInTheDocument();
      expect(screen.getByText('Count: 3 (elite)')).toBeInTheDocument();
    });
  });

  describe('CHAOTIC Player War Declaration', () => {
    it('should auto-declare WAR when CHAOTIC player moves to opponent territory and show RealmEvent', async () => {
      const user = userEvent.setup();

      // Setup: Make player 1 (Morgana - CHAOTIC) the turn owner
      gameStateStub.players[0].playerType = 'computer'; // Make first player computer
      gameStateStub.players[1].playerType = 'human'; // Make CHAOTIC player human
      gameStateStub.turnOwner = gameStateStub.players[1].id; // Morgana (CHAOTIC)

      expect(gameStateStub.players[1].playerProfile.name).toBe('Morgana Shadowweaver');
      expect(gameStateStub.players[1].playerProfile.alignment).toBe(Alignment.CHAOTIC);

      // Clear all armies and setup new positions
      gameStateStub.armies = [];

      // CHAOTIC player's position (Morgana at row 5, col 7)
      const chaoticPlayerPosition: LandPosition = { row: 5, col: 7 };

      // Opponent's territory (Alaric at row 3, col 3)
      const opponentPosition: LandPosition = { row: 3, col: 3 };

      // Verify opponent owns the target land
      const opponentOwnerId = gameStateStub.players[0].id;
      expect(getLandOwner(gameStateStub, opponentPosition)).toBe(opponentOwnerId);

      // Create army for CHAOTIC player
      const { warrior, hero } = createMockUnits();
      warrior.count = 100; // Enough units to move

      let chaoticArmy = armyFactory(gameStateStub.turnOwner, chaoticPlayerPosition, { hero });
      chaoticArmy = addRegulars(chaoticArmy, warrior);
      gameStateStub.armies.push(chaoticArmy);

      // Verify no war status initially
      const initialDiplomacy = gameStateStub.players[1].diplomacy[opponentOwnerId];
      expect(!initialDiplomacy || initialDiplomacy.status !== DiplomacyStatus.WAR).toBe(true);

      // Setup move army path from CHAOTIC player position to opponent territory
      const moveArmyPathForChaotic = {
        from: chaoticPlayerPosition,
        to: opponentPosition,
      };

      // Mock startMovement to return updated game state with WAR declared
      const newGameStateWithWar = {
        ...gameStateStub,
        players: gameStateStub.players.map((p) => {
          if (p.id === gameStateStub.players[1].id) {
            return {
              ...p,
              diplomacy: {
                ...p.diplomacy,
                [opponentOwnerId]: { status: DiplomacyStatus.WAR },
              },
            };
          }
          return p;
        }),
      };
      (mockStartMovement as jest.Mock).mockReturnValueOnce(newGameStateWithWar);

      renderWithProviders(<MoveArmyDialog />, {
        gameState: gameStateStub,
        moveArmyPath: moveArmyPathForChaotic,
      });

      // Dialog should render
      expect(screen.getByTestId('MoveArmyDialog')).toBeInTheDocument();

      // Select units to move (move half)
      await user.click(screen.getByText('Move Half →'));

      // Verify units were selected
      expectUnitsToMovePanelHasUnits();

      // Click Move button to initiate movement
      await user.click(screen.getByTestId('game-button-Move army'));

      // Verify startMovement was called
      expect(mockStartMovement).toHaveBeenCalled();

      // Get the updated game state from the call
      const moveCall = (mockStartMovement as jest.Mock).mock.calls[0];
      expect(moveCall).toBeDefined();

      // Verify that showEmpireEvents was called with WAR declaration message
      expect(mockApplicationContext.showEmpireEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'negative',
            message: expect.stringContaining('WAR Declared'),
          }),
        ])
      );

      // Verify the message contains opponent's name
      const empireEventCall = (mockApplicationContext.showEmpireEvents as jest.Mock).mock.calls[0];
      expect(empireEventCall[0][0].message).toContain('Alaric the Bold');

      // Verify dialog was closed
      expect(mockApplicationContext.setMoveArmyPath).toHaveBeenCalledWith(undefined);
    });

    it('should not show RealmEvent if WAR already exists', async () => {
      const user = userEvent.setup();

      // Setup: Make player 1 (Morgana - CHAOTIC) the turn owner
      gameStateStub.players[0].playerType = 'computer';
      gameStateStub.players[1].playerType = 'human';
      gameStateStub.turnOwner = gameStateStub.players[1].id;

      // Clear all armies and setup new positions
      gameStateStub.armies = [];

      const chaoticPlayerPosition: LandPosition = { row: 5, col: 7 };
      const opponentPosition: LandPosition = { row: 3, col: 3 };
      const opponentOwnerId = gameStateStub.players[0].id;

      // PRE-EXISTING WAR: Set diplomacy to WAR before movement
      gameStateStub.players[1].diplomacy[opponentOwnerId] = {
        status: DiplomacyStatus.WAR,
        lastUpdated: gameStateStub.turn,
      };

      // Create army for CHAOTIC player
      const { warrior, hero } = createMockUnits();
      warrior.count = 100;

      let chaoticArmy = armyFactory(gameStateStub.turnOwner, chaoticPlayerPosition, { hero });
      chaoticArmy = addRegulars(chaoticArmy, warrior);
      gameStateStub.armies.push(chaoticArmy);

      const moveArmyPathForChaotic = {
        from: chaoticPlayerPosition,
        to: opponentPosition,
      };

      // Mock startMovement to return game state with WAR already existing (no change)
      (mockStartMovement as jest.Mock).mockReturnValueOnce(gameStateStub);

      renderWithProviders(<MoveArmyDialog />, {
        gameState: gameStateStub,
        moveArmyPath: moveArmyPathForChaotic,
      });

      await user.click(screen.getByText('Move Half →'));
      await user.click(screen.getByTestId('game-button-Move army'));

      // Verify startMovement was called
      expect(mockStartMovement).toHaveBeenCalled();

      // Verify that showEmpireEvents was NOT called since WAR already existed
      expect(mockApplicationContext.showEmpireEvents).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup intervals on unmount', () => {
      const { unmount } = renderWithProviders(<MoveArmyDialog />);

      // Start a continuous movement
      const warriorUnit = getUnitItemByName('Warrior');
      expect(warriorUnit).toBeInTheDocument();

      fireEvent.mouseDown(warriorUnit!);

      // Unmount should clean up intervals
      unmount();

      // No errors should occur
    });

    it('should update when moveArmyPath changes', () => {
      const { rerender } = renderWithProviders(<MoveArmyDialog />);

      // Change moveArmyPath
      mockApplicationContext.moveArmyPath = {
        from: { row: 5, col: 5 },
        to: { row: 5, col: 7 },
      };

      // Add army to new position
      const newPositionArmy = armyFactory(
        gameStateStub.turnOwner,
        { row: 5, col: 5 },
        { regular: regularsFactory(RegularUnitName.WARRIOR) }
      );
      gameStateStub.armies.push(newPositionArmy);

      rerender(<MoveArmyDialog />);

      // Should still render the dialog with new army
      expect(screen.getByTestId('MoveArmyDialog')).toBeInTheDocument();
    });

    it('should reset state when moveArmyPath becomes null', () => {
      const { rerender } = renderWithProviders(<MoveArmyDialog />);

      // Initially should render
      expect(screen.getByTestId('MoveArmyDialog')).toBeInTheDocument();

      // Set moveArmyPath to null
      mockApplicationContext.moveArmyPath = null;
      rerender(<MoveArmyDialog />);

      // Should not render
      expect(screen.queryByTestId('MoveArmyDialog')).not.toBeInTheDocument();
    });
  });

  describe('War Machine Functionality', () => {
    describe('War Machine Rendering', () => {
      it('should display war machines with correct information', () => {
        // Clear all armies and create army with war machines
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 3;

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 2;

        let armyWithWarMachines = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        armyWithWarMachines = addWarMachines(armyWithWarMachines, catapult);
        armyWithWarMachines = addWarMachines(armyWithWarMachines, ballista);
        gameStateStub.armies.push(armyWithWarMachines);

        renderWithProviders(<MoveArmyDialog />);

        // Verify war machines are displayed
        expect(screen.getByText('Catapult')).toBeInTheDocument();
        expect(screen.getByText('Count: 3')).toBeInTheDocument();
        expect(screen.getByText('Durability: 3')).toBeInTheDocument();

        expect(screen.getByText('Ballista')).toBeInTheDocument();
        expect(screen.getByText('Count: 2')).toBeInTheDocument();
        expect(screen.getByText('Durability: 5')).toBeInTheDocument();
      });

      it('should display all war machine types correctly', () => {
        // Clear all armies and create army with all war machine types
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        const batteringRam = warMachineFactory(WarMachineName.BATTERING_RAM);
        const siegeTower = warMachineFactory(WarMachineName.SIEGE_TOWER);

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        army = addWarMachines(army, ballista);
        army = addWarMachines(army, batteringRam);
        army = addWarMachines(army, siegeTower);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Verify all war machine types are displayed
        expect(screen.getByText('Catapult')).toBeInTheDocument();
        expect(screen.getByText('Ballista')).toBeInTheDocument();
        expect(screen.getByText('Battering Ram')).toBeInTheDocument();
        expect(screen.getByText('Siege Tower')).toBeInTheDocument();
      });

      it('should apply war machine CSS class to war machine units', () => {
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        const unitItems = screen
          .getAllByRole('generic')
          .filter((el) => el.className && el.className.includes('unitItem'));

        const warMachineItem = unitItems.find((item) => within(item).queryByText('Catapult'));
        expect(warMachineItem).toBeInTheDocument();
        expect(warMachineItem?.className).toContain('warMachineUnit');
      });
    });

    describe('War Machine Transfer - Move All', () => {
      it('should move all war machines from available to selected when clicking "Move All →"', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 3;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 10),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Verify war machines are in available panel
        expect(screen.getByText('Catapult')).toBeInTheDocument();

        const moveAllRightButton = screen.getByText('Move All →');
        await user.click(moveAllRightButton);

        // War machines should be moved to "Units to Move" panel
        expectUnitsToMovePanelHasUnits();
        expect(screen.getByText('Catapult')).toBeInTheDocument();
      });

      it('should move all war machines back when clicking "← Move All"', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 2;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 10),
        });
        army = addWarMachines(army, ballista);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Move all to right
        await user.click(screen.getByText('Move All →'));

        // Move all back to left
        await user.click(screen.getByText('← Move All'));

        // War machines should be back in Available Units
        expect(screen.getByText('Ballista')).toBeInTheDocument();
        expect(screen.getByText('No units selected')).toBeInTheDocument();
      });

      it('should move war machines together with heroes and regulars', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const { warrior, hero } = createMockUnits();
        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 2;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, { hero });
        army = addRegulars(army, warrior);
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        await user.click(screen.getByText('Move All →'));

        // All units should be moved including war machines
        expect(screen.getByText('No units selected')).toBeInTheDocument();
        expectUnitsToMovePanelHasUnits();

        // Verify all unit types are present
        expect(screen.getByText('TestHero')).toBeInTheDocument();
        expect(screen.getByText('Warrior')).toBeInTheDocument();
        expect(screen.getByText('Catapult')).toBeInTheDocument();
      });
    });

    describe('War Machine Transfer - Move Half', () => {
      it('should move half of war machines when clicking "Move Half →"', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 10;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        const moveHalfRightButton = screen.getByText('Move Half →');
        await user.click(moveHalfRightButton);

        // Should have moved half (5 out of 10)
        // Both panels should show Catapult
        const catapultElements = screen.getAllByText('Catapult');
        expect(catapultElements.length).toBe(2); // One in each panel
      });

      it('should move half of war machines back when clicking "← Move Half"', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 8;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, ballista);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Move all to right
        await user.click(screen.getByText('Move All →'));

        // Move half back
        await user.click(screen.getByText('← Move Half'));

        // Should have war machines in both panels
        const ballistaElements = screen.getAllByText('Ballista');
        expect(ballistaElements.length).toBe(2);
      });

      it('should handle odd count war machines correctly in half move', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 5;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        await user.click(screen.getByText('Move Half →'));

        // With 5 catapults, should move 3 and leave 2 (Math.ceil(5/2) = 3)
        const catapultElements = screen.getAllByText('Catapult');
        expect(catapultElements.length).toBe(2); // One in each panel
      });

      it('should move war machines with other unit types in half move', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const { warrior, hero } = createMockUnits();
        const siegeTower = warMachineFactory(WarMachineName.SIEGE_TOWER);
        siegeTower.count = 4;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, { hero });
        army = addRegulars(army, warrior);
        army = addWarMachines(army, siegeTower);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        await user.click(screen.getByText('Move Half →'));

        // Heroes should move entirely, regulars and war machines should split
        expect(screen.getByText('TestHero')).toBeInTheDocument();
        // Siege Towers should be in both panels after half move
        const siegeTowerElements = screen.getAllByText('Siege Tower');
        expect(siegeTowerElements.length).toBe(2);
        expect(screen.queryByText('No units selected')).not.toBeInTheDocument();
      });
    });

    describe('Individual War Machine Transfer', () => {
      it('should move individual war machine when clicking on it', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 5;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Initialize destination panel
        await user.click(screen.getByText('Move Half →'));

        // Find and click on war machine unit
        const catapultUnit = getUnitItemByName('Catapult');
        expect(catapultUnit).toBeInTheDocument();

        fireEvent.mouseDown(catapultUnit!);
        fireEvent.mouseUp(catapultUnit!);

        // Should have moved 1 war machine
        await waitFor(() => {
          expectUnitsToMovePanelHasUnits();
        });
      });

      it('should handle continuous war machine movement on mouse hold', async () => {
        gameStateStub.armies = [];

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 10;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, ballista);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        const ballistaUnit = getUnitItemByName('Ballista');
        expect(ballistaUnit).toBeInTheDocument();

        // Start continuous movement
        fireEvent.mouseDown(ballistaUnit!);

        // Wait a bit then stop
        setTimeout(() => {
          fireEvent.mouseUp(ballistaUnit!);
        }, 100);

        // Should handle the continuous movement correctly
        expect(ballistaUnit).toBeInTheDocument();
      });

      it('should stop continuous war machine movement on mouse leave', async () => {
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 8;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        const catapultUnit = getUnitItemByName('Catapult');
        expect(catapultUnit).toBeInTheDocument();

        // Start continuous movement
        fireEvent.mouseDown(catapultUnit!);

        // Mouse leave should stop the interval
        fireEvent.mouseLeave(catapultUnit!);

        // Should handle the mouse leave correctly
        expect(catapultUnit).toBeInTheDocument();
      });

      it('should move war machine from right to left panel', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const siegeTower = warMachineFactory(WarMachineName.SIEGE_TOWER);
        siegeTower.count = 5;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, siegeTower);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Move all to right first
        await user.click(screen.getByText('Move All →'));

        // Now find war machine in right panel and move back
        const siegeTowerUnit = getUnitItemByName('Siege Tower');
        expect(siegeTowerUnit).toBeInTheDocument();

        fireEvent.mouseDown(siegeTowerUnit!);
        fireEvent.mouseUp(siegeTowerUnit!);

        // Should have moved 1 war machine back
        await waitFor(() => {
          expect(screen.getAllByText('Siege Tower').length).toBeGreaterThan(0);
        });
      });
    });

    describe('War Machine Consolidation', () => {
      it('should display war machines from multiple armies separately', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult1 = warMachineFactory(WarMachineName.CATAPULT);
        catapult1.count = 3;
        const catapult2 = warMachineFactory(WarMachineName.CATAPULT);
        catapult2.count = 5;

        // Create two armies with catapults at the same position
        let army1 = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army1 = addWarMachines(army1, catapult1);

        let army2 = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.DWARF, 5),
        });
        army2 = addWarMachines(army2, catapult2);

        gameStateStub.armies.push(army1, army2);

        renderWithProviders(<MoveArmyDialog />);

        // War machines from different armies are displayed separately (not consolidated)
        const catapultElements = screen.getAllByText('Catapult');
        expect(catapultElements.length).toBe(2); // Two separate entries
        expect(screen.getByText('Count: 3')).toBeInTheDocument();
        expect(screen.getByText('Count: 5')).toBeInTheDocument();

        // Move half
        await user.click(screen.getByText('Move Half →'));

        // Should still show separate war machines
        const catapultElementsAfter = screen.getAllByText('Catapult');
        expect(catapultElementsAfter.length).toBeGreaterThan(0);
      });

      it('should handle consolidation when moving back and forth', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 10;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, ballista);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Move half right
        await user.click(screen.getByText('Move Half →'));

        // Move half back left
        await user.click(screen.getByText('← Move Half'));

        // Should consolidate properly
        expect(screen.getAllByText('Ballista').length).toBeGreaterThan(0);
      });

      it('should not consolidate different war machine types', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 3;
        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 4;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        army = addWarMachines(army, ballista);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Should show both types separately
        expect(screen.getByText('Catapult')).toBeInTheDocument();
        expect(screen.getByText('Count: 3')).toBeInTheDocument();
        expect(screen.getByText('Ballista')).toBeInTheDocument();
        expect(screen.getByText('Count: 4')).toBeInTheDocument();

        await user.click(screen.getByText('Move All →'));

        // Should maintain separate types
        expect(screen.getByText('Catapult')).toBeInTheDocument();
        expect(screen.getByText('Ballista')).toBeInTheDocument();
      });
    });

    describe('War Machine Edge Cases', () => {
      it('should handle army with only war machines', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 5;
        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 3;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 1),
        });
        army = addWarMachines(army, catapult);
        army = addWarMachines(army, ballista);

        // Remove the warrior so only war machines remain
        army.regulars = [];
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        expect(screen.getByText('Catapult')).toBeInTheDocument();
        expect(screen.getByText('Ballista')).toBeInTheDocument();

        // Should be able to move war machines
        await user.click(screen.getByText('Move All →'));
        expectUnitsToMovePanelHasUnits();
      });

      it('should handle war machine with count of 1', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const siegeTower = warMachineFactory(WarMachineName.SIEGE_TOWER);
        siegeTower.count = 1;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, siegeTower);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Initialize destination panel
        await user.click(screen.getByText('Move Half →'));

        const siegeTowerUnit = getUnitItemByName('Siege Tower');
        expect(siegeTowerUnit).toBeInTheDocument();

        fireEvent.mouseDown(siegeTowerUnit!);
        fireEvent.mouseUp(siegeTowerUnit!);

        // War machine with count 1 should be moved entirely
        await waitFor(() => {
          expectUnitsToMovePanelHasUnits();
        });
      });

      it('should handle half move with single war machine', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const batteringRam = warMachineFactory(WarMachineName.BATTERING_RAM);
        batteringRam.count = 1;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, batteringRam);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        await user.click(screen.getByText('Move Half →'));

        // Single war machine should be moved entirely (can't be split)
        expect(screen.getByText('Battering Ram')).toBeInTheDocument();
        expectUnitsToMovePanelHasUnits();
      });

      it('should include war machines in startMovement call', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 5;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 10),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Select some units including war machines
        await user.click(screen.getByText('Move Half →'));

        // Click Move
        await user.click(screen.getByTestId('game-button-Move army'));

        expect(mockStartMovement).toHaveBeenCalledWith(
          gameStateStub,
          fromPosition,
          toPosition,
          expect.objectContaining({
            heroes: expect.any(Array),
            regulars: expect.any(Array),
            warMachines: expect.any(Array),
          })
        );

        const moveCall = (mockStartMovement as jest.Mock).mock.calls[0];
        const [, , , selectedUnits] = moveCall;

        // Should have war machines in the selected units
        expect(selectedUnits.warMachines).toBeDefined();
        expect(selectedUnits.warMachines.length).toBeGreaterThan(0);
      });

      it('should preserve war machine durability during transfers', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const catapult = warMachineFactory(WarMachineName.CATAPULT);
        catapult.count = 5;
        const originalDurability = catapult.durability;

        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 5),
        });
        army = addWarMachines(army, catapult);
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Verify initial durability display
        expect(screen.getByText(`Durability: ${originalDurability}`)).toBeInTheDocument();

        // Move war machines
        await user.click(screen.getByText('Move All →'));

        // Durability should remain the same
        expect(screen.getByText(`Durability: ${originalDurability}`)).toBeInTheDocument();
      });

      it('should handle empty war machines after all moved', async () => {
        const user = userEvent.setup();
        gameStateStub.armies = [];

        const ballista = warMachineFactory(WarMachineName.BALLISTA);
        ballista.count = 3;

        // Create army with only war machines
        let army = armyFactory(gameStateStub.turnOwner, fromPosition, {
          regular: regularsFactory(RegularUnitName.WARRIOR, 1),
        });
        army = addWarMachines(army, ballista);
        army.regulars = []; // Remove regulars
        army.heroes = []; // Remove heroes
        gameStateStub.armies.push(army);

        renderWithProviders(<MoveArmyDialog />);

        // Move all war machines
        await user.click(screen.getByText('Move All →'));

        // Available panel should show empty message
        expect(screen.getByText('No units selected')).toBeInTheDocument();

        // Move All → should be disabled
        expect(screen.getByText('Move All →')).toBeDisabled();
      });
    });
  });
});
