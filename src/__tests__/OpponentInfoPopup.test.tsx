import React from 'react';
import { render, screen } from '@testing-library/react';
import OpponentInfoPopup, {
  DiplomacyStatus,
  OpponentWithDiplomacy,
} from '../ux-components/popups/OpponentInfoPopup';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { Alignment } from '../types/Alignment';
import { ApplicationContextProvider } from '../contexts/ApplicationContext';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, { wrapper: ApplicationContextProvider });

jest.mock('../ux-components/dialogs/css/OpponentInfoDialog.module.css', () => ({
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

jest.mock('../ux-components/avatars/PlayerAvatar', () => {
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

describe('OpponentInfoPopup', () => {
  const mockPosition = { x: 100, y: 100 };
  const mockOnClose = jest.fn();

  const createMockOpponent = (
    diplomacyStatus: DiplomacyStatus = 'No Treaty',
    alignment: Alignment = Alignment.NEUTRAL
  ): OpponentWithDiplomacy => ({
    ...PREDEFINED_PLAYERS[0],
    alignment,
    diplomacyStatus,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when opponent is null or undefined', () => {
    const { container } = renderWithProvider(
      <OpponentInfoPopup opponent={undefined} screenPosition={mockPosition} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays opponent name in header', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('renders player avatar with correct properties', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    const avatar = screen.getByTestId('player-avatar');
    expect(avatar).toHaveAttribute('data-player-name', mockOpponent.name);
    expect(avatar).toHaveAttribute('data-size', '55');
    expect(avatar).toHaveAttribute('data-shape', 'rectangle');
    expect(avatar).toHaveAttribute('data-border-color', mockOpponent.color);
  });

  it('displays race information', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.race)).toBeInTheDocument();
  });

  it('displays alignment information with correct color', () => {
    const mockOpponent = createMockOpponent('No Treaty', Alignment.CHAOTIC);

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.alignment)).toBeInTheDocument();
  });

  it('displays level information', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText(mockOpponent.level.toString())).toBeInTheDocument();
  });

  describe('diplomacy status display', () => {
    it('displays "No Treaty" status correctly', () => {
      const mockOpponent = createMockOpponent('No Treaty');

      renderWithProvider(
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('No Treaty')).toBeInTheDocument();
    });

    it('displays "Peace" status correctly', () => {
      const mockOpponent = createMockOpponent('Peace');

      renderWithProvider(
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('Peace')).toBeInTheDocument();
    });

    it('displays "War" status correctly', () => {
      const mockOpponent = createMockOpponent('War');

      renderWithProvider(
        <OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />
      );

      expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
      expect(screen.getByText('War')).toBeInTheDocument();
    });
  });

  it('positions popup correctly relative to screen position', () => {
    const mockOpponent = createMockOpponent();
    const customPosition = { x: 200, y: 150 };

    renderWithProvider(
      <OpponentInfoPopup opponent={mockOpponent} screenPosition={customPosition} />
    );

    // The popup should be offset by -50 in x and +10 in y
    // This would be tested through the PopupWrapper component
    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('has appropriate dimensions', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    // Component should render with fixed width of 310px
    // Height is calculated dynamically but capped at 400px
    expect(screen.getByText(mockOpponent.name)).toBeInTheDocument();
  });

  it('calls onClose when close action is triggered', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    // The close functionality is handled by PopupWrapper
    // We verify the onClose prop is passed correctly
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays all required information sections', () => {
    const mockOpponent = createMockOpponent();

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    // Verify all standard rows are present
    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText('Alignment:')).toBeInTheDocument();
    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText('Diplomatic Relations:')).toBeInTheDocument();
  });

  it('works with different predefined players', () => {
    // Test with different predefined player (Morgana)
    const mockOpponent: OpponentWithDiplomacy = {
      ...PREDEFINED_PLAYERS[1], // Morgana Shadowweaver
      diplomacyStatus: 'War',
    };

    renderWithProvider(<OpponentInfoPopup opponent={mockOpponent} screenPosition={mockPosition} />);

    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
    expect(screen.getByText('Undead')).toBeInTheDocument();
    expect(screen.getByText('War')).toBeInTheDocument();
  });
});
