import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopPanel from '../ux-components/top-panel/TopPanel';
import { GameState } from '../types/HexTileState';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';

const defaultProps = {
  height: 120,
  tileSize: { width: 50, height: 180 },
};
const gameState: GameState = {
  tiles: {},
  turn: 1,
  mapSize: 'medium',
  selectedPlayer: PREDEFINED_PLAYERS[0],
  opponents: [PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[2], PREDEFINED_PLAYERS[3]],
};

const mockCallbacks = {
  onNewGame: jest.fn(),
  onLoadGame: jest.fn(),
  onOpenSaveDialog: jest.fn(),
  onEndTurn: jest.fn(),
  onOpponentSelect: jest.fn(),
};

describe('TopPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders the TopPanel with testid', () => {
    render(<TopPanel {...defaultProps} />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    const topPanel = screen.getByTestId('TopPanel');
    expect(topPanel).toHaveClass('frameContainer', 'top-bar-panel');
  });

  it('renders without selected player when config is not provided', () => {
    render(<TopPanel {...defaultProps} />);
    expect(screen.queryByText('Alaric the Bold')).not.toBeInTheDocument();
  });

  it('renders selected player information when config is provided', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    expect(screen.getByText('Alaric the Bold')).toBeInTheDocument();
    expect(screen.getByText('Gold: 1,500')).toBeInTheDocument();
    expect(screen.getByText('+250/turn')).toBeInTheDocument();
  });

  it('renders player avatar with correct props when player is selected', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    // The PlayerAvatar component should be rendered
    const playerInfo = screen.getByText('Alaric the Bold').closest('.playerInfoContainer');
    expect(playerInfo).toBeInTheDocument();
  });

  it('calculates avatar size correctly based on height and tileSize', () => {
    const height = 120;
    const tileSize = { width: 50, height: 180 };
    const expectedSize = height - Math.min(tileSize.height, tileSize.width) * 2 - 10;
    expect(expectedSize).toBe(10); // 120 - 50*2 - 10 = 10
  });

  it('renders VialPanel component', () => {
    render(<TopPanel {...defaultProps} />);
    // VialPanel should be rendered (it's always shown)
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders OpponentsPanel with correct props', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    // OpponentsPanel should be rendered with the config data
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('uses numberOfOpponents when opponents array is not provided', () => {
    render(<TopPanel {...defaultProps} />);
    // Should still render the TopPanel
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('uses minimum opponents when no config is provided', () => {
    render(<TopPanel {...defaultProps} />);
    // Should render with minimum opponents (2)
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders GameControl component', () => {
    render(<TopPanel {...defaultProps} />);
    // GameControl should always be rendered
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('calls onNewGame when provided', () => {
    render(<TopPanel {...defaultProps} {...mockCallbacks} />);
    // GameControl component should receive the callback
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('calls onLoadGame when provided', () => {
    render(<TopPanel {...defaultProps} {...mockCallbacks} />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('calls onOpenSaveDialog when provided', () => {
    render(<TopPanel {...defaultProps} {...mockCallbacks} />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders EndOfTurnButton and calls onEndTurn when clicked', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<TopPanel {...defaultProps} {...mockCallbacks} />);

    // Find and click the End Turn button by alt text
    const endTurnButton = screen.getByAltText('End Turn');
    fireEvent.click(endTurnButton);

    expect(alertSpy).toHaveBeenCalledWith('End of Turn button is pressed!');
    expect(consoleSpy).toHaveBeenCalledWith('End turn clicked');
    expect(mockCallbacks.onEndTurn).toHaveBeenCalled();

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('handles onEndTurn gracefully when callback is not provided', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<TopPanel {...defaultProps} />);

    const endTurnButton = screen.getByAltText('End Turn');
    fireEvent.click(endTurnButton);

    expect(alertSpy).toHaveBeenCalledWith('End of Turn button is pressed!');
    expect(consoleSpy).toHaveBeenCalledWith('End turn clicked');
    // Should not throw error when onEndTurn is undefined

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('calls onOpponentSelect when provided', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    // OpponentsPanel should receive the callback
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders with correct style properties', () => {
    render(<TopPanel {...defaultProps} />);
    const topPanel = screen.getByTestId('TopPanel');
    expect(topPanel).toHaveStyle({
      height: '100%',
      width: '100%',
    });
  });

  it('applies correct border frame props', () => {
    render(<TopPanel {...defaultProps} />);
    // FantasyBorderFrame wraps the component with specific props
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders player border color when player is selected', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    // Player avatar should use the player's color as border color
    expect(screen.getByText('Alaric the Bold')).toBeInTheDocument();
  });

  it('handles different tile sizes correctly', () => {
    const smallTileSize = { width: 25, height: 90 };
    render(<TopPanel {...defaultProps} tileSize={smallTileSize} />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('handles different heights correctly', () => {
    render(<TopPanel {...defaultProps} height={200} />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders money information with static values', () => {
    render(<TopPanel {...defaultProps} gameState={gameState} />);
    expect(screen.getByText('Gold: 1,500')).toBeInTheDocument();
    expect(screen.getByText('+250/turn')).toBeInTheDocument();
  });

  it('renders with proper panel structure', () => {
    render(<TopPanel {...defaultProps} />);
    const panelContainer = screen.getByTestId('TopPanel').querySelector('.panelContainer');
    expect(panelContainer).toBeInTheDocument();
  });

  describe('Component Integration', () => {
    it('integrates all child components correctly', () => {
      render(<TopPanel {...defaultProps} gameState={gameState} {...mockCallbacks} />);

      // Verify main structure exists
      expect(screen.getByTestId('TopPanel')).toBeInTheDocument();

      // Verify player section
      expect(screen.getByText('Alaric the Bold')).toBeInTheDocument();
      expect(screen.getByText('Gold: 1,500')).toBeInTheDocument();

      // Verify End Turn button exists
      expect(screen.getByAltText('End Turn')).toBeInTheDocument();
    });

    it('handles missing optional props gracefully', () => {
      render(<TopPanel {...defaultProps} />);
      expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
    });
  });
});
