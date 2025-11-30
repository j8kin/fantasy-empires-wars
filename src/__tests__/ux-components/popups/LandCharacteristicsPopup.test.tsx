import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import LandCharacteristicsPopup from '../../../ux-components/popups/LandCharacteristicsPopup';

import { GameState } from '../../../state/GameState';
import { LandState } from '../../../state/map/land/LandState';
import { Armies } from '../../../state/army/ArmyState';

import { getLandOwner } from '../../../selectors/landSelectors';
import { getPlayerLands } from '../../../selectors/playerSelectors';
import { startMoving } from '../../../systems/armyActions';
import { armyFactory } from '../../../factories/armyFactory';
import { heroFactory } from '../../../factories/heroFactory';
import { regularsFactory } from '../../../factories/regularsFactory';

import { HeroUnitType, RegularUnitType } from '../../../types/UnitType';
import { BuildingType } from '../../../types/Building';

import { createGameStateStub } from '../../utils/createGameStateStub';

// Mock the useGameContext hook
const mockUseGameContext = jest.fn();
jest.mock('../../../contexts/GameContext', () => ({
  useGameContext: () => mockUseGameContext(),
}));

const renderWithProviders = (ui: React.ReactElement, gameState: GameState) => {
  mockUseGameContext.mockReturnValue({ gameState });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApplicationContextProvider>{children}</ApplicationContextProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

// Mock CSS modules
jest.mock('../../../ux-components/popups/css/LandCharacteristicsPopup.module.css', () => ({
  header: 'mocked-header',
  title: 'mocked-title',
  row: 'mocked-row',
  label: 'mocked-label',
  buildingsList: 'mocked-buildings-list',
  building: 'mocked-building',
}));

jest.mock('../../../ux-components/popups/css/Popup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
  characteristics: 'mocked-characteristics',
  row: 'mocked-row',
  label: 'mocked-label',
  value: 'mocked-value',
}));

describe('LandCharacteristicsPopup', () => {
  let gameStateStub: GameState;
  let mockTileState: LandState;
  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    // Create fresh game state with real battlefield for each test
    gameStateStub = createGameStateStub({
      realBattlefield: true,
    });

    // Find a tile that's controlled by player 1 (Morgana Shadowweaver) AND has buildings
    mockTileState = getPlayerLands(gameStateStub, gameStateStub.players[1].id).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    jest.clearAllMocks();
  });

  it('displays building information when tile has buildings', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      gameStateStub
    );

    // Check if building information is displayed
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
  });

  it('displays controlled by information with player name', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      gameStateStub
    );

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(getLandOwner(gameStateStub, mockTileState.mapPos)).toBe(gameStateStub.players[1].id);
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays both building and control information simultaneously', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      gameStateStub
    );

    // Verify both sections are present at the same time
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays land type information', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      gameStateStub
    );

    // Check land type information - should display the actual land type name
    expect(screen.getByText(mockTileState.land.id)).toBeInTheDocument();
    expect(screen.getByText(mockTileState.land.alignment)).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      gameStateStub
    );

    // Check position and gold information
    expect(screen.getByText('Position:')).toBeInTheDocument();
    expect(
      screen.getByText(mockTileState.mapPos.row + ', ' + mockTileState.mapPos.col)
    ).toBeInTheDocument();
    expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
    expect(screen.getByText(mockTileState.goldPerTurn.toString())).toBeInTheDocument();
  });

  describe('Army display functionality', () => {
    it('displays heroes when tile has heroes', () => {
      const army1 = armyFactory(gameStateStub.turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
      ]);
      const army2 = armyFactory(gameStateStub.turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.PYROMANCER, HeroUnitType.PYROMANCER),
      ]);
      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system instead of land.army
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Pyromancer lvl: 1')).toBeInTheDocument();
    });

    it('displays multiple heroes of same type with different names', () => {
      const turnOwner = gameStateStub.turnOwner;
      const fighter1 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Cedric Brightshield'),
      ]);

      const fighter2 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Rowan Ashborne'),
      ]);

      const fighter3 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Gareth Dawnhart'),
      ]);

      const mockArmy: Armies = [fighter1, fighter2, fighter3];

      // Add armies to centralized system instead of land.army
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Cedric Brightshield lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Rowan Ashborne lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Gareth Dawnhart lvl: 1')).toBeInTheDocument();
    });

    it('displays units when tile has non-hero units', () => {
      const turnOwner = gameStateStub.turnOwner;
      const army1 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.WARRIOR),
      ]);
      const army2 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.DWARF),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system instead of land.army
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (20)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (20)')).toBeInTheDocument();
    });

    it('displays both heroes and units when tile has mixed army', () => {
      const regularWarriors = regularsFactory(RegularUnitType.WARRIOR);
      regularWarriors.count = 5;

      const turnOwner = gameStateStub.turnOwner;
      const army1 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
      ]);
      const army2 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [regularWarriors]);
      const army3 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.DWARF),
      ]);
      startMoving(army3, { row: 1, col: 1 });
      const army4 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
      ]);
      const army5 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.ELF),
      ]);

      const mockArmy: Armies = [army1, army2, army3, army4, army5];

      // Add armies to centralized system instead of land.army
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      // Check heroes section
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Cleric lvl: 1')).toBeInTheDocument();

      // Check units section
      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (5)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (20)')).toBeInTheDocument(); // moving army should also be displayed
      expect(screen.getByText('Elf (20)')).toBeInTheDocument();
    });

    it('does not display army sections when tile has no army', () => {
      // Filter out any armies that might be at this position
      const gameStateWithoutArmy = {
        ...gameStateStub,
        armies: gameStateStub.armies.filter((army) => {
          const armyPosition = army.movement.path[0];
          return !(
            armyPosition.row === mockTileState.mapPos.row &&
            armyPosition.col === mockTileState.mapPos.col
          );
        }),
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithoutArmy
      );

      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only heroes section when tile has only heroes', () => {
      const turnOwner = gameStateStub.turnOwner;
      const army1 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.RANGER, HeroUnitType.RANGER),
      ]);
      const army2 = armyFactory(turnOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system instead of land.army
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Ranger lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Necromancer lvl: 1')).toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only units section when tile has only non-hero units', () => {
      const turnOwner = gameStateStub.turnOwner;
      const army1 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.ORC),
      ]);
      const army2 = armyFactory(turnOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.BALLISTA),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Filter out any existing armies at this position and add only our test armies
      const gameStateWithArmy = {
        ...gameStateStub,
        armies: [
          ...gameStateStub.armies.filter((army) => {
            const armyPosition = army.movement.path[0];
            return !(
              armyPosition.row === mockTileState.mapPos.row &&
              armyPosition.col === mockTileState.mapPos.col
            );
          }),
          ...mockArmy,
        ],
      };

      renderWithProviders(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          screenPosition={mockPosition}
        />,
        gameStateWithArmy
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Orc (20)')).toBeInTheDocument();
      expect(screen.getByText('Ballista (1)')).toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
    });
  });
});
