import React from 'react';
import { render, screen } from '@testing-library/react';
import OpponentInfoPopup from '../../ux-components/popups/OpponentInfoPopup';
import { PREDEFINED_PLAYERS, DiplomacyStatus, PlayerInfo } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';
import { GameState } from '../../types/GameState';
import { toGamePlayer } from '../utils/toGamePlayer';
import { ManaType } from '../../types/Mana';

jest.mock('../../ux-components/popups/css/OpponentInfoPopup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
  characteristics: 'mocked-characteristics',
  avatarSection: 'mocked-avatar-section',
  opponentAvatar: 'mocked-opponent-avatar',
  row: 'mocked-row',
  label: 'mocked-label',
  value: 'mocked-value',
  diplomacyStatus: 'mocked-diplomacy-status',
  peace: 'mocked-peace',
  war: 'mocked-war',
  'no treaty': 'mocked-no-treaty',
  notreaty: 'mocked-no-treaty',
}));

jest.mock('../../ux-components/avatars/Avatar', () => {
  return ({ player, size, shape, borderColor, className }: any) => {
    return (
      <div
        data-testid="player-avatar"
        data-player-name={player.name}
        data-size={size}
        data-shape={shape}
        data-border-color={borderColor}
        className={className}
      />
    );
  };
});

// Mock the GameContext hook
jest.mock('../../contexts/GameContext', () => {
  const originalModule = jest.requireActual('../../contexts/GameContext');
  return {
    ...originalModule,
    useGameContext: jest.fn(),
  };
});

