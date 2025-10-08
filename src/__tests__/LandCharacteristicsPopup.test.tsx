import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';
import LandCharacteristicsPopup from '../ux-components/popups/LandCharacteristicsPopup';
import { GameState, HexTileState } from '../types/HexTileState';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { LAND_TYPE } from '../types/Land';
import { initializeMap } from '../map/generation/mapGeneration';
import { Army, UnitType, getUnit } from '../types/Army';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, { wrapper: ApplicationContextProvider });

// Mock CSS modules
jest.mock('../ux-components/battlefield/css/LandCharacteristicsPopup.module.css', () => ({
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
  const mockPlayer: GamePlayer = PREDEFINED_PLAYERS[1]; // Morgana
  const mapSize = 'medium';
  const mockGameState: GameState = {
    mapSize: mapSize,
    tiles: initializeMap(mapSize, PREDEFINED_PLAYERS.slice(0, 2)),
    turn: 0,
    selectedPlayer: mockPlayer,
    opponents: [PREDEFINED_PLAYERS[0]],
  };

  const mockTileState: HexTileState = Object.values(mockGameState.tiles).find(
    (tile) => tile.landType.id === LAND_TYPE.VOLCANO
  )!;

  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays building information when tile has buildings', () => {
    renderWithProvider(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
      />
    );

    // Check if building information is displayed
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
  });

  it('displays controlled by information with player name', () => {
    renderWithProvider(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
      />
    );

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(mockTileState.landType.id).toBe(LAND_TYPE.VOLCANO);
    expect(mockTileState.controlledBy).toBe(mockPlayer.id);
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays both building and control information simultaneously', () => {
    renderWithProvider(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
      />
    );

    // Verify both sections are present at the same time
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays land type information', () => {
    renderWithProvider(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
      />
    );

    // Check land type information
    expect(screen.getByText('Volcano')).toBeInTheDocument();
    expect(screen.getByText('chaotic')).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    renderWithProvider(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
      />
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
        { unit: getUnit(UnitType.FIGHTER), count: 1 },
        { unit: getUnit(UnitType.PYROMANCER), count: 1 },
      ];

      const tileWithHeroes = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithHeroes,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithArmy}
          screenPosition={mockPosition}
        />
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Pyromancer lvl: 1')).toBeInTheDocument();
    });

    it('displays units when tile has non-hero units', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.WARRIOR), count: 5 },
        { unit: getUnit(UnitType.DWARF), count: 3 },
      ];

      const tileWithUnits = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithUnits,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithArmy}
          screenPosition={mockPosition}
        />
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (5)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (3)')).toBeInTheDocument();
    });

    it('displays both heroes and units when tile has mixed army', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.FIGHTER), count: 1 }, // Hero
        { unit: getUnit(UnitType.WARRIOR), count: 5 }, // Unit
        { unit: getUnit(UnitType.CLERIC), count: 1 }, // Hero
        { unit: getUnit(UnitType.ELF), count: 2 }, // Unit
      ];

      const tileWithMixedArmy = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithMixedArmy,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithArmy}
          screenPosition={mockPosition}
        />
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
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithoutArmy,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithoutArmy}
          screenPosition={mockPosition}
        />
      );

      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only heroes section when tile has only heroes', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.RANGER), count: 1 },
        { unit: getUnit(UnitType.NECROMANCER), count: 1 },
      ];

      const tileWithHeroesOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithHeroesOnly,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithArmy}
          screenPosition={mockPosition}
        />
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Ranger lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Necromancer lvl: 1')).toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only units section when tile has only non-hero units', () => {
      const mockArmy: Army = [
        { unit: getUnit(UnitType.ORC), count: 4 },
        { unit: getUnit(UnitType.BALISTA), count: 1 },
      ];

      const tileWithUnitsOnly = {
        ...mockTileState,
        army: mockArmy,
      };

      const tileId = `${mockTileState.mapPos.row}-${mockTileState.mapPos.col}`;
      const gameStateWithArmy = {
        ...mockGameState,
        tiles: {
          ...mockGameState.tiles,
          [tileId]: tileWithUnitsOnly,
        },
      };

      renderWithProvider(
        <LandCharacteristicsPopup
          battlefieldPosition={mockTileState.mapPos}
          gameState={gameStateWithArmy}
          screenPosition={mockPosition}
        />
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Orc (4)')).toBeInTheDocument();
      expect(screen.getByText('Balista (1)')).toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
    });
  });
});
