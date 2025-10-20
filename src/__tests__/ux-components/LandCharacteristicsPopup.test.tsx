import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';
import LandCharacteristicsPopup from '../../ux-components/popups/LandCharacteristicsPopup';
import { GameState, LandState } from '../../types/GameState';
import { PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { LAND_TYPE } from '../../types/Land';
import { generateMap } from '../../map/generation/generateMap';
import { addPlayerToMap } from '../../map/generation/addPlayerToMap';
import { Army, UnitType, getUnit } from '../../types/Army';
import { toGamePlayer } from '../utils/toGamePlayer';

const renderWithProviders = (ui: React.ReactElement, gameState?: GameState) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApplicationContextProvider>
      <TestGameProvider gameState={gameState}>{children}</TestGameProvider>
    </ApplicationContextProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

// Mock the useGameContext hook
let mockUseGameContext: jest.Mock;
jest.mock('../../contexts/GameContext', () => ({
  useGameContext: jest.fn(),
}));

// Get the mocked function after module mocking
const { useGameContext } = require('../../contexts/GameContext');
mockUseGameContext = useGameContext as jest.Mock;

// Custom GameProvider for testing that accepts a specific gameState
const TestGameProvider: React.FC<{ children: React.ReactNode; gameState?: GameState }> = ({
  children,
  gameState,
}) => {
  // Update the mock if a specific gameState is provided
  if (gameState) {
    mockUseGameContext.mockReturnValue({
      gameState,
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameConfig: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });
  }

  return <>{children}</>;
};

// Mock CSS modules
jest.mock('../../ux-components/popups/css/LandCharacteristicsPopup.module.css', () => ({
  popup: 'mocked-popup',
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
  closeButton: 'mocked-close-button',
  characteristics: 'mocked-characteristics',
  row: 'mocked-row',
  label: 'mocked-label',
  value: 'mocked-value',
  buildingsList: 'mocked-buildings-list',
  building: 'mocked-building',
}));

describe('LandCharacteristicsPopup', () => {
  const testPlayers = PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer);
  const mockGameState: GameState = {
    battlefield: generateMap({ rows: 9, cols: 18 }),
    turn: 0,
    selectedPlayer: testPlayers[1], // Morgana
    opponents: [testPlayers[0], testPlayers[2]],
  };
  addPlayerToMap(mockGameState);

  const mockTileState: LandState = Object.values(mockGameState.battlefield.lands).find(
    (tile) => tile.land.id === LAND_TYPE.VOLCANO
  )!;

  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock return for useGameContext
    mockUseGameContext.mockReturnValue({
      gameState: mockGameState,
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameConfig: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });
  });

  it('displays building information when tile has buildings', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      mockGameState
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
      mockGameState
    );

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(mockTileState.land.id).toBe(LAND_TYPE.VOLCANO);
    expect(mockTileState.controlledBy).toBe(testPlayers[1].id);
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays both building and control information simultaneously', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      mockGameState
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
      mockGameState
    );

    // Check land type information
    expect(screen.getByText('Volcano')).toBeInTheDocument();
    expect(screen.getByText('chaotic')).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    renderWithProviders(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        screenPosition={mockPosition}
      />,
      mockGameState
    );

    // Check position and gold information
    expect(screen.getByText('Position:')).toBeInTheDocument();
    expect(
      screen.getByText(mockTileState.mapPos.row + ', ' + mockTileState.mapPos.col)
    ).toBeInTheDocument();
    expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
    expect(screen.getByText(mockTileState.goldPerTurn)).toBeInTheDocument();
  });

  describe('Army display functionality', () => {
    it('displays heroes when tile has heroes', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.FIGHTER), quantity: 1 },
        { unit: getUnit(UnitType.PYROMANCER), quantity: 1 },
      ];

      const tileWithHeroes = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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

    it('displays units when tile has non-hero units', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.WARRIOR), quantity: 5 },
        { unit: getUnit(UnitType.DWARF), quantity: 3 },
      ];

      const tileWithUnits = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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
      expect(screen.getByText('Warrior (5)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (3)')).toBeInTheDocument();
    });

    it('displays both heroes and units when tile has mixed army', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.FIGHTER), quantity: 1 }, // Hero
        { unit: getUnit(UnitType.WARRIOR), quantity: 5 }, // Unit
        { unit: getUnit(UnitType.CLERIC), quantity: 1 }, // Hero
        { unit: getUnit(UnitType.ELF), quantity: 2 }, // Unit
      ];

      const tileWithMixedArmy = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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
      expect(screen.getByText('Elf (2)')).toBeInTheDocument();
    });

    it('does not display army sections when tile has no army', () => {
      const tileWithoutArmy = {
        ...mockTileState,
        army: [],
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithoutArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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
      const mockArmy: Army = [
        { unit: getUnit(UnitType.RANGER), quantity: 1 },
        { unit: getUnit(UnitType.NECROMANCER), quantity: 1 },
      ];

      const tileWithHeroesOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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
      const mockArmy: Army = [
        { unit: getUnit(UnitType.ORC), quantity: 4 },
        { unit: getUnit(UnitType.BALISTA), quantity: 1 },
      ];

      const tileWithUnitsOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        battlefield: {
          ...mockGameState.battlefield,
          lands: {
            ...mockGameState.battlefield.lands,
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
      expect(screen.getByText('Orc (4)')).toBeInTheDocument();
      expect(screen.getByText('Balista (1)')).toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
    });
  });
});
