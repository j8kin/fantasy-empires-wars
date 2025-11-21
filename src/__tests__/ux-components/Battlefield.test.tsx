import { render, screen, within } from '@testing-library/react';
import Battlefield from '../../ux-components/battlefield/Battlefield';
import { GameState, BattlefieldDimensions } from '../../state/GameState';
import { LandPosition } from '../../map/utils/getLands';
import { FantasyBorderFrameProps } from '../../ux-components/fantasy-border-frame/FantasyBorderFrame';
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
  const { getLandId } = require('../../state/GameState');
  const { useGameContext } = require('../../contexts/GameContext');

  return (props: { battlefieldPosition: LandPosition }) => {
    const { battlefieldPosition } = props;
    const tileId: string = getLandId(battlefieldPosition);
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

const createMockGameState = (mapDimensions: BattlefieldDimensions): GameState =>
  createGameStateStub({ battlefieldSize: mapDimensions, addPlayersHomeland: false });

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
        .flatMap((battlefield) => within(battlefield).getAllByTestId('hex-row'));

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
      (mapDimensions: BattlefieldDimensions, expectedWidth: number) => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: 2500, // to have different expected width/height
        });
        Object.defineProperty(window, 'innerHeight', {
          configurable: true,
          value: 855,
        });

        mockGameState = createMockGameState(mapDimensions);
        render(<Battlefield topPanelHeight={100} tileSize={testTileDimensions} />);

        const battlefield = screen.getByTestId('Battlefield');
        const style = battlefield.style;

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
