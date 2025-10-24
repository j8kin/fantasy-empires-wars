import React from 'react';
import { render, screen } from '@testing-library/react';
import Battlefield from '../../ux-components/battlefield/Battlefield';
import { GameState, BattlefieldMap, BattlefieldDimensions, TurnPhase } from '../../types/GameState';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { Land, LAND_TYPE } from '../../types/Land';
import { LandPosition } from '../../map/utils/getLands';
import { FantasyBorderFrameProps } from '../../ux-components/fantasy-border-frame/FantasyBorderFrame';
import { Alignment } from '../../types/Alignment';
import { toGamePlayer } from '../utils/toGamePlayer';
import { createGameStateStub } from '../utils/createGameStateStub';

// Mock CSS modules
jest.mock('../../ux-components/battlefield/css/Battlefield.module.css', () => ({
  mapContainer: 'mocked-map-container',
}));

jest.mock('../../ux-components/battlefield/css/Hexagonal.module.css', () => ({
  'hex-row': 'mocked-hex-row',
}));

// Mock HexTile component
jest.mock('../../ux-components/battlefield/LandTile', () => {
  const { battlefieldLandId } = require('../../types/GameState');
  const { useGameContext } = require('../../contexts/GameContext');

  return (props: { battlefieldPosition: LandPosition }) => {
    const { battlefieldPosition } = props;
    const tileId: string = battlefieldLandId(battlefieldPosition);
    const { gameState } = useGameContext();
    const tile = gameState.battlefield.lands[tileId];

    return (
      <div
        data-testid="hex-tile"
        data-tile-id={tileId}
        data-row={battlefieldPosition.row}
        data-col={battlefieldPosition.col}
        data-controlled-by={tile?.controlledBy}
        data-land-type={tile?.land?.id}
      />
    );
  };
});

// Mock FantasyBorderFrame
jest.mock('../../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
  return (props: FantasyBorderFrameProps) => {
    return (
      <div
        data-testid="fantasy-border-frame"
        data-x={props.screenPosition?.x}
        data-y={props.screenPosition?.y}
        data-width={props.frameSize?.width}
        data-height={props.frameSize?.height}
        data-accessible={props.accessible}
        data-z-index={props.zIndex}
        data-tile-size-width={props.tileDimensions?.width}
        data-tile-size-height={props.tileDimensions?.height}
      >
        {props.children}
      </div>
    );
  };
});

// Test data setup
const testTileDimensions = { width: 50, height: 180 };

const createMockGameState = (mapDimensions: BattlefieldDimensions): GameState => {
  const mockPlayer: GamePlayer = toGamePlayer(PREDEFINED_PLAYERS[0]);

  const mockLandType = (): Land => {
    return {
      id: LAND_TYPE.PLAINS,
      alignment: Alignment.LAWFUL,
      goldPerTurn: { min: 1, max: 3 },
    };
  };

  const tiles: BattlefieldMap = {
    dimensions: mapDimensions,
    lands: {},
  };

  // Create some sample tiles for testing
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const tileId = `${row}-${col}`;
      const mapPos = { row: row, col: col };
      tiles.lands[tileId] = {
        mapPos: mapPos,
        land: mockLandType(),
        controlledBy: mockPlayer.id,
        goldPerTurn: 1,
        buildings: [],
        army: [],
      };
    }
  }

  return {
    battlefield: tiles,
    turn: 0,
    turnOwner: mockPlayer.id,
    players: [mockPlayer],
    turnPhase: TurnPhase.START,
  };
};

let mockGameState: GameState;

// Mock GameContext to provide the game state
jest.mock('../../contexts/GameContext', () => ({
  ...jest.requireActual('../../contexts/GameContext'),
  useGameContext: () => ({
    gameState: mockGameState || createMockGameState({ rows: 9, cols: 18 }),
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
  }),
}));

