import React from 'react';
import { render, screen } from '@testing-library/react';
import LandCharacteristicsPopup from '../ux-components/popups/LandCharacteristicsPopup';
import { GameState, HexTileState } from '../types/HexTileState';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { LAND_TYPES } from '../types/Land';
import { initializeMap } from '../map/generation/mapGeneration';

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
    (tile) => tile.landType.id === LAND_TYPES.volcano.id
  )!;

  const mockPosition = { x: 100, y: 100 };
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays building information when tile has buildings', () => {
    render(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
        onClose={mockOnClose}
      />
    );

    // Check if building information is displayed
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
  });

  it('displays controlled by information with player name', () => {
    render(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
        onClose={mockOnClose}
      />
    );

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(mockTileState.landType.id).toBe(LAND_TYPES.volcano.id);
    expect(mockTileState.controlledBy).toBe(mockPlayer.id);
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays both building and control information simultaneously', () => {
    render(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
        onClose={mockOnClose}
      />
    );

    // Verify both sections are present at the same time
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays land type information', () => {
    render(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
        onClose={mockOnClose}
      />
    );

    // Check land type information
    expect(screen.getByText('Volcano')).toBeInTheDocument();
    expect(screen.getByText('chaotic')).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    render(
      <LandCharacteristicsPopup
        battlefieldPosition={mockTileState.mapPos}
        gameState={mockGameState}
        screenPosition={mockPosition}
        onClose={mockOnClose}
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
});
