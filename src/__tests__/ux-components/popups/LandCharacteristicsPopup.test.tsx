import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import LandCharacteristicsPopup from '../../../ux-components/popups/LandCharacteristicsPopup';
import { getLandId, GameState, LandState } from '../../../state/GameState';
import {
  Armies,
  getDefaultUnit,
  HeroUnit,
  HeroUnitType,
  RegularUnit,
  RegularUnitType,
} from '../../../types/Army';
import { createGameStateStub } from '../../utils/createGameStateStub';
import { getLands } from '../../../map/utils/getLands';
import { BuildingType } from '../../../types/Building';

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
      turnOwner: 1,
      realBattlefield: true,
    });

    // Find a tile that's controlled by player 1 (Morgana Shadowweaver) AND has buildings
    mockTileState = getLands({
      gameState: gameStateStub,
      players: [gameStateStub.players[1].playerId],
      buildings: [BuildingType.STRONGHOLD],
    })[0];

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
    expect(mockTileState.controlledBy).toBe(gameStateStub.players[1].playerId);
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
      const mockArmy: Armies = [
        { units: [getDefaultUnit(HeroUnitType.FIGHTER)], controlledBy: gameStateStub.turnOwner },
        { units: [getDefaultUnit(HeroUnitType.PYROMANCER)], controlledBy: gameStateStub.turnOwner },
      ];

      const tileWithHeroes = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithHeroes,
          },
        },
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
      const fighter1 = getDefaultUnit(HeroUnitType.FIGHTER) as HeroUnit;
      fighter1.name = 'Cedric Brightshield';

      const fighter2 = getDefaultUnit(HeroUnitType.FIGHTER) as HeroUnit;
      fighter2.name = 'Rowan Ashborne';

      const fighter3 = getDefaultUnit(HeroUnitType.FIGHTER) as HeroUnit;
      fighter3.name = 'Gareth Dawnhart';

      const mockArmy: Armies = [
        { units: [fighter1], controlledBy: gameStateStub.turnOwner },
        { units: [fighter2], controlledBy: gameStateStub.turnOwner },
        { units: [fighter3], controlledBy: gameStateStub.turnOwner },
      ];

      const tileWithHeroes = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithHeroes,
          },
        },
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
      const mockArmy: Armies = [
        { units: [getDefaultUnit(RegularUnitType.WARRIOR)], controlledBy: gameStateStub.turnOwner },
        { units: [getDefaultUnit(RegularUnitType.DWARF)], controlledBy: gameStateStub.turnOwner },
      ];

      const tileWithUnits = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithUnits,
          },
        },
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
      const regularWarriors = getDefaultUnit(RegularUnitType.WARRIOR) as RegularUnit;
      regularWarriors.count = 5;

      const mockArmy: Armies = [
        { units: [getDefaultUnit(HeroUnitType.FIGHTER)], controlledBy: gameStateStub.turnOwner },
        { units: [regularWarriors], controlledBy: gameStateStub.turnOwner },
        {
          units: [getDefaultUnit(RegularUnitType.DWARF)],
          movements: {
            from: { row: 0, col: 0 },
            to: { row: 1, col: 1 },
            mp: 0,
            path: [],
          },
          controlledBy: gameStateStub.turnOwner,
        }, // moving army should also be displayed
        { units: [getDefaultUnit(HeroUnitType.CLERIC)], controlledBy: gameStateStub.turnOwner },
        { units: [getDefaultUnit(RegularUnitType.ELF)], controlledBy: gameStateStub.turnOwner },
      ];

      const tileWithMixedArmy = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithMixedArmy,
          },
        },
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
      const tileWithoutArmy = {
        ...mockTileState,
        army: [],
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithoutArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithoutArmy,
          },
        },
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
      const mockArmy: Armies = [
        { units: [getDefaultUnit(HeroUnitType.RANGER)], controlledBy: gameStateStub.turnOwner },
        {
          units: [getDefaultUnit(HeroUnitType.NECROMANCER)],
          controlledBy: gameStateStub.turnOwner,
        },
      ];

      const tileWithHeroesOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithHeroesOnly,
          },
        },
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
      const mockArmy: Armies = [
        { units: [getDefaultUnit(RegularUnitType.ORC)], controlledBy: gameStateStub.turnOwner },
        {
          units: [getDefaultUnit(RegularUnitType.BALLISTA)],
          controlledBy: gameStateStub.turnOwner,
        },
      ];

      const tileWithUnitsOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = getLandId(mockTileState.mapPos);
      const gameStateWithArmy = {
        ...gameStateStub,
        battlefield: {
          ...gameStateStub.battlefield,
          lands: {
            ...gameStateStub.battlefield.lands,
            [tileId]: tileWithUnitsOnly,
          },
        },
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