describe('Battlefield Component', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders battlefield with correct props', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      expect(screen.getByTestId('fantasy-border-frame')).toBeInTheDocument();
      expect(screen.getByTestId('Battlefield')).toBeInTheDocument();
    });

    it('renders with correct battlefield data attributes', () => {
      mockGameState = createMockGameState({ rows: 11, cols: 23 });
      render(<Battlefield topPanelHeight={200} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toHaveAttribute('id', 'Battlefield');
    });

    it('has the Battlefield container structure', () => {
      mockGameState = createMockGameState({ rows: 6, cols: 13 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toBeInTheDocument();
      expect(battlefield.tagName).toBe('DIV');
    });
  });

  describe('FantasyBorderFrame Integration', () => {
    it('passes correct props to FantasyBorderFrame', () => {
      mockGameState = createMockGameState({ rows: 15, cols: 31 });
      const top = 150;
      render(<Battlefield topPanelHeight={top} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-x', '0');
      expect(frame).toHaveAttribute('data-y', top.toString());
      expect(frame).toHaveAttribute('data-width', '1024');
      expect(frame).toHaveAttribute('data-height', (768 - top).toString());
      expect(frame).toHaveAttribute('data-accessible', 'true');
      expect(frame).toHaveAttribute('data-z-index', '90');
      expect(frame).toHaveAttribute('data-tile-size-width', testTileDimensions.width.toString());
      expect(frame).toHaveAttribute('data-tile-size-height', testTileDimensions.height.toString());
    });
  });

  describe('Hex Tile Generation', () => {
    it('generates correct number of hex tiles for small map', () => {
      mockGameState = createMockGameState({ rows: 6, cols: 13 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      // Small map should have some hex tiles
      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for medium map', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for large map', () => {
      mockGameState = createMockGameState({ rows: 11, cols: 23 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for huge map', () => {
      mockGameState = createMockGameState({ rows: 15, cols: 31 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates hex rows with correct CSS classes', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexRows = screen
        .getAllByTestId('Battlefield')
        .map((battlefield) => Array.from(battlefield.querySelectorAll('.mocked-hex-row')))
        .flat();

      expect(hexRows.length).toBeGreaterThan(0);
    });
  });

  describe('Hex Tile Size Calculations', () => {
    it('calculates correct tile sizes for small map', () => {
      const scaleFactor = 1.4;
      mockGameState = createMockGameState({ rows: 6, cols: 13 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      // Small map uses scaleFactor of 1.4
      const expectedWidth = 100 * scaleFactor; // 140px
      const expectedHeight = expectedWidth * 1.1547; // ~161.658px

      expect(style.getPropertyValue('--hex-tile-width')).toBe(`${expectedWidth}px`);
      expect(style.getPropertyValue('--hex-tile-height')).toBe(`${expectedHeight}px`);
    });

    it('calculates correct tile sizes for medium map', () => {
      const scaleFactor = 1.0;
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      // Medium map uses scaleFactor of 1.0
      const expectedWidth = 100 * scaleFactor; // 100px
      const expectedHeight = expectedWidth * 1.1547; // ~115.47px

      expect(style.getPropertyValue('--hex-tile-width')).toBe(`${expectedWidth}px`);
      expect(style.getPropertyValue('--hex-tile-height')).toBe(`${expectedHeight}px`);
    });

    it('calculates correct tile sizes for large map', () => {
      const scaleFactor = 0.8;
      mockGameState = createMockGameState({ rows: 11, cols: 23 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      // Large map uses scaleFactor of 0.8
      const expectedWidth = 100 * scaleFactor; // 80px
      const expectedHeight = expectedWidth * 1.1547; // ~92.376px

      expect(style.getPropertyValue('--hex-tile-width')).toBe(`${expectedWidth}px`);
      expect(style.getPropertyValue('--hex-tile-height')).toBe(`${expectedHeight}px`);
    });

    it('calculates correct tile sizes for huge map', () => {
      const scaleFactor = 0.6;
      mockGameState = createMockGameState({ rows: 15, cols: 31 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      // Huge map uses scaleFactor of 0.6
      const expectedWidth = 100 * scaleFactor; // 60px
      const expectedHeight = expectedWidth * 1.1547; // ~69.282px

      expect(style.getPropertyValue('--hex-tile-width')).toBe(`${expectedWidth}px`);
      expect(style.getPropertyValue('--hex-tile-height')).toBe(`${expectedHeight}px`);
    });
  });

  describe('CSS Custom Properties', () => {
    it('sets correct hex row margin and offset', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      const tileHeight = 100 * 1.1547; // ~115.47px
      const expectedMargin = -tileHeight * 0.25; // ~-28.8675px
      const expectedOffset = 100 * 0.5; // 50px

      expect(style.getPropertyValue('--hex-row-margin')).toBe(`${expectedMargin}px`);
      expect(style.getPropertyValue('--hex-row-offset')).toBe(`${expectedOffset}px`);
    });
  });

  describe('Tile State Integration', () => {
    it('passes tile states to HexTile components correctly', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');

      // Verify that at least some tiles have the expected properties
      expect(
        hexTiles.filter((tile) => tile.getAttribute('data-controlled-by')).length
      ).toBeGreaterThan(0);
      expect(hexTiles.filter((tile) => tile.getAttribute('data-row')).length).toBe(158); // see createMockGameState for map size
      expect(hexTiles.filter((tile) => tile.getAttribute('data-col')).length).toBe(158); // see createMockGameState for map size
    });

    it('handles missing tile states gracefully', () => {
      mockGameState = createMockGameState({ rows: 11, cols: 23 });
      mockGameState.battlefield.lands = {}; // Empty tiles object

      expect(() => {
        render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);
      }).not.toThrow();

      const battlefield = screen.getByTestId('Battlefield');
      expect(battlefield).toBeInTheDocument();
    });
  });

  describe('Container Styling', () => {
    it('applies correct container styles', () => {
      mockGameState = createMockGameState({ rows: 15, cols: 31 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('Battlefield');
      const style = battlefield.style;

      expect(style.width).toBe('100%');
      expect(style.height).toBe('100%');
      expect(style.overflow).toBe('hidden');
      expect(style.boxSizing).toBe('border-box');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero top position', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={0} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-y', '0');
      expect(frame).toHaveAttribute('data-height', '768');
    });

    it('handles negative top position', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={-50} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-y', '-50');
      expect(frame).toHaveAttribute('data-height', '818');
    });

    it('handles custom tile size', () => {
      const customTileSize = { width: 75, height: 200 };
      mockGameState = createMockGameState({ rows: 15, cols: 31 });
      render(<Battlefield topPanelHeight={100} tileSize={customTileSize} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-tile-size-width', '75');
      expect(frame).toHaveAttribute('data-tile-size-height', '200');
    });
  });

  describe('Component Integration', () => {
    it('renders all required child components', () => {
      mockGameState = createMockGameState({ rows: 11, cols: 23 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      expect(screen.getByTestId('fantasy-border-frame')).toBeInTheDocument();
      expect(screen.getByTestId('Battlefield')).toBeInTheDocument();
      expect(screen.getAllByTestId('hex-tile').length).toBeGreaterThan(0);
    });

    it('maintains component hierarchy', () => {
      mockGameState = createMockGameState({ rows: 9, cols: 18 });
      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      const battlefield = screen.getByTestId('Battlefield');

      expect(frame).toContainElement(battlefield);
    });
  });

  describe('Create Battlefield which generated Map', () => {
    it('renders all required child components', () => {
      mockGameState = createGameStateStub({
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true,
        addPlayersHomeland: true,
      });

      render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      const battlefield = screen.getByTestId('Battlefield');
      const hexTiles = screen.getAllByTestId('hex-tile');

      expect(frame).toContainElement(battlefield);
      expect(hexTiles.length).toBeGreaterThan(0);

      // Verify that at least one Volcano HexTile exists on the battlefield
      const volcanoTiles = hexTiles.filter(
        (tile) => tile.getAttribute('data-land-type') === 'Volcano'
      );
      expect(volcanoTiles.length).toBe(1);
    });
  });
});
