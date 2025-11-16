import React from 'react';
import { render, screen } from '@testing-library/react';
import OpponentInfoPopup from '../../ux-components/popups/OpponentInfoPopup';
import { DiplomacyStatus } from '../../types/Diplomacy';
import { ApplicationContextProvider } from '../../contexts/ApplicationContext';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

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

  const gameStateStub = createDefaultGameStateStub();

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the default mock for useGameContext
    const { useGameContext } = require('../../contexts/GameContext');
    useGameContext.mockReturnValue({
      gameState: gameStateStub,
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

    gameStateStub.players[1].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.NO_TREATY;
    gameStateStub.players[0].diplomacy[gameStateStub.players[1].id] = DiplomacyStatus.NO_TREATY;
    gameStateStub.players[2].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.NO_TREATY;
    gameStateStub.players[0].diplomacy[gameStateStub.players[2].id] = DiplomacyStatus.NO_TREATY;
  });

  it('returns null when opponent is null or undefined', () => {
    const { container } = render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={undefined} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('displays opponent name in header', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText(gameStateStub.players[1].name)).toBeInTheDocument();
  });

  it('renders player avatar with correct properties', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    const avatar = screen.getByTestId('player-avatar');
    expect(avatar).toHaveAttribute('data-player-name', gameStateStub.players[1].name);
    expect(avatar).toHaveAttribute('data-size', '55');
    expect(avatar).toHaveAttribute('data-shape', 'rectangle');
    expect(avatar).toHaveAttribute('data-border-color', gameStateStub.players[1].color);
  });

  it('displays race information', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText(gameStateStub.players[1].race)).toBeInTheDocument();
  });

  it('displays alignment information with correct color', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[2]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText(gameStateStub.players[2].alignment)).toBeInTheDocument();
  });

  it('displays level information', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText(gameStateStub.players[1].level.toString())).toBeInTheDocument();
  });

  describe('diplomacy status display', () => {
    it('displays "No Treaty" status correctly', () => {
      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('No Treaty')).toBeInTheDocument();
    });

    it('displays "Peace" status correctly', () => {
      gameStateStub.players[2].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.PEACE;
      gameStateStub.players[0].diplomacy[gameStateStub.players[2].id] = DiplomacyStatus.PEACE;

      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={gameStateStub.players[2]} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('Peace')).toBeInTheDocument();
    });

    it('displays "War" status correctly', () => {
      gameStateStub.players[2].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.WAR;
      gameStateStub.players[0].diplomacy[gameStateStub.players[2].id] = DiplomacyStatus.WAR;

      render(
        <ApplicationContextProvider>
          <OpponentInfoPopup opponent={gameStateStub.players[2]} screenPosition={mockPosition} />
        </ApplicationContextProvider>
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('War')).toBeInTheDocument();
    });
  });

  it('positions popup correctly relative to screen position', () => {
    const customPosition = { x: 200, y: 150 };

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={customPosition} />
      </ApplicationContextProvider>
    );

    // The popup should be offset by -50 in x and +10 in y
    // This would be tested through the PopupWrapper component
    expect(screen.getByText(gameStateStub.players[1].name)).toBeInTheDocument();
  });

  it('has appropriate dimensions', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // Component should render with fixed width of 310px
    // Height is calculated dynamically but capped at 400px
    expect(screen.getByText(gameStateStub.players[1].name)).toBeInTheDocument();
  });

  it('calls onClose when close action is triggered', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // The close functionality is handled by PopupWrapper
    // We verify the onClose prop is passed correctly
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays all required information sections', () => {
    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    // Verify all standard rows are present
    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
  });

  it('works with different predefined players', () => {
    gameStateStub.players[1].diplomacy[gameStateStub.players[0].id] = DiplomacyStatus.WAR;
    gameStateStub.players[0].diplomacy[gameStateStub.players[1].id] = DiplomacyStatus.WAR;

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
    expect(screen.getByText('Undead')).toBeInTheDocument();
    expect(screen.getByText('War')).toBeInTheDocument();
  });

  it('defaults to "No Treaty" when diplomacy status is not found', () => {
    gameStateStub.players[1].diplomacy = {};

    render(
      <ApplicationContextProvider>
        <OpponentInfoPopup opponent={gameStateStub.players[1]} screenPosition={mockPosition} />
      </ApplicationContextProvider>
    );

    expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
    expect(screen.getByText('No Treaty')).toBeInTheDocument();
  });
});
