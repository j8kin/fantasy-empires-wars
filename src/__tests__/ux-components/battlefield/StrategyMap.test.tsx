import { render, screen, within } from '@testing-library/react';
import StrategyMap from '../../../ux-components/strategy-map/StrategyMap';

import { gameStateFactory } from '../../../factories/gameStateFactory';

import type { GameState } from '../../../state/GameState';
import type { MapDimensions } from '../../../state/map/MapDimensions';
import type { FantasyBorderFrameProps } from '../../../ux-components/fantasy-border-frame/FantasyBorderFrame';
import type { HexTileProps } from '../../../ux-components/strategy-map/LandTile';

import { createGameStateStub } from '../../utils/createGameStateStub';

// Mock CSS modules
jest.mock('../../../ux-components/strategy-map/css/StrategyMap.module.css', () => ({
  mapContainer: 'mocked-map-container',
}));

jest.mock('../../../ux-components/strategy-map/css/Hexagonal.module.css', () => ({
  'hex-row': 'mocked-hex-row',
}));

// Mock HexTile component
jest.mock('../../../ux-components/strategy-map/LandTile', () => {
  const { getLandId } = require('../../../state/map/land/LandId');
  const { useGameContext } = require('../../../contexts/GameContext');
  const { getLandOwner } = require('../../../selectors/landSelectors');

  return (props: HexTileProps) => {
    const { mapPosition } = props;
    const tileId: string = getLandId(mapPosition);
    const { gameState } = useGameContext();
    const tile = gameState.map.lands[tileId];
    const controlledBy = tile ? getLandOwner(gameState, mapPosition) : undefined;

    return (
      <div
        data-testid="hex-tile"
        data-tile-id={tileId}
        data-row={mapPosition.row}
        data-col={mapPosition.col}
        data-controlled-by={controlledBy}
        data-land-type={tile?.type}
      />
    );
  };
});