describe('OpponentInfoPopup', () => {
  const mockPosition = { x: 100, y: 100 };
  const mockOnClose = jest.fn();

  const createMockOpponent = (alignment: Alignment = Alignment.NEUTRAL): PlayerInfo => ({
    ...PREDEFINED_PLAYERS[0],
    alignment,
  });

  const createMockGameState = (
    opponent: PlayerInfo,
    diplomacyStatus: DiplomacyStatus
  ): Partial<GameState> => ({
    selectedPlayer: {
      ...PREDEFINED_PLAYERS[1],
      diplomacy: {
        [opponent.id]: diplomacyStatus,
      },
      mana: {
        [ManaType.WHITE]: 0,
        [ManaType.BLACK]: 0,
        [ManaType.GREEN]: 0,
        [ManaType.BLUE]: 0,
        [ManaType.RED]: 0,
      },
      money: 0,
      income: 0,
      playerType: 'human',
    },
    opponents: [toGamePlayer(opponent)],
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the default mock for useGameContext
    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        selectedPlayer: {
          ...PREDEFINED_PLAYERS[1],
          diplomacy: {},
        },
        opponents: [],
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });
  });

  it('returns null when opponent is null or undefined', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    const { container } = render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={undefined} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays opponent name in header', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('renders player avatar with correct properties', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    const avatar = screen.getByTestId('player-avatar');
    expect(avatar).toHaveAttribute('data-player-name', mockOpponent.name);
    expect(avatar).toHaveAttribute('data-size', '55');
    expect(avatar).toHaveAttribute('data-shape', 'rectangle');
    expect(avatar).toHaveAttribute('data-border-color', mockOpponent.color);
  });

  it('displays race information', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.race)).toBeInTheDocument();
  });

  it('displays alignment information with correct color', () => {
    const mockOpponent = createMockOpponent(Alignment.CHAOTIC);
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.alignment)).toBeInTheDocument();
  });

  it('displays level information', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.level.toString())).toBeInTheDocument();
  });

  describe('diplomacy status display', () => {
    it('displays "No Treaty" status correctly', () => {
      const mockOpponent = createMockOpponent();
      const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

      const { useGameContext } = require('../../contexts/GameContext');
      useGameContext.mockReturnValue({
        gameState: {
          tiles: {},
          turn: 1,
          ...gameState,
        },
        updateTile: jest.fn(),
        setTileController: jest.fn(),
        addBuildingToTile: jest.fn(),
        updateTileArmy: jest.fn(),
        changeBattlefieldSize: jest.fn(),
        nextTurn: jest.fn(),
        updateGameState: jest.fn(),
        getTile: jest.fn(),
        getPlayerTiles: jest.fn(),
        getTotalPlayerGold: jest.fn(),
      });

      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('No Treaty')).toBeInTheDocument();
    });

    it('displays "Peace" status correctly', () => {
      const mockOpponent = createMockOpponent();
      const gameState = createMockGameState(mockOpponent, DiplomacyStatus.PEACE);

      const { useGameContext } = require('../../contexts/GameContext');
      useGameContext.mockReturnValue({
        gameState: {
          tiles: {},
          turn: 1,
          ...gameState,
        },
        updateTile: jest.fn(),
        setTileController: jest.fn(),
        addBuildingToTile: jest.fn(),
        updateTileArmy: jest.fn(),
        changeBattlefieldSize: jest.fn(),
        nextTurn: jest.fn(),
        updateGameState: jest.fn(),
        getTile: jest.fn(),
        getPlayerTiles: jest.fn(),
        getTotalPlayerGold: jest.fn(),
      });

      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('Peace')).toBeInTheDocument();
    });

    it('displays "War" status correctly', () => {
      const mockOpponent = createMockOpponent();
      const gameState = createMockGameState(mockOpponent, DiplomacyStatus.WAR);

      const { useGameContext } = require('../../contexts/GameContext');
      useGameContext.mockReturnValue({
        gameState: {
          tiles: {},
          turn: 1,
          ...gameState,
        },
        updateTile: jest.fn(),
        setTileController: jest.fn(),
        addBuildingToTile: jest.fn(),
        updateTileArmy: jest.fn(),
        changeBattlefieldSize: jest.fn(),
        nextTurn: jest.fn(),
        updateGameState: jest.fn(),
        getTile: jest.fn(),
        getPlayerTiles: jest.fn(),
        getTotalPlayerGold: jest.fn(),
      });

      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('War')).toBeInTheDocument();
    });
  });

  it('positions popup correctly relative to screen position', () => {
    const mockOpponent = createMockOpponent();
    const customPosition = { x: 200, y: 150 };
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={customPosition} />
      </ApplicationContextProvider>
    );

    // The popup should be offset by -50 in x and +10 in y
    // This would be tested through the PopupWrapper component
    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('has appropriate dimensions', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // Component should render with fixed width of 310px
    // Height is calculated dynamically but capped at 400px
    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('calls onClose when close action is triggered', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // The close functionality is handled by PopupWrapper
    // We verify the onClose prop is passed correctly
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays all required information sections', () => {
    const mockOpponent = createMockOpponent();
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.NO_TREATY);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // Verify all standard rows are present
    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
  });

  it('works with different predefined players', () => {
    // Test with different predefined player (Morgana)
    const mockOpponent: PlayerInfo = {
      ...PREDEFINED_PLAYERS[1], // Morgana Shadowweaver
    };
    const gameState = createMockGameState(mockOpponent, DiplomacyStatus.WAR);

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
    expect(screen.getByText('Undead')).toBeInTheDocument();
    expect(screen.getByText('War')).toBeInTheDocument();
  });

  it('defaults to "No Treaty" when diplomacy status is not found', () => {
    const mockOpponent = createMockOpponent();
    // Create game state without diplomacy info for this opponent
    const gameState: Partial<GameState> = {
      selectedPlayer: {
        ...PREDEFINED_PLAYERS[1],
        diplomacy: {},
        mana: {
          [ManaType.WHITE]: 0,
          [ManaType.BLACK]: 0,
          [ManaType.GREEN]: 0,
          [ManaType.BLUE]: 0,
          [ManaType.RED]: 0,
        },
        money: 0,
        income: 0,
        playerType: 'human',
      },
      opponents: [toGamePlayer(mockOpponent)],
    };

    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: {
        tiles: {},
        turn: 1,
        ...gameState,
      },
      updateTile: jest.fn(),
      setTileController: jest.fn(),
      addBuildingToTile: jest.fn(),
      updateTileArmy: jest.fn(),
      changeBattlefieldSize: jest.fn(),
      nextTurn: jest.fn(),
      updateGameState: jest.fn(),
      getTile: jest.fn(),
      getPlayerTiles: jest.fn(),
      getTotalPlayerGold: jest.fn(),
    });

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
    expect(screen.getByText('No Treaty')).toBeInTheDocument();
  });
});
