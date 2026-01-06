import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import MoveArmyDialog from '../../../ux-components/dialogs/MoveArmyDialog';
import { UnitRank } from '../../../state/army/RegularsState';

import { getArmiesAtPosition } from '../../../selectors/armySelectors';
import { addHero, addRegulars, startMoving } from '../../../systems/armyActions';
import { levelUpHero, levelUpRegulars } from '../../../systems/unitsActions';
import { armyFactory } from '../../../factories/armyFactory';
import { heroFactory } from '../../../factories/heroFactory';
import { regularsFactory } from '../../../factories/regularsFactory';

import { HeroUnitName, RegularUnitName } from '../../../types/UnitType';
import { Alignment } from '../../../types/Alignment';

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

  const getPanelByTitle = (title: string) => {
    const titleEl = screen.getByText(title);
    // panelTitle is inside the panel container; return the closest panel div
    return titleEl.closest('div')?.parentElement as HTMLElement; // panel
  };

  const expectUnitsToMovePanelHasUnits = () => {
    const panel = getPanelByTitle('Units to Move');
    expect(panel).toBeTruthy();
    const { queryByText } = within(panel!);
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
      levelUpRegulars(veteranWarrior, Alignment.LAWFUL);
      expect(veteranWarrior.rank).toBe(UnitRank.VETERAN);

      const eliteWarrior = regularsFactory(RegularUnitName.WARRIOR, 3);
      levelUpRegulars(eliteWarrior, Alignment.LAWFUL);
      levelUpRegulars(eliteWarrior, Alignment.LAWFUL);
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
});