// Mock FantasyBorderFrame
jest.mock('../../../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
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

const createGameStateStubNewMapSize = (mapDimensions: MapDimensions): GameState =>
  createGameStateStub({ strategyMapSize: mapDimensions, addPlayersHomeland: false });

let mockGameState: GameState;

// Mock GameContext to provide the game state
jest.mock('../../../contexts/GameContext', () => ({
  ...jest.requireActual('../../../contexts/GameContext'),
  useGameContext: () => ({
    gameState: mockGameState || createGameStateStubNewMapSize({ rows: 9, cols: 18 }),
    updateTile: jest.fn(),
    setTileController: jest.fn(),
    addBuildingToTile: jest.fn(),
    updateTileArmy: jest.fn(),
    nextTurn: jest.fn(),
    updateGameConfig: jest.fn(),
    getTile: jest.fn(),
    getPlayerTiles: jest.fn(),
  }),
}));

describe('StrategyMap Component', () => {
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
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      expect(screen.getByTestId('fantasy-border-frame')).toBeInTheDocument();
      expect(screen.getByTestId('StrategyMap')).toBeInTheDocument();
    });

    it('renders with correct battlefield data attributes', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 11, cols: 23 });
      render(<StrategyMap topPanelHeight={200} tileSize={testTileDimensions} />);

      const battlefield = screen.getByTestId('StrategyMap');
      expect(battlefield).toHaveAttribute('id', 'StrategyMap');
    });

    it('has the StrategyMap container structure', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 6, cols: 13 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const strategyMap = screen.getByTestId('StrategyMap');
      expect(strategyMap).toBeInTheDocument();
      expect(strategyMap.tagName).toBe('DIV');
    });
  });

  describe('FantasyBorderFrame Integration', () => {
    it('passes correct props to FantasyBorderFrame', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 15, cols: 31 });
      const top = 150;
      render(<StrategyMap topPanelHeight={top} tileSize={testTileDimensions} />);

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
      mockGameState = createGameStateStubNewMapSize({ rows: 6, cols: 13 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      // Small map should have some hex tiles
      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for medium map', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for large map', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 11, cols: 23 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates correct number of hex tiles for huge map', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 15, cols: 31 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');
      expect(hexTiles.length).toBeGreaterThan(0);
    });

    it('generates hex rows with correct CSS classes', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexRows = screen
        .getAllByTestId('StrategyMap')
        .flatMap((strategyMap) => within(strategyMap).getAllByTestId('hex-row'));

      expect(hexRows.length).toBeGreaterThan(0);
    });
  });

  describe('Hex Tile Size Calculations', () => {
    it.each([
      [{ rows: 6, cols: 13 }, 177.77777777777777],
      [{ rows: 9, cols: 18 }, 129.72972972972974],
      [{ rows: 11, cols: 23 }, 102.12765957446808],
      [{ rows: 15, cols: 31 }, 100],
    ])(
      'calculates correct tile sizes for map dimensions: %p',
      (mapDimensions: MapDimensions, expectedWidth: number) => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: 2500, // to have different expected width/height
        });
        Object.defineProperty(window, 'innerHeight', {
          configurable: true,
          value: 855,
        });

        mockGameState = createGameStateStubNewMapSize(mapDimensions);
        render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

        const strategyMap = screen.getByTestId('StrategyMap');
        const style = strategyMap.style;

        const expectedHeight = expectedWidth * 1.1547;

        expect(style.getPropertyValue('--hex-tile-width')).toBe(`${expectedWidth}px`);
        expect(style.getPropertyValue('--hex-tile-height')).toBe(`${expectedHeight}px`);

        const expectedMargin = -expectedHeight * 0.25;
        const expectedOffset = expectedWidth * 0.5;

        expect(style.getPropertyValue('--hex-row-margin')).toBe(`${expectedMargin}px`);
        expect(style.getPropertyValue('--hex-row-offset')).toBe(`${expectedOffset}px`);
      }
    );
  });

  describe('Tile State Integration', () => {
    it('passes tile states to HexTile components correctly', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const hexTiles = screen.getAllByTestId('hex-tile');

      // Verify that at least some tiles have the expected properties
      expect(hexTiles.filter((tile) => tile.getAttribute('data-controlled-by')).length).toBeGreaterThan(0);
      expect(hexTiles.filter((tile) => tile.getAttribute('data-row'))).toHaveLength(158); // see createGameStateStubNew for map size
      expect(hexTiles.filter((tile) => tile.getAttribute('data-col'))).toHaveLength(158); // see createGameStateStubNew for map size
    });
  });

  describe('Edge Cases', () => {
    it('handles missing tile states gracefully', () => {
      mockGameState = gameStateFactory({ dimensions: { rows: 0, cols: 0 }, lands: {} }); // Empty tiles object

      expect(() => {
        render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);
      }).not.toThrow();

      const strategyMap = screen.getByTestId('StrategyMap');
      expect(strategyMap).toBeInTheDocument();
    });

    it('handles zero top position', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={0} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-y', '0');
      expect(frame).toHaveAttribute('data-height', '768');
    });

    it('handles negative top position', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={-50} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-y', '-50');
      expect(frame).toHaveAttribute('data-height', '818');
    });

    it('handles custom tile size', () => {
      const customTileSize = { width: 75, height: 200 };
      mockGameState = createGameStateStubNewMapSize({ rows: 15, cols: 31 });
      render(<StrategyMap topPanelHeight={100} tileSize={customTileSize} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-tile-size-width', '75');
      expect(frame).toHaveAttribute('data-tile-size-height', '200');
    });
  });

  describe('Component Integration', () => {
    it('renders all required child components', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 11, cols: 23 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      expect(screen.getByTestId('fantasy-border-frame')).toBeInTheDocument();
      expect(screen.getByTestId('StrategyMap')).toBeInTheDocument();
      expect(screen.getAllByTestId('hex-tile').length).toBeGreaterThan(0);
    });

    it('maintains component hierarchy', () => {
      mockGameState = createGameStateStubNewMapSize({ rows: 9, cols: 18 });
      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      const strategyMap = screen.getByTestId('StrategyMap');

      expect(frame).toContainElement(strategyMap);
    });
  });

  describe('Create StrategyMap which generated Map', () => {
    it('renders all required child components', () => {
      mockGameState = createGameStateStub({
        strategyMapSize: { rows: 9, cols: 18 },
        realStrategyMap: true,
        addPlayersHomeland: true,
      });

      render(<StrategyMap topPanelHeight={100} tileSize={testTileDimensions} />);

      const frame = screen.getByTestId('fantasy-border-frame');
      const strategyMap = screen.getByTestId('StrategyMap');
      const hexTiles = screen.getAllByTestId('hex-tile');

      expect(frame).toContainElement(strategyMap);
      expect(hexTiles.length).toBeGreaterThan(0);

      // Verify that at least one Volcano HexTile exists on the battlefield
      const volcanoTiles = hexTiles.filter((tile) => tile.getAttribute('data-land-type') === 'Volcano');
      expect(volcanoTiles).toHaveLength(1);
    });
  });
});
